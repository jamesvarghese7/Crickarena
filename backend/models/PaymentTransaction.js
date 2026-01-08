import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema({
    // Reference to the agreement
    agreement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SponsorshipAgreement',
        required: true,
        index: true
    },

    // Transaction type
    type: {
        type: String,
        enum: ['fund-request', 'payment', 'refund', 'adjustment'],
        required: true
    },

    // Amount details
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },

    // Related milestone from agreement's payment schedule
    milestoneIndex: {
        type: Number,
        default: -1 // -1 means not related to specific milestone
    },
    milestoneName: String,

    // Status tracking
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },

    // Request details
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    requestNotes: String,

    // Processing details
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: Date,
    processNotes: String,
    rejectionReason: String,

    // Completion details
    completedAt: Date,
    completionNotes: String,

    // Payment method (for tracking)
    paymentMethod: {
        type: String,
        enum: ['bank-transfer', 'upi', 'cheque', 'cash', 'razorpay', 'card', 'netbanking', 'wallet', 'emi', 'paylater', 'other'],
        default: 'bank-transfer'
    },
    transactionReference: String, // Bank reference number, UPI ID, etc.

    // Razorpay integration
    razorpayOrderId: String,
    razorpayPaymentId: String,

    // Receipts/Documents
    receipts: [{
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        url: String,
        fileName: String,
        fileType: String,
        description: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Invoice (if generated)
    invoice: {
        number: String,
        generatedAt: Date,
        url: String
    }

}, { timestamps: true });

// Indexes for efficient queries
paymentTransactionSchema.index({ agreement: 1, status: 1 });
paymentTransactionSchema.index({ requestedBy: 1 });
paymentTransactionSchema.index({ createdAt: -1 });

// Virtual: Check if transaction is actionable
paymentTransactionSchema.virtual('isActionable').get(function () {
    return ['pending', 'approved', 'processing'].includes(this.status);
});

// Method: Update status with audit
paymentTransactionSchema.methods.updateStatus = function (newStatus, userId, notes) {
    this.status = newStatus;

    if (newStatus === 'approved' || newStatus === 'rejected') {
        this.processedBy = userId;
        this.processedAt = new Date();
        this.processNotes = notes;
    }

    if (newStatus === 'completed') {
        this.completedAt = new Date();
        this.completionNotes = notes;
    }
};

// Method: Add receipt
paymentTransactionSchema.methods.addReceipt = function (userId, receiptData) {
    this.receipts.push({
        uploadedBy: userId,
        url: receiptData.url,
        fileName: receiptData.fileName,
        fileType: receiptData.fileType,
        description: receiptData.description,
        uploadedAt: new Date()
    });
};

// Static: Get summary for agreement
paymentTransactionSchema.statics.getSummaryForAgreement = async function (agreementId) {
    const result = await this.aggregate([
        { $match: { agreement: new mongoose.Types.ObjectId(agreementId) } },
        {
            $group: {
                _id: '$status',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);

    const summary = {
        totalRequested: 0,
        totalApproved: 0,
        totalCompleted: 0,
        totalPending: 0,
        transactionCount: 0
    };

    result.forEach(r => {
        summary.transactionCount += r.count;
        if (r._id === 'pending') summary.totalPending = r.total;
        if (r._id === 'approved' || r._id === 'processing') summary.totalApproved += r.total;
        if (r._id === 'completed') summary.totalCompleted = r.total;
        summary.totalRequested += r.total;
    });

    return summary;
};

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);
export default PaymentTransaction;
