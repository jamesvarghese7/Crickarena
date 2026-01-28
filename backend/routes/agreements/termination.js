/**
 * Agreement Termination Routes
 * Handles agreement termination
 */
import express from 'express';
import SponsorshipAgreement from '../../models/SponsorshipAgreement.js';
import SponsorshipDeal from '../../models/SponsorshipDeal.js';
import Sponsor from '../../models/Sponsor.js';
import Club from '../../models/Club.js';
import User from '../../models/User.js';

const router = express.Router();

/**
 * PUT /api/agreements/:id/terminate
 * Terminate an agreement
 */
router.put('/:id/terminate', async (req, res) => {
    try {
        const { firebaseUid, reason } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!reason) {
            return res.status(400).json({ error: 'Termination reason is required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        if (agreement.status !== 'active') {
            return res.status(400).json({ error: 'Only active agreements can be terminated' });
        }

        // Verify access
        const club = await Club.findOne({ manager: user._id });
        const sponsor = await Sponsor.findOne({ user: user._id });

        const isClubManager = club && agreement.club.clubRef.toString() === club._id.toString();
        const isSponsor = sponsor && agreement.sponsor.sponsorRef.toString() === sponsor._id.toString();
        const isAdmin = user.role === 'admin';

        if (!isClubManager && !isSponsor && !isAdmin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        agreement.status = 'terminated';
        agreement.terminatedBy = user._id;
        agreement.terminatedAt = new Date();
        agreement.terminationReason = reason;

        agreement.addHistory('terminated', user._id, `Agreement terminated: ${reason}`);

        await agreement.save();

        // Update deal status
        const deal = await SponsorshipDeal.findById(agreement.deal);
        if (deal) {
            deal.status = 'cancelled';
            deal.cancelledBy = user._id;
            deal.cancelledAt = new Date();
            deal.cancellationReason = `Agreement terminated: ${reason}`;
            await deal.save();
        }

        res.json({
            message: 'Agreement terminated successfully',
            agreement
        });
    } catch (error) {
        console.error('Terminate agreement error:', error);
        res.status(500).json({ error: 'Failed to terminate agreement' });
    }
});

export default router;
