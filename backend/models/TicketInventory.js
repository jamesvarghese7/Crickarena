import mongoose from 'mongoose';

/**
 * TicketInventory Model
 * Stores ticket configuration for a knockout match (Finals, Semi-Finals, etc.)
 * Admin creates this when enabling ticket sales for a match
 */

const sectionSchema = new mongoose.Schema({
    name: { type: String, required: true },        // 'VIP', 'Premium', 'General'
    capacity: { type: Number, required: true, min: 1 },  // Total seats available
    booked: { type: Number, default: 0, min: 0 },  // Count of booked seats
    price: { type: Number, required: true, min: 0 },     // Price per ticket in INR
    description: { type: String, default: '' }     // Optional description
}, { _id: true });

const ticketInventorySchema = new mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        unique: true  // One inventory per match
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    venue: { type: String, required: true },  // Venue name from match

    // Seating sections with capacity and pricing
    sections: [sectionSchema],

    // Sales control
    salesStatus: {
        type: String,
        enum: ['draft', 'open', 'paused', 'closed', 'sold_out'],
        default: 'draft'
    },
    salesStartDate: { type: Date },
    salesEndDate: { type: Date },

    // Audit fields
    enabledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
    enabledAt: { type: Date },

    // Match details snapshot (for quick access without populate)
    matchDetails: {
        homeClub: { type: String },
        awayClub: { type: String },
        date: { type: Date },
        time: { type: String },
        round: { type: String },
        stage: { type: String }
    }
}, { timestamps: true });

// Virtual for total capacity
ticketInventorySchema.virtual('totalCapacity').get(function () {
    return this.sections.reduce((sum, s) => sum + s.capacity, 0);
});

// Virtual for total booked
ticketInventorySchema.virtual('totalBooked').get(function () {
    return this.sections.reduce((sum, s) => sum + s.booked, 0);
});

// Virtual for available tickets
ticketInventorySchema.virtual('availableTickets').get(function () {
    return this.sections.reduce((sum, s) => sum + (s.capacity - s.booked), 0);
});

// Index for efficient queries
ticketInventorySchema.index({ tournament: 1, salesStatus: 1 });

// Ensure virtuals are included in JSON output
ticketInventorySchema.set('toJSON', { virtuals: true });
ticketInventorySchema.set('toObject', { virtuals: true });

export default mongoose.model('TicketInventory', ticketInventorySchema);
