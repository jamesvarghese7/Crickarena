import express from 'express';
import SponsorshipOpportunity from '../models/SponsorshipOpportunity.js';
import SponsorshipDeal from '../models/SponsorshipDeal.js';
import Sponsor from '../models/Sponsor.js';
import User from '../models/User.js';
import Tournament from '../models/Tournament.js';
import Club from '../models/Club.js';
import { notifyDealApplied, notifyDealApproved, notifyDealRejected } from '../utils/sponsorEmails.js';

const router = express.Router();

// =============================================
// SPONSORSHIP OPPORTUNITIES
// =============================================

/**
 * GET /api/sponsorships/opportunities
 * List all open sponsorship opportunities (public marketplace)
 */
router.get('/opportunities', async (req, res) => {
    try {
        const {
            targetType,
            tier,
            minPrice,
            maxPrice,
            district,
            page = 1,
            limit = 20
        } = req.query;

        const query = {
            status: 'open',
            visibility: 'public'
        };

        if (targetType) query.targetType = targetType;
        if (tier) query.tier = tier;
        if (minPrice || maxPrice) {
            query.askingPrice = {};
            if (minPrice) query.askingPrice.$gte = parseInt(minPrice);
            if (maxPrice) query.askingPrice.$lte = parseInt(maxPrice);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let opportunities = await SponsorshipOpportunity.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Populate target details
        opportunities = await Promise.all(opportunities.map(async (opp) => {
            const oppObj = opp.toObject();
            if (opp.targetType === 'tournament') {
                oppObj.target = await Tournament.findById(opp.targetId)
                    .select('name district location startDate endDate status bannerUrl');
            } else if (opp.targetType === 'club') {
                oppObj.target = await Club.findById(opp.targetId)
                    .select('name clubName district city logoUrl');
            }
            // Filter by district if specified
            if (district && oppObj.target && oppObj.target.district !== district) {
                return null;
            }
            return oppObj;
        }));

        // Filter out nulls (district filter)
        opportunities = opportunities.filter(o => o !== null);

        const total = await SponsorshipOpportunity.countDocuments(query);

        res.json({
            opportunities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('List opportunities error:', error);
        res.status(500).json({ error: 'Failed to list opportunities' });
    }
});

/**
 * GET /api/sponsorships/opportunities/:id
 * Get opportunity details
 */
router.get('/opportunities/:id', async (req, res) => {
    try {
        const opportunity = await SponsorshipOpportunity.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!opportunity) {
            return res.status(404).json({ error: 'Opportunity not found' });
        }

        const oppObj = opportunity.toObject();

        // Populate target
        if (opportunity.targetType === 'tournament') {
            oppObj.target = await Tournament.findById(opportunity.targetId)
                .select('name description district location startDate endDate status bannerUrl prizePool maxTeams');
        } else if (opportunity.targetType === 'club') {
            oppObj.target = await Club.findById(opportunity.targetId)
                .select('name clubName district city description logoUrl achievements');
        }

        // Increment view count
        opportunity.views += 1;
        await opportunity.save();

        // Get existing sponsors for this target
        const existingDeals = await SponsorshipDeal.find({
            opportunity: { $in: await SponsorshipOpportunity.find({ targetId: opportunity.targetId }).select('_id') },
            status: 'active'
        }).populate({
            path: 'sponsor',
            select: 'companyName logoUrl industry'
        });

        oppObj.existingSponsors = existingDeals.map(d => d.sponsor);

        res.json(oppObj);
    } catch (error) {
        console.error('Get opportunity error:', error);
        res.status(500).json({ error: 'Failed to get opportunity' });
    }
});

/**
 * POST /api/sponsorships/opportunities
 * Create a new sponsorship opportunity (club manager or admin)
 */
router.post('/opportunities', async (req, res) => {
    try {
        const { firebaseUid } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify permissions
        if (!['admin', 'clubManager'].includes(user.role)) {
            return res.status(403).json({ error: 'Only admins and club managers can create opportunities' });
        }

        const {
            targetType,
            targetId,
            tier,
            title,
            description,
            benefits,
            askingPrice,
            negotiable,
            validFrom,
            validTo,
            maxSponsors,
            visibility
        } = req.body;

        // Validate required fields
        if (!targetType || !targetId || !tier || !title || !askingPrice) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify target exists
        let target;
        if (targetType === 'tournament') {
            target = await Tournament.findById(targetId);
        } else if (targetType === 'club') {
            target = await Club.findById(targetId);
            // Verify club manager owns this club
            if (user.role === 'clubManager' && target.manager.toString() !== user._id.toString()) {
                return res.status(403).json({ error: 'You can only create opportunities for your own club' });
            }
        }

        if (!target) {
            return res.status(404).json({ error: `${targetType} not found` });
        }

        // Check for duplicate tier
        const existingOpp = await SponsorshipOpportunity.findOne({
            targetType,
            targetId,
            tier,
            status: { $in: ['open', 'pending'] }
        });

        if (existingOpp && tier === 'title') {
            return res.status(400).json({ error: 'A title sponsorship opportunity already exists for this target' });
        }

        const opportunity = new SponsorshipOpportunity({
            targetType,
            targetId,
            tier,
            title: title.trim(),
            description,
            benefits: benefits || [],
            askingPrice,
            negotiable: negotiable !== false,
            validFrom: validFrom || new Date(),
            validTo,
            maxSponsors: maxSponsors || (tier === 'title' ? 1 : 3),
            visibility: visibility || 'public',
            createdBy: user._id
        });

        await opportunity.save();

        res.status(201).json({
            message: 'Sponsorship opportunity created successfully',
            opportunity
        });
    } catch (error) {
        console.error('Create opportunity error:', error);
        res.status(500).json({ error: 'Failed to create opportunity' });
    }
});

/**
 * PUT /api/sponsorships/opportunities/:id
 * Update an opportunity
 */
router.put('/opportunities/:id', async (req, res) => {
    try {
        const { firebaseUid } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const opportunity = await SponsorshipOpportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ error: 'Opportunity not found' });
        }

        // Verify ownership or admin
        if (user.role !== 'admin' && opportunity.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this opportunity' });
        }

        // Can't update if there are active deals
        const activeDeals = await SponsorshipDeal.countDocuments({
            opportunity: opportunity._id,
            status: { $in: ['approved', 'active'] }
        });

        if (activeDeals > 0 && req.body.askingPrice) {
            return res.status(400).json({ error: 'Cannot change price with active deals' });
        }

        const allowedUpdates = [
            'title', 'description', 'benefits', 'askingPrice',
            'negotiable', 'validTo', 'status', 'visibility', 'maxSponsors'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                opportunity[field] = req.body[field];
            }
        });

        await opportunity.save();

        res.json({
            message: 'Opportunity updated successfully',
            opportunity
        });
    } catch (error) {
        console.error('Update opportunity error:', error);
        res.status(500).json({ error: 'Failed to update opportunity' });
    }
});

/**
 * DELETE /api/sponsorships/opportunities/:id
 * Delete an opportunity
 */
router.delete('/opportunities/:id', async (req, res) => {
    try {
        const { firebaseUid } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const opportunity = await SponsorshipOpportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ error: 'Opportunity not found' });
        }

        // Verify ownership or admin
        if (user.role !== 'admin' && opportunity.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this opportunity' });
        }

        // Check for existing deals
        const existingDeals = await SponsorshipDeal.countDocuments({
            opportunity: opportunity._id
        });

        if (existingDeals > 0) {
            // Soft delete - mark as closed
            opportunity.status = 'closed';
            await opportunity.save();
            return res.json({ message: 'Opportunity closed (has existing applications)' });
        }

        await SponsorshipOpportunity.findByIdAndDelete(req.params.id);

        res.json({ message: 'Opportunity deleted successfully' });
    } catch (error) {
        console.error('Delete opportunity error:', error);
        res.status(500).json({ error: 'Failed to delete opportunity' });
    }
});

// =============================================
// SPONSORSHIP DEALS
// =============================================

/**
 * POST /api/sponsorships/deals/apply
 * Apply for a sponsorship opportunity
 */
router.post('/deals/apply', async (req, res) => {
    try {
        const { firebaseUid, opportunityId, proposedAmount, message } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find sponsor profile
        const sponsor = await Sponsor.findOne({ user: user._id });
        if (!sponsor) {
            return res.status(403).json({ error: 'You must be a registered sponsor to apply' });
        }

        if (sponsor.status !== 'verified') {
            return res.status(403).json({ error: 'Your sponsor account must be verified to apply' });
        }

        // Find opportunity
        const opportunity = await SponsorshipOpportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ error: 'Opportunity not found' });
        }

        if (!opportunity.isAvailable()) {
            return res.status(400).json({ error: 'This opportunity is no longer available' });
        }

        // Check for existing application
        const existingDeal = await SponsorshipDeal.findOne({
            opportunity: opportunityId,
            sponsor: sponsor._id
        });

        if (existingDeal) {
            return res.status(400).json({
                error: 'You have already applied for this opportunity',
                dealId: existingDeal._id,
                status: existingDeal.status
            });
        }

        // Create deal
        const deal = new SponsorshipDeal({
            opportunity: opportunityId,
            sponsor: sponsor._id,
            proposedAmount: proposedAmount || opportunity.askingPrice,
            applicationMessage: message,
            status: 'applied'
        });

        await deal.save();

        // Update opportunity application count
        opportunity.applications += 1;
        await opportunity.save();

        // Send email notification to opportunity creator/admin
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'crickarena201@gmail.com';
            let targetName = 'Unknown';
            if (opportunity.targetType === 'tournament') {
                const tournament = await Tournament.findById(opportunity.targetId);
                targetName = tournament?.name || 'Tournament';
            } else if (opportunity.targetType === 'club') {
                const club = await Club.findById(opportunity.targetId);
                targetName = club?.clubName || 'Club';
            }

            await notifyDealApplied(
                adminEmail,
                sponsor.contactPerson,
                sponsor.companyName,
                opportunity.title,
                targetName,
                deal.proposedAmount
            );
        } catch (emailError) {
            console.warn('Failed to send application email:', emailError.message);
        }

        res.status(201).json({
            message: 'Application submitted successfully',
            deal
        });
    } catch (error) {
        console.error('Apply for sponsorship error:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

/**
 * GET /api/sponsorships/deals/my
 * Get current sponsor's deals
 */
router.get('/deals/my', async (req, res) => {
    try {
        const { firebaseUid, status, page = 1, limit = 20 } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const sponsor = await Sponsor.findOne({ user: user._id });
        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor profile not found' });
        }

        const query = { sponsor: sponsor._id };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [deals, total] = await Promise.all([
            SponsorshipDeal.find(query)
                .populate({
                    path: 'opportunity',
                    populate: { path: 'createdBy', select: 'name email' }
                })
                .populate({
                    path: 'agreement',
                    select: 'status agreementNumber sponsor club'
                })
                .sort({ appliedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            SponsorshipDeal.countDocuments(query)
        ]);

        // Populate target details for each deal
        const dealsWithTargets = await Promise.all(deals.map(async (deal) => {
            const dealObj = deal.toObject();
            if (deal.opportunity) {
                if (deal.opportunity.targetType === 'tournament') {
                    dealObj.target = await Tournament.findById(deal.opportunity.targetId)
                        .select('name district startDate endDate status');
                } else if (deal.opportunity.targetType === 'club') {
                    dealObj.target = await Club.findById(deal.opportunity.targetId)
                        .select('name clubName district');
                }
            }
            return dealObj;
        }));

        res.json({
            deals: dealsWithTargets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get my deals error:', error);
        res.status(500).json({ error: 'Failed to get deals' });
    }
});

/**
 * GET /api/sponsorships/deals/pending
 * Get pending deals for review (admin/club manager)
 * NOTE: This MUST come BEFORE /deals/:id to avoid matching 'pending' as an ID
 */
router.get('/deals/pending', async (req, res) => {
    try {
        const { firebaseUid, targetType, page = 1, limit = 20 } = req.query;

        console.log('[Pending Deals] Request params:', { firebaseUid, page, limit });

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            console.log('[Pending Deals] User not found for firebaseUid:', firebaseUid);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('[Pending Deals] User:', user._id.toString(), 'Role:', user.role);

        if (!['admin', 'clubManager'].includes(user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Build query based on role
        let query = { status: { $in: ['applied', 'under-review'] } };

        if (user.role === 'clubManager') {
            // Get club manager's club
            const club = await Club.findOne({ manager: user._id });
            console.log('[Pending Deals] Club lookup result:', club ? { id: club._id.toString(), name: club.clubName } : 'null');

            if (!club) {
                console.log('[Pending Deals] No club found for manager');
                return res.json({ deals: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
            }

            // Find opportunities for this club
            const clubOpportunities = await SponsorshipOpportunity.find({
                targetType: 'club',
                targetId: club._id
            }).select('_id title').lean();

            console.log('[Pending Deals] Club opportunities found:', clubOpportunities.length);
            if (clubOpportunities.length > 0) {
                console.log('[Pending Deals] Opportunity titles:', clubOpportunities.map(o => o.title));
            }

            if (clubOpportunities.length === 0) {
                console.log('[Pending Deals] No opportunities found for club');
                return res.json({ deals: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
            }

            query.opportunity = { $in: clubOpportunities.map(o => o._id) };
        }

        console.log('[Pending Deals] Final query:', JSON.stringify(query));

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [deals, total] = await Promise.all([
            SponsorshipDeal.find(query)
                .populate('sponsor', 'companyName logoUrl industry')
                .populate('opportunity')
                .sort({ appliedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            SponsorshipDeal.countDocuments(query)
        ]);

        console.log('[Pending Deals] Deals found:', deals.length, 'Total:', total);

        res.json({
            deals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get pending deals error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Failed to get pending deals', details: error.message });
    }
});

/**
 * GET /api/sponsorships/deals/:id
 * Get deal details
 */
router.get('/deals/:id', async (req, res) => {
    try {
        const deal = await SponsorshipDeal.findById(req.params.id)
            .populate('sponsor', 'companyName logoUrl industry contactPerson contactEmail')
            .populate({
                path: 'opportunity',
                populate: { path: 'createdBy', select: 'name email' }
            })
            .populate('reviewedBy', 'name email');

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        const dealObj = deal.toObject();

        // Populate target
        if (deal.opportunity) {
            if (deal.opportunity.targetType === 'tournament') {
                dealObj.target = await Tournament.findById(deal.opportunity.targetId)
                    .select('name description district location startDate endDate status');
            } else if (deal.opportunity.targetType === 'club') {
                dealObj.target = await Club.findById(deal.opportunity.targetId)
                    .select('name clubName district city description');
            }
        }

        res.json(dealObj);
    } catch (error) {
        console.error('Get deal error:', error);
        res.status(500).json({ error: 'Failed to get deal' });
    }
});



/**
 * PUT /api/sponsorships/deals/:id/review
 * Review (approve/reject) a deal
 */
router.put('/deals/:id/review', async (req, res) => {
    try {
        const { firebaseUid, action, agreedAmount, notes, rejectionReason, startDate, endDate } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!['admin', 'clubManager'].includes(user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const deal = await SponsorshipDeal.findById(req.params.id)
            .populate('opportunity');

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        // Verify club manager ownership for club sponsorships
        if (user.role === 'clubManager' && deal.opportunity.targetType === 'club') {
            const club = await Club.findById(deal.opportunity.targetId);
            if (!club || club.manager.toString() !== user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized to review this deal' });
            }
        }

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
        }

        deal.reviewedBy = user._id;
        deal.reviewedAt = new Date();
        deal.reviewNotes = notes;

        // Get sponsor info for email
        const sponsor = await Sponsor.findById(deal.sponsor);

        if (action === 'approve') {
            deal.status = 'approved';
            deal.agreedAmount = agreedAmount || deal.proposedAmount;
            deal.startDate = startDate ? new Date(startDate) : new Date();
            deal.endDate = endDate ? new Date(endDate) : null;

            // Update opportunity
            const opportunity = await SponsorshipOpportunity.findById(deal.opportunity._id);
            opportunity.currentSponsors += 1;
            if (opportunity.currentSponsors >= opportunity.maxSponsors) {
                opportunity.status = 'filled';
            }
            await opportunity.save();

            // Update sponsor analytics
            await Sponsor.findByIdAndUpdate(deal.sponsor, {
                $inc: {
                    'analytics.totalDeals': 1,
                    'analytics.activeDeals': 1,
                    'analytics.totalSpent': deal.agreedAmount
                }
            });

            // Send approval email to sponsor
            try {
                await notifyDealApproved(
                    sponsor.contactEmail,
                    sponsor.contactPerson,
                    sponsor.companyName,
                    deal.opportunity.title,
                    deal.agreedAmount,
                    deal.startDate
                );
            } catch (emailError) {
                console.warn('Failed to send approval email:', emailError.message);
            }
        } else {
            deal.status = 'rejected';
            deal.rejectionReason = rejectionReason || 'Application rejected';

            // Send rejection email to sponsor
            try {
                await notifyDealRejected(
                    sponsor.contactEmail,
                    sponsor.contactPerson,
                    sponsor.companyName,
                    deal.opportunity.title,
                    rejectionReason
                );
            } catch (emailError) {
                console.warn('Failed to send rejection email:', emailError.message);
            }
        }

        await deal.save();

        res.json({
            message: `Deal ${action}d successfully`,
            deal
        });
    } catch (error) {
        console.error('Review deal error:', error);
        res.status(500).json({ error: 'Failed to review deal' });
    }
});

/**
 * PUT /api/sponsorships/deals/:id/activate
 * Activate an approved deal
 */
router.put('/deals/:id/activate', async (req, res) => {
    try {
        const { firebaseUid } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const deal = await SponsorshipDeal.findById(req.params.id);
        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        if (deal.status !== 'approved') {
            return res.status(400).json({ error: 'Only approved deals can be activated' });
        }

        deal.status = 'active';
        if (!deal.startDate) deal.startDate = new Date();

        await deal.save();

        res.json({
            message: 'Deal activated successfully',
            deal
        });
    } catch (error) {
        console.error('Activate deal error:', error);
        res.status(500).json({ error: 'Failed to activate deal' });
    }
});

/**
 * PUT /api/sponsorships/deals/:id/cancel
 * Cancel a deal
 */
router.put('/deals/:id/cancel', async (req, res) => {
    try {
        const { firebaseUid, reason } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const deal = await SponsorshipDeal.findById(req.params.id)
            .populate('sponsor');

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        // Verify authorization (sponsor owner, club manager, or admin)
        const sponsor = await Sponsor.findById(deal.sponsor._id);
        const isOwner = sponsor && sponsor.user.toString() === user._id.toString();
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to cancel this deal' });
        }

        if (['completed', 'cancelled'].includes(deal.status)) {
            return res.status(400).json({ error: 'Cannot cancel a completed or already cancelled deal' });
        }

        // If was active, update analytics
        if (deal.status === 'active') {
            await Sponsor.findByIdAndUpdate(deal.sponsor._id, {
                $inc: { 'analytics.activeDeals': -1 }
            });

            // Update opportunity
            await SponsorshipOpportunity.findByIdAndUpdate(deal.opportunity, {
                $inc: { currentSponsors: -1 },
                status: 'open'
            });
        }

        deal.status = 'cancelled';
        deal.cancelledBy = user._id;
        deal.cancelledAt = new Date();
        deal.cancellationReason = reason || 'Cancelled by user';

        await deal.save();

        res.json({
            message: 'Deal cancelled successfully',
            deal
        });
    } catch (error) {
        console.error('Cancel deal error:', error);
        res.status(500).json({ error: 'Failed to cancel deal' });
    }
});

// =============================================
// HELPER ROUTES
// =============================================

/**
 * GET /api/sponsorships/target/:type/:id/sponsors
 * Get active sponsors for a tournament or club
 */
router.get('/target/:type/:id/sponsors', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { format } = req.query; // 'full' for club manager view

        if (!['tournament', 'club'].includes(type)) {
            return res.status(400).json({ error: 'Invalid target type' });
        }

        // Find opportunities for this target
        const opportunities = await SponsorshipOpportunity.find({
            targetType: type,
            targetId: id
        }).select('_id tier title');

        // Find active/approved deals with full info
        const deals = await SponsorshipDeal.find({
            opportunity: { $in: opportunities.map(o => o._id) },
            status: { $in: ['active', 'approved'] }
        })
            .populate('sponsor', 'companyName logoUrl industry website contactPerson')
            .populate('opportunity', 'tier title askingPrice')
            .populate('agreement', 'status agreementNumber');

        // Return full deal objects if format=full (for club manager)
        if (format === 'full') {
            return res.json({
                deals: deals.map(deal => ({
                    _id: deal._id,
                    sponsor: deal.sponsor,
                    opportunity: deal.opportunity,
                    status: deal.status,
                    agreedAmount: deal.agreedAmount,
                    proposedAmount: deal.proposedAmount,
                    startDate: deal.startDate,
                    endDate: deal.endDate,
                    reviewedAt: deal.reviewedAt,
                    agreement: deal.agreement // Include agreement for status display
                }))
            });
        }

        // Default: Group by tier (for public display)
        const sponsorsByTier = {};
        for (const deal of deals) {
            const opp = opportunities.find(o => o._id.toString() === deal.opportunity._id.toString());
            if (opp) {
                if (!sponsorsByTier[opp.tier]) sponsorsByTier[opp.tier] = [];
                sponsorsByTier[opp.tier].push(deal.sponsor);
            }
        }

        res.json(sponsorsByTier);
    } catch (error) {
        console.error('Get target sponsors error:', error);
        res.status(500).json({ error: 'Failed to get sponsors' });
    }
});

/**
 * GET /api/sponsorships/target/:type/:id/opportunities
 * Get sponsorship opportunities for a tournament or club
 */
router.get('/target/:type/:id/opportunities', async (req, res) => {
    try {
        const { type, id } = req.params;

        if (!['tournament', 'club'].includes(type)) {
            return res.status(400).json({ error: 'Invalid target type' });
        }

        const opportunities = await SponsorshipOpportunity.find({
            targetType: type,
            targetId: id,
            status: 'open',
            visibility: 'public'
        }).sort({ tier: 1 });

        res.json(opportunities);
    } catch (error) {
        console.error('Get target opportunities error:', error);
        res.status(500).json({ error: 'Failed to get opportunities' });
    }
});

export default router;
