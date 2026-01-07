import express from 'express';
import Sponsor from '../models/Sponsor.js';
import User from '../models/User.js';
import SponsorshipDeal from '../models/SponsorshipDeal.js';
import { notifySponsorVerified, notifySponsorRejected } from '../utils/sponsorEmails.js';

const router = express.Router();

// =============================================
// SPONSOR REGISTRATION & PROFILE
// =============================================

/**
 * POST /api/sponsors/register
 * Register as a sponsor (requires authenticated user)
 */
router.post('/register', async (req, res) => {
    try {
        const { firebaseUid } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Find user
        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already a sponsor
        const existingSponsor = await Sponsor.findOne({ user: user._id });
        if (existingSponsor) {
            return res.status(400).json({ error: 'Already registered as a sponsor' });
        }

        // Validate required fields
        const { companyName, industry, contactPerson, contactEmail, contactPhone } = req.body;

        if (!companyName || !companyName.trim()) {
            return res.status(400).json({ error: 'Company name is required' });
        }

        // Create sponsor profile
        const sponsor = new Sponsor({
            user: user._id,
            companyName: companyName.trim(),
            industry: industry || 'other',
            website: req.body.website,
            description: req.body.description,
            contactPerson: contactPerson || user.name,
            contactEmail: contactEmail || user.email,
            contactPhone: contactPhone || user.phone,
            address: req.body.address || {},
            budget: req.body.budget || { min: 10000, max: 500000 },
            preferredTypes: req.body.preferredTypes || [],
            preferredDistricts: req.body.preferredDistricts || [],
            status: 'pending'
        });

        await sponsor.save();

        // Update user role
        user.role = 'sponsor';
        await user.save();

        res.status(201).json({
            message: 'Sponsor registration submitted successfully. Awaiting admin verification.',
            sponsor: {
                _id: sponsor._id,
                companyName: sponsor.companyName,
                status: sponsor.status
            }
        });
    } catch (error) {
        console.error('Sponsor registration error:', error);
        res.status(500).json({ error: 'Failed to register as sponsor' });
    }
});

/**
 * GET /api/sponsors/me
 * Get current sponsor's profile
 */
router.get('/me', async (req, res) => {
    try {
        const { firebaseUid } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const sponsor = await Sponsor.findOne({ user: user._id })
            .populate('verifiedBy', 'name email');

        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor profile not found' });
        }

        // Get deal statistics
        const dealStats = await SponsorshipDeal.aggregate([
            { $match: { sponsor: sponsor._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$agreedAmount' }
                }
            }
        ]);

        res.json({
            sponsor,
            dealStats
        });
    } catch (error) {
        console.error('Get sponsor profile error:', error);
        res.status(500).json({ error: 'Failed to get sponsor profile' });
    }
});

/**
 * PUT /api/sponsors/me
 * Update current sponsor's profile
 */
router.put('/me', async (req, res) => {
    try {
        const { firebaseUid } = req.body;

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

        // Fields that can be updated
        const allowedUpdates = [
            'companyName', 'industry', 'website', 'description',
            'contactPerson', 'contactEmail', 'contactPhone',
            'address', 'budget', 'preferredTypes', 'preferredDistricts'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                sponsor[field] = req.body[field];
            }
        });

        await sponsor.save();

        res.json({
            message: 'Profile updated successfully',
            sponsor
        });
    } catch (error) {
        console.error('Update sponsor profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * POST /api/sponsors/me/logo
 * Upload sponsor logo
 */
router.post('/me/logo', async (req, res) => {
    try {
        const { firebaseUid, logoData, contentType } = req.body;

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

        if (!logoData) {
            return res.status(400).json({ error: 'Logo data is required' });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(logoData, 'base64');

        sponsor.logo = {
            data: buffer,
            contentType: contentType || 'image/png'
        };
        sponsor.logoUrl = `/api/sponsors/${sponsor._id}/logo`;

        await sponsor.save();

        res.json({
            message: 'Logo uploaded successfully',
            logoUrl: sponsor.logoUrl
        });
    } catch (error) {
        console.error('Upload logo error:', error);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
});

/**
 * GET /api/sponsors/:id/logo
 * Get sponsor logo image
 */
router.get('/:id/logo', async (req, res) => {
    try {
        const sponsor = await Sponsor.findById(req.params.id);

        if (!sponsor || !sponsor.logo || !sponsor.logo.data) {
            return res.status(404).json({ error: 'Logo not found' });
        }

        res.set('Content-Type', sponsor.logo.contentType);
        res.send(sponsor.logo.data);
    } catch (error) {
        console.error('Get logo error:', error);
        res.status(500).json({ error: 'Failed to get logo' });
    }
});

/**
 * GET /api/sponsors/:id
 * Get sponsor by ID (public info)
 */
router.get('/:id', async (req, res) => {
    try {
        const sponsor = await Sponsor.findById(req.params.id)
            .select('-logo.data'); // Exclude binary data

        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        // Only return verified sponsors to public
        if (sponsor.status !== 'verified') {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        res.json(sponsor);
    } catch (error) {
        console.error('Get sponsor error:', error);
        res.status(500).json({ error: 'Failed to get sponsor' });
    }
});

// =============================================
// ADMIN ROUTES
// =============================================

/**
 * GET /api/sponsors
 * List all sponsors (admin only)
 */
router.get('/', async (req, res) => {
    try {
        const { firebaseUid, status, industry, page = 1, limit = 20 } = req.query;

        // Verify admin
        if (firebaseUid) {
            const user = await User.findOne({ firebaseUid });
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }
        }

        const query = {};
        if (status) query.status = status;
        if (industry) query.industry = industry;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [sponsors, total] = await Promise.all([
            Sponsor.find(query)
                .select('-logo.data')
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Sponsor.countDocuments(query)
        ]);

        res.json({
            sponsors,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('List sponsors error:', error);
        res.status(500).json({ error: 'Failed to list sponsors' });
    }
});

/**
 * PUT /api/sponsors/:id/verify
 * Verify a sponsor (admin only)
 */
router.put('/:id/verify', async (req, res) => {
    try {
        const { firebaseUid } = req.body;

        // Verify admin
        const adminUser = await User.findOne({ firebaseUid });
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        sponsor.status = 'verified';
        sponsor.verifiedAt = new Date();
        sponsor.verifiedBy = adminUser._id;
        sponsor.rejectionReason = null;

        await sponsor.save();

        // Send email notification
        try {
            await notifySponsorVerified(
                sponsor.contactEmail,
                sponsor.contactPerson,
                sponsor.companyName
            );
        } catch (emailError) {
            console.warn('Failed to send verification email:', emailError.message);
        }

        res.json({
            message: 'Sponsor verified successfully',
            sponsor
        });
    } catch (error) {
        console.error('Verify sponsor error:', error);
        res.status(500).json({ error: 'Failed to verify sponsor' });
    }
});

/**
 * PUT /api/sponsors/:id/reject
 * Reject a sponsor (admin only)
 */
router.put('/:id/reject', async (req, res) => {
    try {
        const { firebaseUid, reason } = req.body;

        // Verify admin
        const adminUser = await User.findOne({ firebaseUid });
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        sponsor.status = 'rejected';
        sponsor.rejectionReason = reason || 'Application rejected by admin';

        await sponsor.save();

        // Revert user role to public
        await User.findByIdAndUpdate(sponsor.user, { role: 'public' });

        // Send email notification
        try {
            await notifySponsorRejected(
                sponsor.contactEmail,
                sponsor.contactPerson,
                sponsor.companyName,
                reason
            );
        } catch (emailError) {
            console.warn('Failed to send rejection email:', emailError.message);
        }

        res.json({
            message: 'Sponsor rejected',
            sponsor
        });
    } catch (error) {
        console.error('Reject sponsor error:', error);
        res.status(500).json({ error: 'Failed to reject sponsor' });
    }
});

/**
 * PUT /api/sponsors/:id/suspend
 * Suspend a sponsor (admin only)
 */
router.put('/:id/suspend', async (req, res) => {
    try {
        const { firebaseUid, reason } = req.body;

        // Verify admin
        const adminUser = await User.findOne({ firebaseUid });
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        sponsor.status = 'suspended';
        sponsor.suspensionReason = reason || 'Account suspended by admin';

        await sponsor.save();

        res.json({
            message: 'Sponsor suspended',
            sponsor
        });
    } catch (error) {
        console.error('Suspend sponsor error:', error);
        res.status(500).json({ error: 'Failed to suspend sponsor' });
    }
});

/**
 * GET /api/sponsors/stats/overview
 * Get platform-wide sponsor statistics (admin only)
 */
router.get('/stats/overview', async (req, res) => {
    try {
        const { firebaseUid } = req.query;

        // Verify admin
        if (firebaseUid) {
            const user = await User.findOne({ firebaseUid });
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }
        }

        const [statusCounts, industryCounts, totalDeals] = await Promise.all([
            Sponsor.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Sponsor.aggregate([
                { $match: { status: 'verified' } },
                { $group: { _id: '$industry', count: { $sum: 1 } } }
            ]),
            SponsorshipDeal.aggregate([
                { $match: { status: 'active' } },
                { $group: { _id: null, count: { $sum: 1 }, totalValue: { $sum: '$agreedAmount' } } }
            ])
        ]);

        res.json({
            statusCounts: statusCounts.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
            industryCounts: industryCounts.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
            activeDeals: totalDeals[0] || { count: 0, totalValue: 0 }
        });
    } catch (error) {
        console.error('Get sponsor stats error:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

export default router;
