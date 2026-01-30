import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
    // Link to user account
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Company information
    companyName: {
        type: String,
        required: true,
        trim: true
    },

    // Logo storage
    logo: {
        data: Buffer,
        contentType: String
    },
    logoUrl: String,

    // Business details
    industry: {
        type: String,
        enum: ['sports', 'finance', 'healthcare', 'technology', 'fmcg', 'automobile', 'media', 'education', 'real-estate', 'hospitality', 'retail', 'other'],
        default: 'other'
    },
    website: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        maxlength: 1000
    },

    // Contact information
    contactPerson: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    contactPhone: {
        type: String,
        validate: {
            validator: function (v) {
                if (!v) return true;
                return /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ''));
            },
            message: 'Please enter a valid Indian phone number'
        }
    },

    // Address
    address: {
        street: String,
        city: String,
        district: String,
        state: { type: String, default: 'Kerala' },
        pincode: String
    },

    // Budget preferences for sponsorships
    budget: {
        min: { type: Number, default: 10000, min: 0 },
        max: { type: Number, default: 500000, min: 0 }
    },

    // Preferred sponsorship types
    preferredTypes: [{
        type: String,
        enum: [
            'tournament-title',
            'tournament-main',
            'tournament-associate',
            'club-jersey',
            'club-equipment',
            'club-training-partner',
            'club-official-partner'
        ]
    }],

    // Preferred districts/regions
    preferredDistricts: [{ type: String }],

    // Verification status
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'suspended'],
        default: 'pending'
    },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
    suspensionReason: String,

    // Analytics aggregates (updated periodically)
    analytics: {
        totalDeals: { type: Number, default: 0 },
        activeDeals: { type: Number, default: 0 },
        completedDeals: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        totalImpressions: { type: Number, default: 0 },
        totalClicks: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Indexes for better query performance
sponsorSchema.index({ status: 1, createdAt: -1 });
sponsorSchema.index({ 'address.district': 1 });
sponsorSchema.index({ industry: 1 });

export default mongoose.model('Sponsor', sponsorSchema);
