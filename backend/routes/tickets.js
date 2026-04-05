import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import QRCode from 'qrcode';
import TicketInventory from '../models/TicketInventory.js';
import TicketBooking from '../models/TicketBooking.js';
import StadiumModel from '../models/StadiumModel.js';
import Match from '../models/Match.js';
import Tournament from '../models/Tournament.js';
import { verifyFirebaseToken, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { notifyTicketConfirmed } from '../utils/ticketEmails.js';
import { STADIUM_MODELS, generateSeats, getStadiumModel, listStadiumModels, getSeatSummary } from '../utils/stadiumGenerator.js';

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

function getMatchStartDateTime(match) {
    if (!match?.date) return null;

    const baseDate = new Date(match.date);
    if (Number.isNaN(baseDate.getTime())) return null;

    // If no time is provided, keep tickets visible for the full match day.
    if (!match.time || typeof match.time !== 'string') {
        baseDate.setHours(23, 59, 59, 999);
        return baseDate;
    }

    const [hoursRaw, minutesRaw] = match.time.split(':');
    const hours = Number.parseInt(hoursRaw, 10);
    const minutes = Number.parseInt(minutesRaw, 10);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        baseDate.setHours(23, 59, 59, 999);
        return baseDate;
    }

    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
}

/**
 * Utility: Auto-close ticket sales for completed/cancelled matches
 * This should be called periodically (e.g., via cron job or when match status changes)
 */
async function autoCloseTicketSales() {
    try {
        // Find all open ticket inventories
        const openInventories = await TicketInventory.find({
            salesStatus: 'open'
        }).populate('match', 'status');

        let closedCount = 0;

        for (const inventory of openInventories) {
            // Close if match is completed or cancelled
            if (inventory.match && ['Completed', 'Cancelled'].includes(inventory.match.status)) {
                inventory.salesStatus = 'closed';
                inventory.closedAt = new Date();
                inventory.closedReason = `Match ${inventory.match.status.toLowerCase()}`;
                await inventory.save();
                closedCount++;
                console.log(`Auto-closed ticket sales for match ${inventory.match._id} (${inventory.match.status})`);
            }
        }

        return { success: true, closedCount };
    } catch (error) {
        console.error('Error in autoCloseTicketSales:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * GET /api/admin/tickets/eligible-matches
 * Get all knockout matches eligible for ticket sales
 */
router.get('/admin/tickets/eligible-matches', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const { tournamentId, includeCompleted } = req.query;

        const statusFilter = ['Scheduled', 'Live'];
        if (includeCompleted === 'true') {
            statusFilter.push('Completed');
        }

        const matchQuery = {
            $or: [
                { stage: { $in: ELIGIBLE_STAGES } },
                { round: { $in: ELIGIBLE_ROUNDS } }
            ],
            status: { $in: statusFilter }
        };

        if (tournamentId) {
            matchQuery.tournament = tournamentId;
        }

        const matches = await Match.find(matchQuery)
            .populate('homeClub', 'name clubName shortName logoUrl')
            .populate('awayClub', 'name clubName shortName logoUrl')
            .populate('tournament', 'name bannerUrl district startDate endDate')
            .sort({ date: 1 })
            .lean();

        // Get existing inventory for these matches
        const matchIds = matches.map(m => m._id);
        const inventories = await TicketInventory.find({ match: { $in: matchIds } }).lean();
        const inventoryMap = new Map(inventories.map(inv => [String(inv.match), inv]));

        // Combine matches with their ticket status (optimized for 3D mode)
        const result = matches.map(m => {
            const inv = inventoryMap.get(String(m._id));
            if (inv) {
                // For 3D mode, calculate a summary instead of sending all seats
                if (inv.bookingMode === '3d' && inv.seats && inv.seats.length > 0) {
                    inv.seatSummary = {
                        total: inv.seats.length,
                        booked: inv.seats.filter(s => s.status === 'booked').length,
                        available: inv.seats.filter(s => s.status === 'available').length,
                        locked: inv.seats.filter(s => s.status === 'locked').length,
                        pending: inv.seats.filter(s => s.status === 'pending').length
                    };
                    // Don't send full seats array in list view (too large)
                    delete inv.seats;
                }
            }
            return {
                ...m,
                ticketInventory: inv || null,
                hasTickets: !!inv
            };
        });

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

        // Check for duplicate section names
        const sectionNames = sections.map(s => s.name.toLowerCase().trim());
        const uniqueNames = new Set(sectionNames);
        if (sectionNames.length !== uniqueNames.size) {
            return res.status(400).json({ message: 'Duplicate section names are not allowed' });
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

        // Check for valid configuration based on booking mode
        if (inventory.bookingMode === '3d') {
            // For 3D mode, check if seats are configured
            if (!inventory.seats || inventory.seats.length === 0) {
                return res.status(400).json({ message: 'Configure 3D stadium before enabling sales' });
            }
        } else {
            // For classic mode, check if sections are configured
            if (!inventory.sections || inventory.sections.length === 0) {
                return res.status(400).json({ message: 'Add at least one section before enabling sales' });
            }
        }

        inventory.salesStatus = 'open';
        inventory.enabledBy = req.user._id;
        inventory.enabledAt = new Date();

        await inventory.save();
        return res.json({ message: 'Ticket sales enabled', inventory });
    } catch (error) {
        console.error('Error enabling ticket sales:', error);
        return res.status(500).json({ message: 'Failed to enable ticket sales' });
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
 * POST /api/admin/tickets/auto-close
 * Manually trigger auto-close for completed/cancelled matches
 */
router.post('/admin/tickets/auto-close', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const result = await autoCloseTicketSales();
        
        if (result.success) {
            res.json({ 
                message: `Successfully closed ticket sales for ${result.closedCount} match(es)`,
                closedCount: result.closedCount
            });
        } else {
            res.status(500).json({ 
                message: 'Failed to auto-close ticket sales',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error in auto-close endpoint:', error);
        res.status(500).json({ message: 'Failed to auto-close ticket sales' });
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
                    { path: 'homeClub', select: 'name clubName shortName logoUrl' },
                    { path: 'awayClub', select: 'name clubName shortName logoUrl' }
                ]
            })
            .populate('tournament', 'name bannerUrl')
            .lean();

        // Filter out matches that have passed
        const now = new Date();
        const available = inventories.filter(inv => {
            if (!inv.match) return false;

            if (['Completed', 'Cancelled', 'Abandoned'].includes(inv.match.status)) {
                return false;
            }

            const matchStart = getMatchStartDateTime(inv.match);
            if (!matchStart) {
                // Keep scheduled matches visible even when date parsing fails.
                return inv.match.status === 'Scheduled';
            }

            return matchStart > now;
        }).map(inv => {
            // For 3D mode, remove the large seats array but keep stadiumConfig
            if (inv.bookingMode === '3d' && inv.seats) {
                delete inv.seats;
            }
            return inv;
        });

        // Debug: Log populated matches
        if (available.length > 0) {
            console.log('Available matches debug:', available.map(inv => ({
                matchId: inv.match._id,
                homeClub: inv.match.homeClub,
                awayClub: inv.match.awayClub,
                round: inv.match.round,
                stage: inv.match.stage,
                bookingMode: inv.bookingMode
            })));
        }

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
                    { path: 'homeClub', select: 'name clubName shortName logoUrl' },
                    { path: 'awayClub', select: 'name clubName shortName logoUrl' }
                ]
            })
            .populate('tournament', 'name bannerUrl')
            .lean();

        if (!inventory) {
            return res.status(404).json({ message: 'Tickets not available for this match' });
        }

        // Check if match is completed or cancelled
        if (inventory.match && ['Completed', 'Cancelled'].includes(inventory.match.status)) {
            return res.status(400).json({ 
                message: 'Ticket sales have ended for this match',
                matchStatus: inventory.match.status
            });
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
        }).populate('match', 'status date');

        if (!inventory) {
            return res.status(404).json({ message: 'Tickets not available for this match' });
        }

        // Check if match is completed or cancelled
        if (inventory.match && ['Completed', 'Cancelled'].includes(inventory.match.status)) {
            return res.status(400).json({ 
                message: 'Ticket sales have ended for this match',
                matchStatus: inventory.match.status
            });
        }

        // Check if match has already started (optional - you can remove this if you want to allow booking during live matches)
        if (inventory.match && inventory.match.status === 'Live') {
            return res.status(400).json({ 
                message: 'Cannot book tickets for a match that has already started',
                matchStatus: 'Live'
            });
        }

        // Find the section
        const sectionData = inventory.sections.find(s => s.name === section);
        if (!sectionData) {
            return res.status(400).json({ message: 'Invalid section' });
        }

        // Check availability (including pending)
        const available = sectionData.capacity - sectionData.booked - (sectionData.pending || 0);
        if (available < quantity) {
            return res.status(400).json({
                message: `Only ${available} tickets available in ${section}`,
                available
            });
        }

        // Atomically reserve tickets (increment pending)
        const reserved = await TicketInventory.findOneAndUpdate(
            {
                _id: inventory._id,
                "sections.name": section,
                // Ensure we still have capacity when actually updating (race condition fix)
                $expr: {
                    $gte: [
                        {
                            $let: {
                                vars: {
                                    targetSection: {
                                        $arrayElemAt: [
                                            { $filter: { input: "$sections", cond: { $eq: ["$$this.name", section] } } },
                                            0
                                        ]
                                    }
                                },
                                in: {
                                    $subtract: [
                                        "$$targetSection.capacity",
                                        { $add: ["$$targetSection.booked", { $ifNull: ["$$targetSection.pending", 0] }] }
                                    ]
                                }
                            }
                        },
                        quantity
                    ]
                }
            },
            { $inc: { "sections.$.pending": quantity } },
            { new: true }
        );

        if (!reserved) {
            return res.status(400).json({ message: 'Tickets just sold out or reserved by others. Please try again.' });
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
        const firebaseUid = req.firebase?.uid || undefined;
        console.log('Creating booking with Firebase UID:', firebaseUid);

        const booking = await TicketBooking.create({
            ticketInventory: inventory._id,
            match: matchId,
            tournament: inventory.tournament,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                firebaseUid
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

        // precise rollback if order creation failed
        // Note: in a real production system, this should be more robust
        if (matchId && section && quantity) {
            await TicketInventory.updateOne(
                { match: matchId, "sections.name": section },
                { $inc: { "sections.$.pending": -quantity } }
            ).catch(err => console.error('Rollback failed:', err));
        }

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

        // Generate QR code with booking information
        const qrData = JSON.stringify({
            bookingCode: booking.bookingCode,
            matchId: String(booking.match),
            email: booking.user.email,
            section: booking.section,
            quantity: booking.quantity,
            timestamp: Date.now()
        });

        // Generate QR code as base64 data URL
        booking.qrCodeData = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        console.log('Generated QR code for booking:', bookingCode);

        await booking.save();

        // Fetch populated match data for email (actual team names, not TBA)
        const populatedMatch = await Match.findById(booking.match)
            .populate('homeClub', 'name clubName shortName')
            .populate('awayClub', 'name clubName shortName')
            .lean();

        // Create enriched booking data for email with real team names
        const emailBookingData = {
            ...booking.toObject(),
            matchDetails: {
                homeClub: populatedMatch?.homeClub?.name || populatedMatch?.homeClub?.clubName || booking.matchDetails?.homeClub || 'TBA',
                awayClub: populatedMatch?.awayClub?.name || populatedMatch?.awayClub?.clubName || booking.matchDetails?.awayClub || 'TBA',
                date: populatedMatch?.date || booking.matchDetails?.date,
                time: populatedMatch?.time || booking.matchDetails?.time || 'TBA',
                venue: populatedMatch?.venue || booking.matchDetails?.venue || 'TBA',
                round: populatedMatch?.round || booking.matchDetails?.round,
                stage: populatedMatch?.stage || booking.matchDetails?.stage
            }
        };

        // Send confirmation email with QR code (non-blocking)
        notifyTicketConfirmed(emailBookingData).catch(err =>
            console.error('Failed to send ticket confirmation email:', err.message)
        );


        // Update inventory: Decrement pending, Increment booked
        await TicketInventory.updateOne(
            { _id: booking.ticketInventory, 'sections.name': booking.section },
            {
                $inc: {
                    'sections.$.booked': booking.quantity,
                    'sections.$.pending': -booking.quantity
                }
            }
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
        const firebaseUid = req.firebase.uid;
        console.log('Fetching bookings for Firebase UID:', firebaseUid);

        // Debug: Check ALL bookings to see what's in the database
        const allBookings = await TicketBooking.find({}).select('user.firebaseUid user.email paymentStatus status').lean();
        console.log('All bookings in database:', allBookings.map(b => ({
            email: b.user.email,
            firebaseUid: b.user.firebaseUid,
            paymentStatus: b.paymentStatus,
            status: b.status
        })));

        const bookings = await TicketBooking.find({
            'user.firebaseUid': firebaseUid,
            paymentStatus: 'completed'
        })
            .populate('tournament', 'name')
            .populate({
                path: 'match',
                select: 'homeClub awayClub date time venue round stage',
                populate: [
                    { path: 'homeClub', select: 'name clubName shortName logoUrl' },
                    { path: 'awayClub', select: 'name clubName shortName logoUrl' }
                ]
            })
            .sort({ bookedAt: -1 })
            .lean();

        console.log(`Found ${bookings.length} bookings for user ${firebaseUid}`);
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

/**
 * POST /api/admin/tickets/cleanup-pending
 * Release pending tickets that are older than 15 minutes
 */
router.post('/admin/tickets/cleanup-pending', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        // Find all pending bookings older than 15 minutes
        const expiredBookings = await TicketBooking.find({
            status: 'pending',
            createdAt: { $lt: fifteenMinutesAgo }
        }).lean();

        if (expiredBookings.length === 0) {
            return res.json({
                message: 'No expired pending bookings found',
                released: 0
            });
        }

        // Group by match and section to batch update inventory
        const inventoryUpdates = {};
        for (const booking of expiredBookings) {
            const key = `${booking.match}_${booking.section}`;
            if (!inventoryUpdates[key]) {
                inventoryUpdates[key] = {
                    matchId: booking.match,
                    section: booking.section,
                    quantity: 0
                };
            }
            inventoryUpdates[key].quantity += booking.quantity;
        }

        // Release pending tickets in inventory
        for (const update of Object.values(inventoryUpdates)) {
            await TicketInventory.updateOne(
                { match: update.matchId, 'sections.name': update.section },
                { $inc: { 'sections.$.pending': -update.quantity } }
            );
        }

        // Mark bookings as expired
        await TicketBooking.updateMany(
            {
                status: 'pending',
                createdAt: { $lt: fifteenMinutesAgo }
            },
            {
                $set: {
                    status: 'expired',
                    paymentStatus: 'failed'
                }
            }
        );

        res.json({
            message: `Released ${expiredBookings.length} expired pending bookings`,
            released: expiredBookings.length,
            ticketsReleased: Object.values(inventoryUpdates).reduce((sum, u) => sum + u.quantity, 0)
        });
    } catch (error) {
        console.error('Error cleaning up pending tickets:', error);
        res.status(500).json({ message: 'Failed to cleanup pending tickets' });
    }
});

// ============================================
// 3D STADIUM ENDPOINTS
// ============================================

/**
 * GET /api/admin/tickets/stadium-models
 * List available stadium models
 */
router.get('/admin/tickets/stadium-models', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const models = listStadiumModels();
        res.json(models);
    } catch (error) {
        console.error('Error fetching stadium models:', error);
        res.status(500).json({ message: 'Failed to fetch stadium models' });
    }
});

/**
 * POST /api/admin/tickets/inventory/:matchId/3d-config
 * Configure 3D stadium for a match
 */
router.post('/admin/tickets/inventory/:matchId/3d-config', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const { matchId } = req.params;
        const { modelCode, activeCapacity, basePrice, bookingMode } = req.body;

        if (!modelCode || !['small', 'medium', 'large'].includes(modelCode)) {
            return res.status(400).json({ message: 'Valid modelCode required (small, medium, large)' });
        }

        const stadiumModel = getStadiumModel(modelCode);
        if (!stadiumModel) {
            return res.status(400).json({ message: 'Invalid stadium model' });
        }

        // Validate activeCapacity
        const capacity = activeCapacity || stadiumModel.totalCapacity;
        if (capacity < 1 || capacity > stadiumModel.totalCapacity) {
            return res.status(400).json({
                message: `Active capacity must be between 1 and ${stadiumModel.totalCapacity}`
            });
        }

        // Check if match exists
        const match = await Match.findById(matchId)
            .populate('homeClub', 'name shortName')
            .populate('awayClub', 'name shortName')
            .populate('tournament', 'name');

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Generate seats with auto-lock
        const { seats, lockedSections } = generateSeats(modelCode, basePrice || 500, capacity);

        // Find or create inventory
        let inventory = await TicketInventory.findOne({ match: matchId });

        if (!inventory) {
            inventory = new TicketInventory({
                match: matchId,
                tournament: match.tournament._id,
                venue: match.venue || 'TBA',
                sections: [],
                matchDetails: {
                    homeClub: match.homeClub?.name || match.homeClub?.shortName || 'TBA',
                    awayClub: match.awayClub?.name || match.awayClub?.shortName || 'TBA',
                    date: match.date,
                    time: match.time,
                    round: match.round,
                    stage: match.stage
                }
            });
        }

        // Update with 3D configuration
        inventory.bookingMode = bookingMode || '3d';
        inventory.stadiumConfig = {
            modelCode,
            modelName: stadiumModel.name,
            totalCapacity: stadiumModel.totalCapacity,
            activeCapacity: capacity,
            lockedSections,
            basePrice: basePrice || 500
        };
        inventory.seats = seats;

        await inventory.save();

        // Return complete inventory for frontend
        const summary = getSeatSummary(seats);

        return res.json({
            message: '3D stadium configuration saved',
            seatsGenerated: seats.length,
            activeSeats: capacity,
            inventory: {
                _id: inventory._id,
                bookingMode: inventory.bookingMode,
                stadiumConfig: inventory.stadiumConfig,
                seats: inventory.seats,
                seatSummary: summary
            }
        });
    } catch (error) {
        console.error('Error configuring 3D stadium:', error);
        return res.status(500).json({ message: 'Failed to configure 3D stadium', detail: error.message });
    }
});

/**
 * GET /api/admin/tickets/inventory/:matchId/seats
 * Get all seats for admin view (with full status)
 */
router.get('/admin/tickets/inventory/:matchId/seats', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const inventory = await TicketInventory.findOne({ match: req.params.matchId });

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }

        if (inventory.bookingMode !== '3d') {
            return res.status(400).json({ message: 'This match is not configured for 3D booking' });
        }

        const summary = getSeatSummary(inventory.seats);

        res.json({
            stadiumConfig: inventory.stadiumConfig,
            seatSummary: summary,
            seats: inventory.seats
        });
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ message: 'Failed to fetch seats' });
    }
});

/**
 * PUT /api/admin/tickets/inventory/:matchId/booking-mode
 * Toggle booking mode (classic/3d)
 */
router.put('/admin/tickets/inventory/:matchId/booking-mode', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const { bookingMode } = req.body;

        if (!['classic', '3d'].includes(bookingMode)) {
            return res.status(400).json({ message: 'Valid bookingMode required (classic or 3d)' });
        }

        const inventory = await TicketInventory.findOne({ match: req.params.matchId });

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }

        // Check if 3D config exists when switching to 3d mode
        if (bookingMode === '3d' && (!inventory.stadiumConfig?.modelCode || inventory.seats.length === 0)) {
            return res.status(400).json({
                message: 'Please configure 3D stadium first before enabling 3D booking mode'
            });
        }

        inventory.bookingMode = bookingMode;
        await inventory.save();

        res.json({
            message: `Booking mode changed to ${bookingMode}`,
            bookingMode: inventory.bookingMode
        });
    } catch (error) {
        console.error('Error updating booking mode:', error);
        res.status(500).json({ message: 'Failed to update booking mode' });
    }
});

/**
 * POST /api/admin/tickets/inventory/:matchId/sections
 * Configure active sections for 3D stadium
 */
router.post('/admin/tickets/inventory/:matchId/sections', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const { matchId } = req.params;
        const { activeSections } = req.body;

        if (!activeSections || !Array.isArray(activeSections) || activeSections.length === 0) {
            return res.status(400).json({ message: 'activeSections array is required' });
        }

        const inventory = await TicketInventory.findOne({ match: matchId });

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }

        if (inventory.bookingMode !== '3d') {
            return res.status(400).json({ message: 'Section selection is only available for 3D booking mode' });
        }

        // Update stadium config with active sections
        if (!inventory.stadiumConfig) {
            inventory.stadiumConfig = {};
        }
        inventory.stadiumConfig.activeSections = activeSections;

        // Lock/unlock seats based on section selection
        if (inventory.seats && inventory.seats.length > 0) {
            inventory.seats.forEach(seat => {
                const seatSection = seat.seatId.split('-')[0]; // Extract section code from seatId
                
                // Only update seats that haven't been booked
                if (seat.status !== 'booked') {
                    if (activeSections.includes(seatSection)) {
                        // Unlock seat if in active section
                        if (seat.status === 'locked') {
                            seat.status = 'available';
                        }
                    } else {
                        // Lock seat if not in active section
                        seat.status = 'locked';
                    }
                }
            });
        }

        await inventory.save();

        // Calculate summary
        const summary = getSeatSummary(inventory.seats);

        res.json({
            message: `Successfully configured ${activeSections.length} active sections`,
            activeSections,
            seatSummary: summary,
            inventory
        });
    } catch (error) {
        console.error('Error configuring sections:', error);
        res.status(500).json({ message: 'Failed to configure sections', detail: error.message });
    }
});

// ============================================
// PUBLIC 3D BOOKING ENDPOINTS
// ============================================

/**
 * GET /api/tickets/:matchId/seats
 * Get available seats for 3D viewer (public)
 */
router.get('/tickets/:matchId/seats', async (req, res) => {
    try {
        const inventory = await TicketInventory.findOne({
            match: req.params.matchId,
            salesStatus: 'open'
        }).populate({
            path: 'match',
            populate: [
                { path: 'homeClub', select: 'name clubName shortName logoUrl' },
                { path: 'awayClub', select: 'name clubName shortName logoUrl' }
            ]
        }).populate('tournament', 'name');

        if (!inventory) {
            return res.status(404).json({ message: 'Tickets not available for this match' });
        }

        if (inventory.bookingMode !== '3d') {
            return res.status(400).json({
                message: 'This match uses classic booking mode',
                bookingMode: 'classic'
            });
        }

        // Clean up expired holds
        const now = new Date();
        let hasExpiredHolds = false;

        for (const seat of inventory.seats) {
            if (seat.status === 'pending' && seat.holdExpiry && new Date(seat.holdExpiry) < now) {
                seat.status = 'available';
                seat.holdExpiry = null;
                seat.bookingId = null;
                hasExpiredHolds = true;
            }
        }

        if (hasExpiredHolds) {
            await inventory.save();
        }

        // Get stadium model for 3D rendering info
        const stadiumModel = getStadiumModel(inventory.stadiumConfig.modelCode);

        res.json({
            match: inventory.match,
            tournament: inventory.tournament,
            venue: inventory.venue,
            stadiumConfig: inventory.stadiumConfig,
            stadiumModel: stadiumModel ? {
                sections: stadiumModel.sections,
                dimensions: stadiumModel.dimensions,
                theme: stadiumModel.theme
            } : null,
            seats: inventory.seats.map(s => ({
                seatId: s.seatId,
                section: s.section,
                row: s.row,
                seatNumber: s.seatNumber,
                status: s.status,
                price: s.price
            })),
            seatSummary: getSeatSummary(inventory.seats)
        });
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ message: 'Failed to fetch seats' });
    }
});

/**
 * POST /api/tickets/:matchId/seats/hold
 * Hold selected seats during checkout (10 minute hold)
 */
router.post('/tickets/:matchId/seats/hold', optionalAuth, async (req, res) => {
    try {
        const { seatIds, user } = req.body;

        if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            return res.status(400).json({ message: 'seatIds array is required' });
        }

        if (seatIds.length > 10) {
            return res.status(400).json({ message: 'Maximum 10 seats can be held at once' });
        }

        if (!user || !user.name || !user.email || !user.phone) {
            return res.status(400).json({ message: 'User name, email, and phone are required' });
        }

        const inventory = await TicketInventory.findOne({
            match: req.params.matchId,
            salesStatus: 'open',
            bookingMode: '3d'
        }).populate('match', 'status date');

        if (!inventory) {
            return res.status(404).json({ message: 'Tickets not available for this match' });
        }

        // Check if match is completed or cancelled
        if (inventory.match && ['Completed', 'Cancelled'].includes(inventory.match.status)) {
            return res.status(400).json({ 
                message: 'Ticket sales have ended for this match',
                matchStatus: inventory.match.status
            });
        }

        // Check if match has already started
        if (inventory.match && inventory.match.status === 'Live') {
            return res.status(400).json({ 
                message: 'Cannot book tickets for a match that has already started',
                matchStatus: 'Live'
            });
        }

        // Validate all seats are available
        const selectedSeats = [];
        let totalAmount = 0;

        for (const seatId of seatIds) {
            const seat = inventory.seats.find(s => s.seatId === seatId);

            if (!seat) {
                return res.status(400).json({ message: `Seat ${seatId} not found` });
            }

            if (seat.status !== 'available') {
                return res.status(400).json({
                    message: `Seat ${seatId} is not available (${seat.status})`
                });
            }

            selectedSeats.push({
                seatId: seat.seatId,
                section: seat.section,
                row: seat.row,
                seatNumber: seat.seatNumber,
                price: seat.price
            });
            totalAmount += seat.price;
        }

        // Create hold expiry (10 minutes)
        const holdExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Generate booking code
        const bookingCode = TicketBooking.generateBookingCode();

        // Create Razorpay order
        const razorpay = getRazorpay();
        const amountPaise = Math.round(totalAmount * 100);
        const receiptBase = `TKT3D_${bookingCode}`;
        const receipt = receiptBase.length > 40 ? receiptBase.slice(-40) : receiptBase;

        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt,
            notes: {
                matchId: String(req.params.matchId),
                seatCount: String(seatIds.length),
                bookingCode,
                bookingType: '3d'
            }
        });

        // Create pending booking
        const firebaseUid = req.firebase?.uid || undefined;

        const booking = await TicketBooking.create({
            ticketInventory: inventory._id,
            match: req.params.matchId,
            tournament: inventory.tournament,
            bookingType: '3d',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                firebaseUid
            },
            selectedSeats,
            quantity: seatIds.length,
            totalAmount,
            paymentStatus: 'pending',
            orderId: order.id,
            bookingCode,
            status: 'pending',
            matchDetails: inventory.matchDetails
        });

        // Mark seats as pending with hold expiry
        for (const seatId of seatIds) {
            const seat = inventory.seats.find(s => s.seatId === seatId);
            if (seat) {
                seat.status = 'pending';
                seat.holdExpiry = holdExpiry;
                seat.bookingId = booking._id;
            }
        }

        await inventory.save();

        res.json({
            keyId: process.env.RAZORPAY_KEY_ID,
            order,
            booking: {
                _id: booking._id,
                bookingCode,
                selectedSeats,
                quantity: seatIds.length,
                totalAmount,
                holdExpiry
            }
        });
    } catch (error) {
        console.error('Error holding seats:', error);
        res.status(500).json({ message: 'Failed to hold seats', detail: error.message });
    }
});

/**
 * POST /api/tickets/:matchId/seats/release
 * Release held seats (manual cancel or timeout)
 */
router.post('/tickets/:matchId/seats/release', optionalAuth, async (req, res) => {
    try {
        const { bookingCode } = req.body;

        if (!bookingCode) {
            return res.status(400).json({ message: 'bookingCode is required' });
        }

        const booking = await TicketBooking.findOne({
            bookingCode,
            match: req.params.matchId,
            status: 'pending',
            bookingType: '3d'
        });

        if (!booking) {
            return res.status(404).json({ message: 'Pending booking not found' });
        }

        const inventory = await TicketInventory.findOne({ match: req.params.matchId });

        if (inventory) {
            // Release held seats
            for (const selectedSeat of booking.selectedSeats) {
                const seat = inventory.seats.find(s => s.seatId === selectedSeat.seatId);
                if (seat && seat.status === 'pending' && String(seat.bookingId) === String(booking._id)) {
                    seat.status = 'available';
                    seat.holdExpiry = null;
                    seat.bookingId = null;
                }
            }
            await inventory.save();
        }

        // Update booking status
        booking.status = 'cancelled';
        booking.paymentStatus = 'failed';
        await booking.save();

        res.json({ message: 'Seats released successfully' });
    } catch (error) {
        console.error('Error releasing seats:', error);
        res.status(500).json({ message: 'Failed to release seats' });
    }
});

/**
 * POST /api/tickets/verify-3d
 * Verify 3D booking payment and confirm seat booking
 */
router.post('/tickets/verify-3d', optionalAuth, async (req, res) => {
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
        const booking = await TicketBooking.findOne({
            bookingCode,
            orderId: razorpay_order_id,
            bookingType: '3d'
        });

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

        // Generate individual ticket numbers for each seat
        booking.tickets = booking.selectedSeats.map((seat, i) => ({
            ticketNumber: `${bookingCode}-${seat.seatId}`,
            seatInfo: `${seat.section} Row ${seat.row} Seat ${seat.seatNumber}`,
            isUsed: false
        }));

        // Generate QR code
        const qrData = JSON.stringify({
            bookingCode: booking.bookingCode,
            matchId: String(booking.match),
            email: booking.user.email,
            seats: booking.selectedSeats.map(s => s.seatId),
            quantity: booking.quantity,
            timestamp: Date.now()
        });

        booking.qrCodeData = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
        });

        await booking.save();

        // Update seat statuses to booked
        const inventory = await TicketInventory.findById(booking.ticketInventory);
        if (inventory) {
            for (const selectedSeat of booking.selectedSeats) {
                const seat = inventory.seats.find(s => s.seatId === selectedSeat.seatId);
                if (seat) {
                    seat.status = 'booked';
                    seat.holdExpiry = null;
                }
            }
            await inventory.save();
        }

        // Fetch populated match data for email
        const populatedMatch = await Match.findById(booking.match)
            .populate('homeClub', 'name clubName shortName')
            .populate('awayClub', 'name clubName shortName')
            .lean();

        // Create enriched booking data for email
        const emailBookingData = {
            ...booking.toObject(),
            matchDetails: {
                homeClub: populatedMatch?.homeClub?.name || populatedMatch?.homeClub?.clubName || booking.matchDetails?.homeClub || 'TBA',
                awayClub: populatedMatch?.awayClub?.name || populatedMatch?.awayClub?.clubName || booking.matchDetails?.awayClub || 'TBA',
                date: populatedMatch?.date || booking.matchDetails?.date,
                time: populatedMatch?.time || booking.matchDetails?.time || 'TBA',
                venue: populatedMatch?.venue || booking.matchDetails?.venue || 'TBA',
                round: populatedMatch?.round || booking.matchDetails?.round,
                stage: populatedMatch?.stage || booking.matchDetails?.stage
            }
        };

        // Send confirmation email (non-blocking)
        notifyTicketConfirmed(emailBookingData).catch(err =>
            console.error('Failed to send ticket confirmation email:', err.message)
        );

        res.json({
            message: 'Payment verified successfully',
            booking: {
                _id: booking._id,
                bookingCode: booking.bookingCode,
                selectedSeats: booking.selectedSeats,
                quantity: booking.quantity,
                totalAmount: booking.totalAmount,
                tickets: booking.tickets,
                qrCodeData: booking.qrCodeData,
                matchDetails: booking.matchDetails,
                status: booking.status
            }
        });
    } catch (error) {
        console.error('Error verifying 3D payment:', error);
        res.status(500).json({ message: 'Failed to verify payment' });
    }
});

// Export the auto-close function for use in server.js or cron jobs
export { autoCloseTicketSales };

export default router;
