import mongoose from 'mongoose';

const sponsorshipDealSchema = new mongoose.Schema({
    // References
    opportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SponsorshipOpportunity',
        required: true
    },
    sponsor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sponsor',
        required: true
    },

    // Deal terms
    proposedAmount: {
        type: Number,
        required: true,
        min: 0
    },
    agreedAmount: {
        type: Number,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },

    // Status workflow
    status: {
        type: String,
        enum: [
            'applied',       // Initial application
            'under-review',  // Being reviewed by organizer
            'negotiating',   // Price/terms negotiation
            'approved',      // Approved, pending activation
            'rejected',      // Application rejected
            'active',        // Currently active sponsorship
            'completed',     // Sponsorship term ended
            'cancelled'      // Cancelled by either party
        ],
        default: 'applied'
    },

    // Application details
    applicationMessage: {
        type: String,
        maxlength: 2000
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },

    // Review details
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewNotes: String,
    rejectionReason: String,

    // Negotiation history
    negotiations: [{
        proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        message: String,
        createdAt: { type: Date, default: Date.now }
    }],

    // Contract period
    startDate: Date,
    endDate: Date,

    // Contract document (if uploaded)
    contract: {
        data: Buffer,
        contentType: String,
        fileName: String,
        uploadedAt: Date
    },

    // Payment tracking (for future payment integration)
    payment: {
        status: {
            type: String,
            enum: ['pending', 'partial', 'paid', 'refunded', 'not-required'],
            default: 'not-required'
        },
        paidAmount: { type: Number, default: 0 },
        paymentDate: Date,
        transactionId: String,
        invoiceNumber: String
    },

    // Analytics for this deal
    analytics: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        lastUpdated: Date
    },

    // Notes and communication
    internalNotes: String,

    // Cancellation details
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: Date,
    cancellationReason: String
}, { timestamps: true });

// Compound index for unique applications
sponsorshipDealSchema.index({ opportunity: 1, sponsor: 1 }, { unique: true });

// Other indexes
sponsorshipDealSchema.index({ sponsor: 1, status: 1 });
sponsorshipDealSchema.index({ status: 1, appliedAt: -1 });
sponsorshipDealSchema.index({ startDate: 1, endDate: 1 });

// Virtual to check if deal is currently active
sponsorshipDealSchema.virtual('isCurrentlyActive').get(function () {
    if (this.status !== 'active') return false;
    const now = new Date();
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    return true;
});

// Method to calculate deal value
sponsorshipDealSchema.methods.getDealValue = function () {
    return this.agreedAmount || this.proposedAmount;
};

export default mongoose.model('SponsorshipDeal', sponsorshipDealSchema);
