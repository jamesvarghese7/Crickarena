/**
 * Agreement Core Routes
 * Handles agreement CRUD operations
 */
import express from 'express';
import SponsorshipAgreement from '../../models/SponsorshipAgreement.js';
import SponsorshipDeal from '../../models/SponsorshipDeal.js';
import Sponsor from '../../models/Sponsor.js';
import Club from '../../models/Club.js';
import User from '../../models/User.js';
import sponsorEmails from '../../utils/sponsorEmails.js';

const router = express.Router();

/**
 * POST /api/agreements
 * Create a new agreement from an approved deal (Club Manager)
 */
router.post('/', async (req, res) => {
    try {
        const { firebaseUid, dealId, deliverables, paymentSchedule, terms, startDate, endDate } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify user is club manager
        if (user.role !== 'clubManager' && user.role !== 'admin') {
            return res.status(403).json({ error: 'Only club managers can create agreements' });
        }

        // Get the deal
        const deal = await SponsorshipDeal.findById(dealId)
            .populate({
                path: 'opportunity',
                populate: { path: 'targetId' }
            })
            .populate('sponsor');

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        // Verify deal is approved
        if (deal.status !== 'approved' && deal.status !== 'active') {
            return res.status(400).json({ error: 'Agreement can only be created for approved deals' });
        }

        // Check if agreement already exists
        const existingAgreement = await SponsorshipAgreement.findOne({ deal: dealId });
        if (existingAgreement) {
            return res.status(400).json({ error: 'Agreement already exists for this deal' });
        }

        // ========== DATE VALIDATIONS ==========
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        // Validate start date is not in the past
        if (parsedStartDate < today) {
            return res.status(400).json({ error: 'Start date cannot be in the past' });
        }

        // Validate end date is after start date
        if (parsedEndDate <= parsedStartDate) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        // Validate deliverable due dates are within contract period
        if (deliverables && deliverables.length > 0) {
            for (const del of deliverables) {
                if (del.dueDate) {
                    const dueDate = new Date(del.dueDate);
                    if (dueDate < parsedStartDate || dueDate > parsedEndDate) {
                        return res.status(400).json({
                            error: `Deliverable "${del.title}" due date must be within contract period (${startDate} to ${endDate})`
                        });
                    }
                }
            }
        }

        // Validate payment due dates are within contract period
        if (paymentSchedule && paymentSchedule.length > 0) {
            for (const payment of paymentSchedule) {
                if (payment.dueDate) {
                    const paymentDue = new Date(payment.dueDate);
                    if (paymentDue < parsedStartDate || paymentDue > parsedEndDate) {
                        return res.status(400).json({
                            error: `Payment milestone "${payment.milestone}" due date must be within contract period (${startDate} to ${endDate})`
                        });
                    }
                }
            }
        }
        // ========== END DATE VALIDATIONS ==========

        // Get club
        let club;
        if (deal.opportunity?.targetType === 'club') {
            club = deal.opportunity.targetId;
        } else {
            // For tournament deals, get the user's club
            club = await Club.findOne({ manager: user._id });
        }

        if (!club) {
            return res.status(404).json({ error: 'Club not found' });
        }

        // Verify club manager owns this club
        if (user.role === 'clubManager' && club.manager.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'You can only create agreements for your own club' });
        }

        // Get sponsor
        const sponsor = await Sponsor.findById(deal.sponsor._id || deal.sponsor)
            .populate('user');

        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        // Create agreement
        const agreement = new SponsorshipAgreement({
            deal: deal._id,
            sponsor: {
                sponsorRef: sponsor._id,
                signatory: {
                    name: sponsor.contactPerson || sponsor.user?.name,
                    designation: 'Authorized Representative',
                    email: sponsor.contactEmail || sponsor.user?.email
                }
            },
            club: {
                clubRef: club._id,
                signatory: {
                    name: user.name,
                    designation: 'Club Manager',
                    email: user.email
                }
            },
            financialTerms: {
                totalAmount: deal.agreedAmount || deal.proposedAmount,
                currency: 'INR',
                paymentSchedule: paymentSchedule || [{
                    milestone: 'On Agreement Signing',
                    amount: deal.agreedAmount || deal.proposedAmount,
                    dueDate: new Date(startDate),
                    status: 'pending'
                }]
            },
            deliverables: deliverables || [],
            terms: terms || {
                nonCompete: { enabled: false },
                exclusivity: 'non-exclusive',
                termination: { noticePeriodDays: 30, penaltyPercentage: 0 },
                renewal: { autoRenew: false }
            },
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: 'pending-sponsor',
            createdBy: user._id
        });

        agreement.addHistory('created', user._id, 'Agreement created by club manager');
        agreement.addHistory('sent-to-sponsor', user._id, 'Agreement sent to sponsor for signature');

        await agreement.save();

        // Update deal with agreement reference
        deal.agreement = agreement._id;
        await deal.save();

        // Send email to sponsor
        try {
            if (sponsorEmails.notifyAgreementCreated) {
                await sponsorEmails.notifyAgreementCreated(
                    sponsor.contactEmail || sponsor.user?.email,
                    sponsor.contactPerson || sponsor.user?.name,
                    sponsor.companyName,
                    club.name,
                    agreement.agreementNumber
                );
            }
        } catch (emailError) {
            console.error('Failed to send agreement notification email:', emailError);
        }

        res.status(201).json({
            message: 'Agreement created successfully',
            agreement: await SponsorshipAgreement.findById(agreement._id)
                .populate('deal')
                .populate('sponsor.sponsorRef', 'companyName contactPerson contactEmail')
                .populate('club.clubRef', 'name district')
        });
    } catch (error) {
        console.error('Create agreement error:', error);
        res.status(500).json({ error: 'Failed to create agreement' });
    }
});

/**
 * GET /api/agreements/:id
 * Get agreement details
 */
router.get('/:id', async (req, res) => {
    try {
        const { firebaseUid } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id)
            .populate({
                path: 'deal',
                populate: [
                    { path: 'opportunity' },
                    { path: 'sponsor', select: 'companyName contactPerson contactEmail logoUrl' }
                ]
            })
            .populate('sponsor.sponsorRef', 'companyName contactPerson contactEmail logoUrl user')
            .populate('club.clubRef', 'name district logo homeGround')
            .populate('createdBy', 'name email')
            .populate('history.performedBy', 'name');

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify access (sponsor, club manager, or admin)
        const sponsor = await Sponsor.findOne({ user: user._id });
        const club = await Club.findOne({ manager: user._id });

        const isSponsor = sponsor && agreement.sponsor.sponsorRef._id.toString() === sponsor._id.toString();
        const isClubManager = club && agreement.club.clubRef._id.toString() === club._id.toString();
        const isAdmin = user.role === 'admin';

        if (!isSponsor && !isClubManager && !isAdmin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(agreement);
    } catch (error) {
        console.error('Get agreement error:', error);
        res.status(500).json({ error: 'Failed to get agreement' });
    }
});

/**
 * GET /api/agreements/deal/:dealId
 * Get agreement by deal ID
 */
router.get('/deal/:dealId', async (req, res) => {
    try {
        const { firebaseUid } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const agreement = await SponsorshipAgreement.findOne({ deal: req.params.dealId })
            .populate('sponsor.sponsorRef', 'companyName contactPerson')
            .populate('club.clubRef', 'name');

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found for this deal' });
        }

        res.json(agreement);
    } catch (error) {
        console.error('Get agreement by deal error:', error);
        res.status(500).json({ error: 'Failed to get agreement' });
    }
});

/**
 * GET /api/agreements/my/club
 * Get all agreements for the club manager's club
 */
router.get('/my/club', async (req, res) => {
    try {
        const { firebaseUid, status } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const club = await Club.findOne({ manager: user._id });
        if (!club) {
            return res.status(404).json({ error: 'Club not found' });
        }

        const query = { 'club.clubRef': club._id };
        if (status) {
            query.status = status;
        }

        const agreements = await SponsorshipAgreement.find(query)
            .populate('sponsor.sponsorRef', 'companyName contactPerson logoUrl')
            .populate('deal')
            .sort({ createdAt: -1 });

        res.json(agreements);
    } catch (error) {
        console.error('Get club agreements error:', error);
        res.status(500).json({ error: 'Failed to get agreements' });
    }
});

/**
 * GET /api/agreements/my/sponsor
 * Get all agreements for the sponsor
 */
router.get('/my/sponsor', async (req, res) => {
    try {
        const { firebaseUid, status } = req.query;

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

        const query = { 'sponsor.sponsorRef': sponsor._id };
        if (status) {
            query.status = status;
        }

        const agreements = await SponsorshipAgreement.find(query)
            .populate('club.clubRef', 'name district logo')
            .populate('deal')
            .sort({ createdAt: -1 });

        res.json(agreements);
    } catch (error) {
        console.error('Get sponsor agreements error:', error);
        res.status(500).json({ error: 'Failed to get agreements' });
    }
});

export default router;
