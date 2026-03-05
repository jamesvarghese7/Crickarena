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
    pending: { type: Number, default: 0, min: 0 }, // Count of seats in payment process
    price: { type: Number, required: true, min: 0 },     // Price per ticket in INR
    description: { type: String, default: '' }     // Optional description
}, { _id: true });

// Individual seat schema for 3D mode
const seatSchema = new mongoose.Schema({
    seatId: { type: String, required: true },           // 'NS-R01-S001' (Section-Row-Seat)
    section: { type: String, required: true },          // Section name
    row: { type: Number, required: true },              // Row number
    seatNumber: { type: Number, required: true },       // Seat number in row
    status: {
        type: String,
        enum: ['available', 'booked', 'locked', 'pending'],
        default: 'available'
    },
    price: { type: Number, required: true },            // Calculated price
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketBooking' },
    holdExpiry: { type: Date }                          // When pending hold expires
}, { _id: false });

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

    // Booking mode selection (admin chooses)
    bookingMode: {
        type: String,
        enum: ['classic', '3d'],
        default: 'classic'
    },

    // Stadium configuration (for 3D mode)
    stadiumConfig: {
        modelCode: { type: String },                    // 'small', 'medium', 'large'
        modelName: { type: String },                    // 'Small Stadium'
        totalCapacity: { type: Number },                // Stadium max capacity
        activeCapacity: { type: Number },               // Admin-configured active seats
        lockedSections: [String],                       // Auto-locked section names
        basePrice: { type: Number, default: 500 }       // Base price for calculation
    },

    // Individual seats (for 3D mode)
    seats: [seatSchema],

    // Seating sections with capacity and pricing (for classic mode)
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
    closedAt: { type: Date },
    closedReason: { type: String },  // 'match completed', 'match cancelled', 'admin closed', etc.

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
    return this.sections.reduce((sum, s) => sum + (s.capacity - s.booked - (s.pending || 0)), 0);
});

// Index for efficient queries
ticketInventorySchema.index({ tournament: 1, salesStatus: 1 });

// Ensure virtuals are included in JSON output
ticketInventorySchema.set('toJSON', { virtuals: true });
ticketInventorySchema.set('toObject', { virtuals: true });

export default mongoose.model('TicketInventory', ticketInventorySchema);
