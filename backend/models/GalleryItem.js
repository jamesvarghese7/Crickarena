import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true,
        index: true
    },

    // Stored image binary in MongoDB (same pattern as Club.logo)
    image: {
        data: Buffer,
        contentType: String
    },

    caption: {
        type: String,
        maxlength: 200,
        trim: true
    },

    category: {
        type: String,
        enum: ['team', 'match', 'training', 'trophy', 'event', 'other'],
        default: 'other'
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    uploaderRole: {
        type: String,
        enum: ['clubManager', 'player', 'coach'],
        required: true
    },

    // Moderation status
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending'
    },

    isFeatured: {
        type: Boolean,
        default: false
    },

    // Moderation tracking
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: Date,
    rejectionReason: String

}, { timestamps: true });

// Compound indexes for common queries
galleryItemSchema.index({ club: 1, status: 1, createdAt: -1 });
galleryItemSchema.index({ club: 1, isFeatured: 1 });

export default mongoose.model('GalleryItem', galleryItemSchema);
