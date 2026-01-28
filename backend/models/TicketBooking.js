import mongoose from 'mongoose';

/**
 * TicketBooking Model
 * Stores individual ticket bookings made by users
 * Created after successful Razorpay payment
 */

const ticketSchema = new mongoose.Schema({
    ticketNumber: { type: String, required: true },  // Unique ticket identifier
    seatInfo: { type: String, default: '' },         // Optional seat number/row
    isUsed: { type: Boolean, default: false },       // For entry validation
    usedAt: { type: Date }
}, { _id: true });

const ticketBookingSchema = new mongoose.Schema({
    ticketInventory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TicketInventory',
        required: true
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },

    // User details (not necessarily a registered user)
    user: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        firebaseUid: { type: String }  // If logged in user
    },

    // Booking details
    section: { type: String, required: true },       // Section name booked
    quantity: { type: Number, required: true, min: 1, max: 10 },
    unitPrice: { type: Number, required: true },     // Price per ticket at time of booking
    totalAmount: { type: Number, required: true },   // Total amount paid

    // Payment tracking (Razorpay)
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'refunded', 'failed'],
        default: 'pending'
    },
    orderId: { type: String },           // Razorpay order ID
    paymentId: { type: String },         // Razorpay payment ID
    signature: { type: String },         // Razorpay signature for verification

    // Booking identification
    bookingCode: { type: String, required: true, unique: true },  // Short code for QR
    qrCodeData: { type: String },        // QR code data URL (base64)

    // Individual tickets
    tickets: [ticketSchema],

    // Timestamps
    bookedAt: { type: Date, default: Date.now },

    // Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'used', 'expired'],
        default: 'pending'
    },

    // Match details snapshot
    matchDetails: {
        homeClub: { type: String },
        awayClub: { type: String },
        date: { type: Date },
        time: { type: String },
        venue: { type: String },
        round: { type: String }
    }
}, { timestamps: true });

// Generate unique booking code
ticketBookingSchema.statics.generateBookingCode = function () {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // Avoid confusing chars (0, O, I, 1)
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Generate unique ticket numbers
ticketBookingSchema.statics.generateTicketNumber = function (bookingCode, index) {
    return `${bookingCode}-T${String(index + 1).padStart(2, '0')}`;
};

// Indexes for efficient queries
ticketBookingSchema.index({ bookingCode: 1 });
ticketBookingSchema.index({ 'user.email': 1 });
ticketBookingSchema.index({ 'user.firebaseUid': 1 });
ticketBookingSchema.index({ match: 1, status: 1 });
ticketBookingSchema.index({ tournament: 1 });
ticketBookingSchema.index({ orderId: 1 });

export default mongoose.model('TicketBooking', ticketBookingSchema);
