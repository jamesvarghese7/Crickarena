/**
 * Agreement Razorpay Routes
 * Handles Razorpay payment integration
 */
import express from 'express';
import SponsorshipAgreement from '../../models/SponsorshipAgreement.js';
import Sponsor from '../../models/Sponsor.js';
import User from '../../models/User.js';
import PaymentTransaction from '../../models/PaymentTransaction.js';
import razorpayUtils from '../../utils/razorpay.js';

const router = express.Router();

/**
 * POST /api/agreements/:id/payments/:txId/create-order
 * Create Razorpay order for a payment transaction
 */
router.post('/:id/payments/:txId/create-order', async (req, res) => {
    try {
        const { firebaseUid } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only sponsors can make payments
        const sponsor = await Sponsor.findOne({ user: user._id });
        if (!sponsor) {
            return res.status(403).json({ error: 'Only sponsors can make payments' });
        }

        const agreement = await SponsorshipAgreement.findById(id)
            .populate('club.clubRef');
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify sponsor owns this agreement
        if (agreement.sponsor.sponsorRef.toString() !== sponsor._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const transaction = await PaymentTransaction.findById(txId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status !== 'approved') {
            return res.status(400).json({ error: 'Only approved transactions can be paid' });
        }

        // Generate receipt number for Razorpay
        const receiptId = razorpayUtils.generateReceiptNumber(transaction._id, agreement.agreementNumber);

        // Create Razorpay order
        const order = await razorpayUtils.createOrder(
            transaction.amount,
            'INR',
            receiptId,
            {
                agreementId: id,
                transactionId: txId,
                sponsorId: sponsor._id.toString(),
                milestoneName: transaction.milestoneName
            }
        );

        // Store order info in transaction
        transaction.razorpayOrderId = order.id;
        await transaction.save();

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: receiptId,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create Razorpay order error:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment order' });
    }
});

/**
 * POST /api/agreements/:id/payments/:txId/verify-payment
 * Verify Razorpay payment and complete transaction
 */
router.post('/:id/payments/:txId/verify-payment', async (req, res) => {
    try {
        const { firebaseUid, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification data required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify payment signature
        const isValid = razorpayUtils.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        const agreement = await SponsorshipAgreement.findById(id)
            .populate('sponsor.sponsorRef')
            .populate('club.clubRef');
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        const sponsor = await Sponsor.findById(agreement.sponsor.sponsorRef);
        const transaction = await PaymentTransaction.findById(txId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await razorpayUtils.fetchPayment(razorpay_payment_id);

        // Update transaction
        transaction.updateStatus('completed', user._id, 'Payment verified via Razorpay');
        transaction.paymentMethod = paymentDetails.method || 'razorpay';
        transaction.transactionReference = razorpay_payment_id;
        transaction.razorpayPaymentId = razorpay_payment_id;

        // Generate auto receipt
        const receiptNumber = razorpayUtils.generateReceiptNumber(transaction._id, agreement.agreementNumber);
        const receiptHtml = razorpayUtils.generateReceiptHtml({
            receiptNumber,
            amount: transaction.amount,
            paymentMethod: paymentDetails.method || 'Online Payment',
            transactionReference: razorpay_payment_id,
            paidAt: new Date(),
            sponsorName: sponsor?.companyName || 'Sponsor',
            clubName: agreement.club?.clubRef?.name || 'Club',
            agreementNumber: agreement.agreementNumber,
            milestoneName: transaction.milestoneName,
            paymentId: razorpay_payment_id
        });

        // Add auto-generated receipt to transaction
        transaction.addReceipt(user._id, {
            url: `data:text/html;base64,${Buffer.from(receiptHtml).toString('base64')}`,
            fileName: `receipt-${receiptNumber}.html`,
            fileType: 'html',
            description: `Auto-generated receipt - ${receiptNumber}`
        });
        transaction.invoice = {
            number: receiptNumber,
            generatedAt: new Date()
        };

        await transaction.save();

        // Update milestone status in agreement
        // Update milestone status in agreement
        if (transaction.milestoneIndex !== undefined && transaction.milestoneIndex !== null && transaction.milestoneIndex >= 0) {
            const index = Number(transaction.milestoneIndex);
            if (agreement.financialTerms?.paymentSchedule?.[index]) {
                agreement.financialTerms.paymentSchedule[index].status = 'paid';
                agreement.financialTerms.paymentSchedule[index].paidAt = new Date();
                agreement.markModified('financialTerms.paymentSchedule');
            }
        }

        agreement.addHistory('payment-completed', user._id,
            `Payment of ₹${transaction.amount.toLocaleString()} completed via Razorpay (${razorpay_payment_id})`
        );
        await agreement.save();

        res.json({
            success: true,
            message: 'Payment verified and completed successfully',
            transaction,
            receiptNumber
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

/**
 * GET /api/agreements/:id/payments/:txId/receipt
 * Get auto-generated receipt for a transaction
 */
router.get('/:id/payments/:txId/receipt', async (req, res) => {
    try {
        const { firebaseUid } = req.query;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const transaction = await PaymentTransaction.findById(txId)
            .populate('requestedBy', 'name');
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status !== 'completed') {
            return res.status(400).json({ error: 'Receipt only available for completed payments' });
        }

        const agreement = await SponsorshipAgreement.findById(id)
            .populate('sponsor.sponsorRef')
            .populate('club.clubRef');

        const sponsor = await Sponsor.findById(agreement.sponsor.sponsorRef);

        const receiptNumber = transaction.invoice?.number ||
            razorpayUtils.generateReceiptNumber(transaction._id, agreement.agreementNumber);

        const receiptHtml = razorpayUtils.generateReceiptHtml({
            receiptNumber,
            amount: transaction.amount,
            paymentMethod: transaction.paymentMethod || 'Online Payment',
            transactionReference: transaction.transactionReference || transaction.razorpayPaymentId,
            paidAt: transaction.completedAt || transaction.updatedAt,
            sponsorName: sponsor?.companyName || 'Sponsor',
            clubName: agreement.club?.clubRef?.name || 'Club',
            agreementNumber: agreement.agreementNumber,
            milestoneName: transaction.milestoneName,
            paymentId: transaction.razorpayPaymentId
        });

        res.setHeader('Content-Type', 'text/html');
        res.send(receiptHtml);
    } catch (error) {
        console.error('Get receipt error:', error);
        res.status(500).json({ error: 'Failed to get receipt' });
    }
});

export default router;
