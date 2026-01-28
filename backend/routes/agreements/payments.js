/**
 * Agreement Payments Routes
 * Handles payment requests, processing, and tracking
 */
import express from 'express';
import SponsorshipAgreement from '../../models/SponsorshipAgreement.js';
import Sponsor from '../../models/Sponsor.js';
import Club from '../../models/Club.js';
import User from '../../models/User.js';
import PaymentTransaction from '../../models/PaymentTransaction.js';
import sponsorEmails from '../../utils/sponsorEmails.js';

const router = express.Router();

/**
 * GET /api/agreements/:id/payments
 * Get all payment transactions for an agreement
 */
router.get('/:id/payments', async (req, res) => {
    try {
        const { firebaseUid } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Get transactions
        const transactions = await PaymentTransaction.find({ agreement: req.params.id })
            .populate('requestedBy', 'name email')
            .populate('processedBy', 'name email')
            .populate('receipts.uploadedBy', 'name')
            .sort({ createdAt: -1 });

        // Get summary
        const summary = await PaymentTransaction.getSummaryForAgreement(req.params.id);

        res.json({
            transactions,
            summary,
            paymentSchedule: agreement.financialTerms?.paymentSchedule || []
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Failed to get payments' });
    }
});

/**
 * POST /api/agreements/:id/payments/request
 * Club manager requests fund release for a milestone
 */
router.post('/:id/payments/request', async (req, res) => {
    try {
        const { firebaseUid, milestoneIndex, amount, notes } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only club managers can request funds
        const club = await Club.findOne({ manager: user._id });
        if (!club) {
            return res.status(403).json({ error: 'Only club managers can request funds' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id)
            .populate('sponsor.sponsorRef');

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify club owns this agreement
        if (agreement.club.clubRef.toString() !== club._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (agreement.status !== 'active') {
            return res.status(400).json({ error: 'Agreement is not active' });
        }

        // Get milestone details
        let milestoneName = 'General Fund Request';
        let requestAmount = amount;

        if (milestoneIndex >= 0 && agreement.financialTerms?.paymentSchedule?.[milestoneIndex]) {
            const milestone = agreement.financialTerms.paymentSchedule[milestoneIndex];
            milestoneName = milestone.milestone;
            requestAmount = requestAmount || milestone.amount;

            // Check if milestone is already paid
            if (milestone.status === 'paid') {
                return res.status(400).json({
                    error: 'This milestone has already been paid'
                });
            }

            // Check if there's an active request (pending, approved, processing)
            const activeRequest = await PaymentTransaction.findOne({
                agreement: agreement._id,
                milestoneIndex: milestoneIndex,
                status: { $in: ['pending', 'approved', 'processing'] }
            });

            if (activeRequest) {
                return res.status(400).json({
                    error: 'A request for this milestone is already in progress',
                    existingRequest: activeRequest._id
                });
            }
        } else {
            // For general fund requests (no milestone), amount is required
            if (!requestAmount || requestAmount <= 0) {
                return res.status(400).json({
                    error: 'Amount is required for general fund requests'
                });
            }
        }

        // Create transaction
        const transaction = new PaymentTransaction({
            agreement: agreement._id,
            type: 'fund-request',
            amount: requestAmount,
            milestoneIndex: milestoneIndex ?? -1,
            milestoneName,
            status: 'pending',
            requestedBy: user._id,
            requestNotes: notes
        });

        await transaction.save();

        // Update agreement history
        agreement.addHistory('payment-requested', user._id,
            `Fund request of ₹${requestAmount.toLocaleString()} for "${milestoneName}"`
        );
        await agreement.save();

        // Send email to sponsor
        try {
            const sponsor = agreement.sponsor.sponsorRef;
            if (sponsor?.contactEmail && sponsorEmails.notifyPaymentRequest) {
                await sponsorEmails.notifyPaymentRequest(
                    sponsor.contactEmail,
                    sponsor.contactPerson,
                    club.name,
                    requestAmount,
                    milestoneName
                );
            }
        } catch (emailError) {
            console.error('Failed to send payment request email:', emailError);
        }

        res.status(201).json({
            message: 'Fund request submitted successfully',
            transaction
        });
    } catch (error) {
        console.error('Request payment error:', error);
        res.status(500).json({ error: 'Failed to submit fund request' });
    }
});

/**
 * PUT /api/agreements/:id/payments/:txId/process
 * Sponsor approves or rejects a fund request
 */
router.put('/:id/payments/:txId/process', async (req, res) => {
    try {
        const { firebaseUid, action, notes, rejectionReason } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only sponsors can process requests
        const sponsor = await Sponsor.findOne({ user: user._id });
        if (!sponsor) {
            return res.status(403).json({ error: 'Only sponsors can process fund requests' });
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

        if (transaction.status !== 'pending') {
            return res.status(400).json({ error: 'Transaction is not pending' });
        }

        if (action === 'approve') {
            transaction.updateStatus('approved', user._id, notes);
            agreement.addHistory('payment-approved', user._id,
                `Fund request of ₹${transaction.amount.toLocaleString()} approved`
            );
        } else {
            transaction.updateStatus('rejected', user._id, notes);
            transaction.rejectionReason = rejectionReason || 'Request rejected';
            agreement.addHistory('payment-rejected', user._id,
                `Fund request rejected: ${rejectionReason || 'No reason provided'}`
            );
        }

        await transaction.save();
        await agreement.save();

        // Send notification email to club
        try {
            const clubManager = await User.findById(agreement.club.clubRef.manager);
            if (clubManager?.email && sponsorEmails.notifyPaymentProcessed) {
                await sponsorEmails.notifyPaymentProcessed(
                    clubManager.email,
                    clubManager.name,
                    sponsor.companyName,
                    transaction.amount,
                    action,
                    rejectionReason
                );
            }
        } catch (emailError) {
            console.error('Failed to send payment processed email:', emailError);
        }

        res.json({
            message: `Fund request ${action}d successfully`,
            transaction
        });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({ error: 'Failed to process fund request' });
    }
});

/**
 * PUT /api/agreements/:id/payments/:txId/complete
 * Mark payment as completed (sponsor confirms payment made)
 */
router.put('/:id/payments/:txId/complete', async (req, res) => {
    try {
        const { firebaseUid, paymentMethod, transactionReference, notes } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only sponsors can mark as complete
        const sponsor = await Sponsor.findOne({ user: user._id });
        if (!sponsor) {
            return res.status(403).json({ error: 'Only sponsors can mark payments as complete' });
        }

        const agreement = await SponsorshipAgreement.findById(id);
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

        if (!['approved', 'processing'].includes(transaction.status)) {
            return res.status(400).json({ error: 'Transaction must be approved first' });
        }

        transaction.updateStatus('completed', user._id, notes);
        transaction.paymentMethod = paymentMethod || 'bank-transfer';
        transaction.transactionReference = transactionReference;

        await transaction.save();

        // Update milestone status in agreement if applicable
        if (transaction.milestoneIndex >= 0 && agreement.financialTerms?.paymentSchedule?.[transaction.milestoneIndex]) {
            agreement.financialTerms.paymentSchedule[transaction.milestoneIndex].status = 'paid';
            agreement.financialTerms.paymentSchedule[transaction.milestoneIndex].paidAt = new Date();
        }

        agreement.addHistory('payment-completed', user._id,
            `Payment of ₹${transaction.amount.toLocaleString()} completed via ${paymentMethod || 'bank transfer'}`
        );
        await agreement.save();

        res.json({
            message: 'Payment marked as completed',
            transaction
        });
    } catch (error) {
        console.error('Complete payment error:', error);
        res.status(500).json({ error: 'Failed to complete payment' });
    }
});

/**
 * POST /api/agreements/:id/payments/:txId/receipt
 * Upload receipt for a transaction
 */
router.post('/:id/payments/:txId/receipt', async (req, res) => {
    try {
        const { firebaseUid, url, fileName, fileType, description } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!url) {
            return res.status(400).json({ error: 'Receipt URL is required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify access (both parties can upload receipts)
        const club = await Club.findOne({ manager: user._id });
        const sponsor = await Sponsor.findOne({ user: user._id });

        const isClubManager = club && agreement.club.clubRef.toString() === club._id.toString();
        const isSponsor = sponsor && agreement.sponsor.sponsorRef.toString() === sponsor._id.toString();

        if (!isClubManager && !isSponsor && user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const transaction = await PaymentTransaction.findById(txId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        transaction.addReceipt(user._id, {
            url,
            fileName: fileName || 'receipt',
            fileType: fileType || 'document',
            description
        });

        await transaction.save();

        agreement.addHistory('receipt-uploaded', user._id,
            `Receipt uploaded for payment of ₹${transaction.amount.toLocaleString()}`
        );
        await agreement.save();

        res.json({
            message: 'Receipt uploaded successfully',
            transaction
        });
    } catch (error) {
        console.error('Upload receipt error:', error);
        res.status(500).json({ error: 'Failed to upload receipt' });
    }
});

/**
 * GET /api/agreements/:id/payments/summary
 * Get payment summary for an agreement
 */
router.get('/:id/payments/summary', async (req, res) => {
    try {
        const { firebaseUid } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        const summary = await PaymentTransaction.getSummaryForAgreement(req.params.id);

        // Add agreement total for context
        summary.agreementTotal = agreement.financialTerms?.totalAmount || 0;
        summary.remaining = summary.agreementTotal - summary.totalCompleted;

        res.json(summary);
    } catch (error) {
        console.error('Get payment summary error:', error);
        res.status(500).json({ error: 'Failed to get payment summary' });
    }
});

export default router;
