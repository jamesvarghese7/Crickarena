import mongoose from 'mongoose';

const sponsorshipAgreementSchema = new mongoose.Schema({
    // Reference to the deal this agreement is for
    deal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SponsorshipDeal',
        required: true,
        unique: true
    },

    // Auto-generated agreement number
    agreementNumber: {
        type: String,
        unique: true
    },

    // Sponsor party details
    sponsor: {
        sponsorRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sponsor',
            required: true
        },
        signatory: {
            name: String,
            designation: String,
            email: String
        },
        signedAt: Date,
        signature: String, // Base64 encoded signature or typed name
        ipAddress: String
    },

    // Club party details
    club: {
        clubRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Club',
            required: true
        },
        signatory: {
            name: String,
            designation: String,
            email: String
        },
        signedAt: Date,
        signature: String,
        ipAddress: String
    },

    // Financial terms
    financialTerms: {
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR'
        },
        paymentSchedule: [{
            milestone: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true,
                min: 0
            },
            dueDate: Date,
            status: {
                type: String,
                enum: ['pending', 'paid', 'overdue'],
                default: 'pending'
            },
            paidAt: Date,
            transactionRef: String
        }]
    },

    // Deliverables - Club's obligations to sponsor
    deliverables: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        responsible: {
            type: String,
            enum: ['sponsor', 'club'],
            default: 'club'
        },
        dueDate: Date,
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'verified'],
            default: 'pending'
        },
        completedAt: Date,
        verifiedAt: Date,
        evidence: [{
            type: {
                type: String,
                enum: ['image', 'link', 'document']
            },
            url: String,
            description: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        notes: String
    }],

    // Contract terms
    terms: {
        // Non-compete clause
        nonCompete: {
            enabled: { type: Boolean, default: false },
            description: String
        },
        // Exclusivity
        exclusivity: {
            type: String,
            enum: ['exclusive', 'non-exclusive', 'category-exclusive'],
            default: 'non-exclusive'
        },
        exclusivityCategory: String,
        // Termination
        termination: {
            noticePeriodDays: { type: Number, default: 30 },
            penaltyPercentage: { type: Number, default: 0 },
            conditions: String
        },
        // Renewal
        renewal: {
            autoRenew: { type: Boolean, default: false },
            renewalPeriodMonths: Number,
            renewalTerms: String
        },
        // Additional custom terms
        additionalTerms: String
    },

    // Contract period
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },

    // Agreement status
    status: {
        type: String,
        enum: [
            'draft',           // Being created
            'pending-sponsor', // Waiting for sponsor signature
            'pending-club',    // Waiting for club signature
            'active',          // Both signed, in effect
            'completed',       // Term ended successfully
            'terminated',      // Ended early
            'expired'          // Past end date without completion
        ],
        default: 'draft'
    },

    // Generated PDF document
    generatedPdf: {
        data: Buffer,
        contentType: { type: String, default: 'application/pdf' },
        generatedAt: Date,
        version: { type: Number, default: 1 }
    },

    // Termination details
    terminatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    terminatedAt: Date,
    terminationReason: String,

    // Audit trail
    history: [{
        action: {
            type: String,
            enum: [
                'created', 'updated', 'sent-to-sponsor', 'sponsor-signed',
                'sent-to-club', 'club-signed', 'activated', 'deliverable-updated',
                'payment-recorded', 'payment-requested', 'payment-approved',
                'payment-rejected', 'payment-completed', 'receipt-uploaded',
                'terminated', 'completed', 'renewed'
            ]
        },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        details: String,
        metadata: mongoose.Schema.Types.Mixed
    }],

    // Created by
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Pre-save hook to generate agreement number
sponsorshipAgreementSchema.pre('save', async function (next) {
    if (!this.agreementNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('SponsorshipAgreement').countDocuments({
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });
        this.agreementNumber = `AGR-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Virtual to check if agreement is fully signed
sponsorshipAgreementSchema.virtual('isFullySigned').get(function () {
    return !!(this.sponsor?.signedAt && this.club?.signedAt);
});

// Virtual to check if agreement is currently active
sponsorshipAgreementSchema.virtual('isCurrentlyActive').get(function () {
    if (this.status !== 'active') return false;
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
});

// Method to add history entry
sponsorshipAgreementSchema.methods.addHistory = function (action, userId, details, metadata) {
    this.history.push({
        action,
        performedBy: userId,
        timestamp: new Date(),
        details,
        metadata
    });
};

// Method to check deliverables completion
sponsorshipAgreementSchema.methods.getDeliverablesProgress = function () {
    const total = this.deliverables.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 100 };

    const completed = this.deliverables.filter(
        d => d.status === 'completed' || d.status === 'verified'
    ).length;

    return {
        total,
        completed,
        percentage: Math.round((completed / total) * 100)
    };
};

// Indexes
sponsorshipAgreementSchema.index({ deal: 1 });
sponsorshipAgreementSchema.index({ 'sponsor.sponsorRef': 1, status: 1 });
sponsorshipAgreementSchema.index({ 'club.clubRef': 1, status: 1 });
sponsorshipAgreementSchema.index({ status: 1, startDate: 1, endDate: 1 });
sponsorshipAgreementSchema.index({ agreementNumber: 1 });
sponsorshipAgreementSchema.index({ createdBy: 1 });

export default mongoose.model('SponsorshipAgreement', sponsorshipAgreementSchema);
