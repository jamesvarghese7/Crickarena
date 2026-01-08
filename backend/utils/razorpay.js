import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
let razorpayInstance = null;

function getRazorpay() {
    if (razorpayInstance) return razorpayInstance;

    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.warn('⚠️ Razorpay credentials not configured');
        return null;
    }

    razorpayInstance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET
    });

    console.log('✅ Razorpay initialized');
    return razorpayInstance;
}

/**
 * Create a Razorpay order for payment
 */
export async function createOrder(amount, currency = 'INR', receipt, notes = {}) {
    const razorpay = getRazorpay();
    if (!razorpay) {
        throw new Error('Razorpay not configured');
    }

    const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt,
        notes
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw error;
    }
}

/**
 * Verify payment signature
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
    const { RAZORPAY_KEY_SECRET } = process.env;

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    return expectedSignature === signature;
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchPayment(paymentId) {
    const razorpay = getRazorpay();
    if (!razorpay) {
        throw new Error('Razorpay not configured');
    }

    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Razorpay fetch payment error:', error);
        throw error;
    }
}

/**
 * Generate auto receipt number
 */
export function generateReceiptNumber(transactionId, agreementNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const shortId = transactionId.toString().slice(-6).toUpperCase();
    return `RCP-${agreementNumber || 'GEN'}-${shortId}-${timestamp}`;
}

/**
 * Generate receipt HTML for PDF generation
 */
export function generateReceiptHtml(receiptData) {
    const {
        receiptNumber,
        amount,
        currency = 'INR',
        paymentMethod,
        transactionReference,
        paidAt,
        sponsorName,
        clubName,
        agreementNumber,
        milestoneName,
        paymentId
    } = receiptData;

    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount);

    const formattedDate = new Date(paidAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Receipt - ${receiptNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 40px; }
        .receipt { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 5px; }
        .header p { opacity: 0.9; }
        .success-badge { background: white; color: #10B981; padding: 8px 20px; border-radius: 20px; display: inline-block; margin-top: 15px; font-weight: 600; }
        .content { padding: 30px; }
        .receipt-number { text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px; margin-bottom: 25px; }
        .receipt-number span { color: #6B7280; font-size: 14px; }
        .receipt-number strong { display: block; font-size: 18px; color: #111827; margin-top: 5px; }
        .amount-box { text-align: center; padding: 25px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 12px; margin-bottom: 25px; }
        .amount-box span { color: #065F46; font-size: 14px; }
        .amount-box strong { display: block; font-size: 36px; color: #10B981; margin-top: 5px; }
        .details { border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
        .detail-row { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #E5E7EB; }
        .detail-row:last-child { border-bottom: none; }
        .detail-row span:first-child { color: #6B7280; }
        .detail-row span:last-child { font-weight: 500; color: #111827; }
        .footer { text-align: center; padding: 20px 30px 30px; color: #9CA3AF; font-size: 13px; }
        .footer img { height: 30px; margin-bottom: 10px; }
        .watermark { text-align: center; margin-top: 20px; padding: 10px; background: #f9fafb; border-radius: 8px; color: #6B7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>🏏 CrickArena</h1>
            <p>Sponsorship Payment Receipt</p>
            <div class="success-badge">✓ Payment Successful</div>
        </div>
        
        <div class="content">
            <div class="receipt-number">
                <span>Receipt Number</span>
                <strong>${receiptNumber}</strong>
            </div>
            
            <div class="amount-box">
                <span>Amount Paid</span>
                <strong>${formattedAmount}</strong>
            </div>
            
            <div class="details">
                <div class="detail-row">
                    <span>Date & Time</span>
                    <span>${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span>Sponsor</span>
                    <span>${sponsorName}</span>
                </div>
                <div class="detail-row">
                    <span>Club</span>
                    <span>${clubName}</span>
                </div>
                <div class="detail-row">
                    <span>Agreement</span>
                    <span>${agreementNumber}</span>
                </div>
                <div class="detail-row">
                    <span>Milestone</span>
                    <span>${milestoneName}</span>
                </div>
                <div class="detail-row">
                    <span>Payment Method</span>
                    <span>${paymentMethod || 'Online Payment'}</span>
                </div>
                ${paymentId ? `
                <div class="detail-row">
                    <span>Transaction ID</span>
                    <span>${paymentId}</span>
                </div>
                ` : ''}
                ${transactionReference ? `
                <div class="detail-row">
                    <span>Reference</span>
                    <span>${transactionReference}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="watermark">
                This is a computer-generated receipt and does not require a signature.
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for your sponsorship!</p>
            <p>For queries, contact support@crickarena.com</p>
        </div>
    </div>
</body>
</html>
    `;
}

export default {
    createOrder,
    verifyPaymentSignature,
    fetchPayment,
    generateReceiptNumber,
    generateReceiptHtml,
    getRazorpay
};
