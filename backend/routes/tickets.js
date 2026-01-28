import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import TicketInventory from '../models/TicketInventory.js';
import TicketBooking from '../models/TicketBooking.js';
import Match from '../models/Match.js';
import Tournament from '../models/Tournament.js';
import { verifyFirebaseToken, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// Razorpay instance helper
function getRazorpay() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
        throw new Error('Razorpay keys not configured');
    }
    return new Razorpay({ key_id, key_secret });
}

// Eligible stages/rounds for ticket booking
const ELIGIBLE_STAGES = ['Knockout', 'Playoff', 'Final', 'Qualifier1', 'Qualifier2', 'Eliminator'];
const ELIGIBLE_ROUNDS = ['Final', 'Semi-Final', 'Quarter-Final'];

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * GET /api/admin/tickets/eligible-matches
 * Get all knockout matches eligible for ticket sales
 */
router.get('/admin/tickets/eligible-matches', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const { tournamentId } = req.query;

        const matchQuery = {
            $or: [
                { stage: { $in: ELIGIBLE_STAGES } },
                { round: { $in: ELIGIBLE_ROUNDS } }
            ],
            status: { $in: ['Scheduled', 'Live'] }
        };

        if (tournamentId) {
            matchQuery.tournament = tournamentId;
        }

        const matches = await Match.find(matchQuery)
            .populate('homeClub', 'name shortName logoUrl')
            .populate('awayClub', 'name shortName logoUrl')
            .populate('tournament', 'name')
            .sort({ date: 1 })
            .lean();

        // Get existing inventory for these matches
        const matchIds = matches.map(m => m._id);
        const inventories = await TicketInventory.find({ match: { $in: matchIds } }).lean();
        const inventoryMap = new Map(inventories.map(inv => [String(inv.match), inv]));

        // Combine matches with their ticket status
        const result = matches.map(m => ({
            ...m,
            ticketInventory: inventoryMap.get(String(m._id)) || null,
            hasTickets: inventoryMap.has(String(m._id))
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching eligible matches:', error);
        res.status(500).json({ message: 'Failed to fetch eligible matches' });
    }
});

/**
 * GET /api/admin/tickets/tournaments-with-knockouts
 * Get tournaments that have knockout matches (for grouping in admin UI)
 */
router.get('/admin/tickets/tournaments-with-knockouts', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        // Find all tournaments that have knockout matches
        const knockoutMatches = await Match.find({
            $or: [
                { stage: { $in: ELIGIBLE_STAGES } },
                { round: { $in: ELIGIBLE_ROUNDS } }
            ]
        }).distinct('tournament');

        const tournaments = await Tournament.find({
            _id: { $in: knockoutMatches },
            status: { $in: ['ongoing', 'upcoming'] }
        })
            .select('name status bannerUrl startDate endDate')
            .sort({ startDate: -1 })
            .lean();

        // Get match counts and ticket status per tournament
        const result = await Promise.all(tournaments.map(async (t) => {
            const matches = await Match.countDocuments({
                tournament: t._id,
                $or: [
                    { stage: { $in: ELIGIBLE_STAGES } },
                    { round: { $in: ELIGIBLE_ROUNDS } }
                ]
            });

            const ticketsEnabled = await TicketInventory.countDocuments({
                tournament: t._id,
                salesStatus: 'open'
            });

            return {
                ...t,
                knockoutMatchCount: matches,
                ticketsEnabledCount: ticketsEnabled
            };
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ message: 'Failed to fetch tournaments' });
    }
});

/**
 * POST /api/admin/tickets/inventory
 * Create ticket inventory for a match
 */
router.post('/admin/tickets/inventory', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const { matchId, sections } = req.body;

        if (!matchId) {
            return res.status(400).json({ message: 'matchId is required' });
        }

        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({ message: 'At least one section is required' });
        }

        // Validate sections
        for (const section of sections) {
            if (!section.name || !section.capacity || section.price === undefined) {
                return res.status(400).json({ message: 'Each section must have name, capacity, and price' });
            }
            if (section.capacity < 1) {
                return res.status(400).json({ message: 'Section capacity must be at least 1' });
            }
            if (section.price < 0) {
                return res.status(400).json({ message: 'Section price cannot be negative' });
            }
        }

        // Check if match exists and is eligible
        const match = await Match.findById(matchId)
            .populate('homeClub', 'name shortName')
            .populate('awayClub', 'name shortName')
            .populate('tournament', 'name');

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        const isEligible = ELIGIBLE_STAGES.includes(match.stage) || ELIGIBLE_ROUNDS.includes(match.round);
        if (!isEligible) {
            return res.status(400).json({ message: 'This match is not eligible for ticket sales (not a knockout match)' });
        }

        // Check if inventory already exists
        const existing = await TicketInventory.findOne({ match: matchId });
        if (existing) {
            return res.status(400).json({ message: 'Ticket inventory already exists for this match. Use PUT to update.' });
        }

        // Create inventory
        const inventory = await TicketInventory.create({
            match: matchId,
            tournament: match.tournament._id,
            venue: match.venue || 'TBA',
            sections: sections.map(s => ({
                name: s.name,
                capacity: s.capacity,
                booked: 0,
                price: s.price,
                description: s.description || ''
            })),
            salesStatus: 'draft',
            matchDetails: {
                homeClub: match.homeClub?.name || match.homeClub?.shortName || 'TBA',
                awayClub: match.awayClub?.name || match.awayClub?.shortName || 'TBA',
                date: match.date,
                time: match.time,
                round: match.round,
                stage: match.stage
            }
        });

        res.status(201).json(inventory);
    } catch (error) {
        console.error('Error creating ticket inventory:', error);
        res.status(500).json({ message: 'Failed to create ticket inventory' });
    }
});

/**
 * GET /api/admin/tickets/inventory/:matchId
 * Get ticket inventory for a match
 */
router.get('/admin/tickets/inventory/:matchId', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const inventory = await TicketInventory.findOne({ match: req.params.matchId })
            .populate('match')
            .populate('tournament', 'name');

        if (!inventory) {
            return res.status(404).json({ message: 'Ticket inventory not found for this match' });
        }

        res.json(inventory);
    } catch (error) {
        console.error('Error fetching ticket inventory:', error);
        res.status(500).json({ message: 'Failed to fetch ticket inventory' });
    }
});

/**
 * PUT /api/admin/tickets/inventory/:matchId
 * Update ticket inventory (sections, pricing)
 */
router.put('/admin/tickets/inventory/:matchId', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const { sections, salesStartDate, salesEndDate } = req.body;

        const inventory = await TicketInventory.findOne({ match: req.params.matchId });
        if (!inventory) {
            return res.status(404).json({ message: 'Ticket inventory not found' });
        }

        // Can only update if not sold out
        if (inventory.salesStatus === 'sold_out') {
            return res.status(400).json({ message: 'Cannot update sold out inventory' });
        }

        // Update sections if provided
        if (sections && Array.isArray(sections)) {
            // Preserve booked counts for existing sections
            const bookedMap = new Map(inventory.sections.map(s => [s.name, s.booked]));

            inventory.sections = sections.map(s => ({
                name: s.name,
                capacity: s.capacity,
                booked: bookedMap.get(s.name) || 0,
                price: s.price,
                description: s.description || ''
            }));
        }

        if (salesStartDate) inventory.salesStartDate = new Date(salesStartDate);
        if (salesEndDate) inventory.salesEndDate = new Date(salesEndDate);

        await inventory.save();
        res.json(inventory);
    } catch (error) {
        console.error('Error updating ticket inventory:', error);
        res.status(500).json({ message: 'Failed to update ticket inventory' });
    }
});

/**
 * POST /api/admin/tickets/inventory/:matchId/enable
 * Enable ticket sales for a match
 */
router.post('/admin/tickets/inventory/:matchId/enable', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const inventory = await TicketInventory.findOne({ match: req.params.matchId });
        if (!inventory) {
            return res.status(404).json({ message: 'Ticket inventory not found' });
        }

        if (inventory.sections.length === 0) {
            return res.status(400).json({ message: 'Add at least one section before enabling sales' });
        }

        inventory.salesStatus = 'open';
        inventory.enabledBy = req.user._id;
        inventory.enabledAt = new Date();

        await inventory.save();
        res.json({ message: 'Ticket sales enabled', inventory });
    } catch (error) {
        console.error('Error enabling ticket sales:', error);
        res.status(500).json({ message: 'Failed to enable ticket sales' });
    }
});

/**
 * POST /api/admin/tickets/inventory/:matchId/disable
 * Disable (pause) ticket sales for a match
 */
router.post('/admin/tickets/inventory/:matchId/disable', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const inventory = await TicketInventory.findOne({ match: req.params.matchId });
        if (!inventory) {
            return res.status(404).json({ message: 'Ticket inventory not found' });
        }

        inventory.salesStatus = 'paused';
        await inventory.save();

        res.json({ message: 'Ticket sales paused', inventory });
    } catch (error) {
        console.error('Error disabling ticket sales:', error);
        res.status(500).json({ message: 'Failed to disable ticket sales' });
    }
});

/**
 * GET /api/admin/tickets/bookings
 * Get all bookings (with filters)
 */
router.get('/admin/tickets/bookings', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const { tournamentId, matchId, status, page = 1, limit = 50 } = req.query;

        const query = {};
        if (tournamentId) query.tournament = tournamentId;
        if (matchId) query.match = matchId;
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [bookings, total] = await Promise.all([
            TicketBooking.find(query)
                .populate('match', 'homeClub awayClub date venue round')
                .populate('tournament', 'name')
                .sort({ bookedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            TicketBooking.countDocuments(query)
        ]);

        // Calculate revenue stats
        const stats = await TicketBooking.aggregate([
            { $match: { ...query, paymentStatus: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalBookings: { $sum: 1 },
                    totalTickets: { $sum: '$quantity' }
                }
            }
        ]);

        res.json({
            bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            stats: stats[0] || { totalRevenue: 0, totalBookings: 0, totalTickets: 0 }
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * GET /api/tickets/available
 * Get all matches with available tickets (public)
 */
router.get('/tickets/available', async (req, res) => {
    try {
        const inventories = await TicketInventory.find({
            salesStatus: 'open'
        })
            .populate({
                path: 'match',
                populate: [
                    { path: 'homeClub', select: 'name shortName logoUrl' },
                    { path: 'awayClub', select: 'name shortName logoUrl' }
                ]
            })
            .populate('tournament', 'name bannerUrl')
            .lean();

        // Filter out matches that have passed
        const now = new Date();
        const available = inventories.filter(inv => {
            if (!inv.match) return false;
            const matchDate = new Date(inv.match.date);
            return matchDate > now;
        });

        res.json(available);
    } catch (error) {
        console.error('Error fetching available tickets:', error);
        res.status(500).json({ message: 'Failed to fetch available tickets' });
    }
});

/**
 * GET /api/tickets/match/:matchId
 * Get ticket details for a specific match (public)
 */
router.get('/tickets/match/:matchId', async (req, res) => {
    try {
        const inventory = await TicketInventory.findOne({
            match: req.params.matchId,
            salesStatus: 'open'
        })
            .populate({
                path: 'match',
                populate: [
                    { path: 'homeClub', select: 'name shortName logoUrl' },
                    { path: 'awayClub', select: 'name shortName logoUrl' }
                ]
            })
            .populate('tournament', 'name bannerUrl')
            .lean();

        if (!inventory) {
            return res.status(404).json({ message: 'Tickets not available for this match' });
        }

        // Calculate available seats per section
        const sections = inventory.sections.map(s => ({
            ...s,
            available: s.capacity - s.booked
        }));

        res.json({
            ...inventory,
            sections
        });
    } catch (error) {
        console.error('Error fetching match tickets:', error);
        res.status(500).json({ message: 'Failed to fetch match tickets' });
    }
});

/**
 * POST /api/tickets/book
 * Create a ticket booking (creates Razorpay order)
 */
router.post('/tickets/book', optionalAuth, async (req, res) => {
    try {
        const { matchId, section, quantity, user } = req.body;

        // Validate required fields
        if (!matchId || !section || !quantity || !user) {
            return res.status(400).json({ message: 'matchId, section, quantity, and user details are required' });
        }

        if (!user.name || !user.email || !user.phone) {
            return res.status(400).json({ message: 'User name, email, and phone are required' });
        }

        if (quantity < 1 || quantity > 10) {
            return res.status(400).json({ message: 'Quantity must be between 1 and 10' });
        }

        // Get inventory and validate
        const inventory = await TicketInventory.findOne({
            match: matchId,
            salesStatus: 'open'
        });

        if (!inventory) {
            return res.status(404).json({ message: 'Tickets not available for this match' });
        }

        // Find the section
        const sectionData = inventory.sections.find(s => s.name === section);
        if (!sectionData) {
            return res.status(400).json({ message: 'Invalid section' });
        }

        // Check availability
        const available = sectionData.capacity - sectionData.booked;
        if (available < quantity) {
            return res.status(400).json({
                message: `Only ${available} tickets available in ${section}`,
                available
            });
        }

        // Calculate amount
        const totalAmount = sectionData.price * quantity;
        const amountPaise = Math.round(totalAmount * 100);

        // Generate booking code
        const bookingCode = TicketBooking.generateBookingCode();

        // Create Razorpay order
        const razorpay = getRazorpay();
        const receiptBase = `TKT_${bookingCode}`;
        const receipt = receiptBase.length > 40 ? receiptBase.slice(-40) : receiptBase;

        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt,
            notes: {
                matchId: String(matchId),
                section,
                quantity: String(quantity),
                bookingCode
            }
        });

        // Create pending booking
        const booking = await TicketBooking.create({
            ticketInventory: inventory._id,
            match: matchId,
            tournament: inventory.tournament,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                firebaseUid: req.user?._id ? String(req.user._id) : undefined
            },
            section,
            quantity,
            unitPrice: sectionData.price,
            totalAmount,
            paymentStatus: 'pending',
            orderId: order.id,
            bookingCode,
            status: 'pending',
            matchDetails: inventory.matchDetails
        });

        res.json({
            keyId: process.env.RAZORPAY_KEY_ID,
            order,
            booking: {
                _id: booking._id,
                bookingCode,
                section,
                quantity,
                totalAmount
            }
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Failed to create booking', detail: error.message });
    }
});

/**
 * POST /api/tickets/verify
 * Verify payment and confirm booking
 */
router.post('/tickets/verify', optionalAuth, async (req, res) => {
    try {
        const { bookingCode, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!bookingCode || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing verification fields' });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(500).json({ message: 'Razorpay secret not configured' });
        }

        // Verify signature
        const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Find booking
        const booking = await TicketBooking.findOne({ bookingCode, orderId: razorpay_order_id });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.paymentStatus === 'completed') {
            return res.json({ message: 'Payment already verified', booking });
        }

        // Update booking
        booking.paymentId = razorpay_payment_id;
        booking.signature = razorpay_signature;
        booking.paymentStatus = 'completed';
        booking.status = 'confirmed';
        booking.bookedAt = new Date();

        // Generate individual ticket numbers
        booking.tickets = [];
        for (let i = 0; i < booking.quantity; i++) {
            booking.tickets.push({
                ticketNumber: TicketBooking.generateTicketNumber(bookingCode, i),
                isUsed: false
            });
        }

        // Generate QR code data (simple data URL with booking code)
        booking.qrCodeData = `CRICKARENA-TICKET:${bookingCode}`;

        await booking.save();

        // Update inventory booked count
        await TicketInventory.updateOne(
            { _id: booking.ticketInventory, 'sections.name': booking.section },
            { $inc: { 'sections.$.booked': booking.quantity } }
        );

        // Check if section is now sold out
        const inventory = await TicketInventory.findById(booking.ticketInventory);
        const allSoldOut = inventory.sections.every(s => s.booked >= s.capacity);
        if (allSoldOut) {
            inventory.salesStatus = 'sold_out';
            await inventory.save();
        }

        res.json({
            message: 'Payment verified successfully',
            booking: {
                _id: booking._id,
                bookingCode: booking.bookingCode,
                section: booking.section,
                quantity: booking.quantity,
                totalAmount: booking.totalAmount,
                tickets: booking.tickets,
                qrCodeData: booking.qrCodeData,
                matchDetails: booking.matchDetails,
                status: booking.status
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Failed to verify payment' });
    }
});

/**
 * GET /api/tickets/my-bookings
 * Get current user's bookings
 */
router.get('/tickets/my-bookings', verifyFirebaseToken, async (req, res) => {
    try {
        const bookings = await TicketBooking.find({
            'user.firebaseUid': String(req.user._id),
            paymentStatus: 'completed'
        })
            .populate('tournament', 'name')
            .sort({ bookedAt: -1 })
            .lean();

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

/**
 * GET /api/tickets/booking/:code
 * Get booking by code (for QR validation)
 */
router.get('/tickets/booking/:code', async (req, res) => {
    try {
        const booking = await TicketBooking.findOne({
            bookingCode: req.params.code.toUpperCase()
        })
            .populate('tournament', 'name')
            .lean();

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Failed to fetch booking' });
    }
});

export default router;
