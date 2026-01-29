import mongoose from 'mongoose';

const sponsorshipOpportunitySchema = new mongoose.Schema({
    // What is being sponsored
    targetType: {
        type: String,
        enum: ['tournament', 'club'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetTypeRef'
    },
    // Virtual field for proper population
    targetTypeRef: {
        type: String,
        default: function () {
            return this.targetType === 'tournament' ? 'Tournament' : 'Club';
        }
    },

    // Opportunity details
    tier: {
        type: String,
        required: true,
        trim: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        maxlength: 2000
    },

    // Benefits offered to sponsor
    benefits: [{
        type: String,
        trim: true
    }],

    // Pricing
    askingPrice: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    negotiable: {
        type: Boolean,
        default: true
    },

    // Availability
    status: {
        type: String,
        enum: ['open', 'pending', 'filled', 'closed', 'expired'],
        default: 'open'
    },

    // Visibility settings
    visibility: {
        type: String,
        enum: ['public', 'private', 'invite-only'],
        default: 'public'
    },

    // Dates
    validFrom: {
        type: Date,
        default: Date.now
    },
    validTo: Date,

    // For tournament sponsorships - specific match association
    matchIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    }],

    // Maximum sponsors allowed for this tier (e.g., only 1 title sponsor)
    maxSponsors: {
        type: Number,
        default: 1,
        min: 1
    },
    currentSponsors: {
        type: Number,
        default: 0
    },

    // Analytics for this opportunity
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },

    // Creator
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Auto-set targetTypeRef based on targetType
sponsorshipOpportunitySchema.pre('save', function (next) {
    this.targetTypeRef = this.targetType === 'tournament' ? 'Tournament' : 'Club';

    // Validate dates
    if (this.validFrom && this.validTo && new Date(this.validTo) <= new Date(this.validFrom)) {
        return next(new Error('Valid To date must be after Valid From date'));
    }

    next();
});

// Check if opportunity is still available
sponsorshipOpportunitySchema.methods.isAvailable = function () {
    if (this.status !== 'open') return false;
    if (this.currentSponsors >= this.maxSponsors) return false;
    if (this.validTo && new Date() > this.validTo) return false;
    return true;
};

// Indexes for better query performance
sponsorshipOpportunitySchema.index({ targetType: 1, status: 1 });
sponsorshipOpportunitySchema.index({ targetId: 1, tier: 1 });
sponsorshipOpportunitySchema.index({ status: 1, validTo: 1 });
sponsorshipOpportunitySchema.index({ askingPrice: 1 });
sponsorshipOpportunitySchema.index({ createdBy: 1 });

export default mongoose.model('SponsorshipOpportunity', sponsorshipOpportunitySchema);
