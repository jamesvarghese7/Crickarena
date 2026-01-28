/**
 * Agreement Deliverables Routes
 * Handles deliverable tracking and evidence management
 */
import express from 'express';
import SponsorshipAgreement from '../../models/SponsorshipAgreement.js';
import Sponsor from '../../models/Sponsor.js';
import Club from '../../models/Club.js';
import User from '../../models/User.js';

const router = express.Router();

/**
 * PUT /api/agreements/:id/deliverables/:idx
 * Update deliverable status
 */
router.put('/:id/deliverables/:idx', async (req, res) => {
    try {
        const { firebaseUid, status, notes } = req.body;
        const { id, idx } = req.params;
        const deliverableIndex = parseInt(idx);

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        if (agreement.status !== 'active') {
            return res.status(400).json({ error: 'Agreement is not active' });
        }

        if (!agreement.deliverables[deliverableIndex]) {
            return res.status(404).json({ error: 'Deliverable not found' });
        }

        // Verify access
        const club = await Club.findOne({ manager: user._id });
        const sponsor = await Sponsor.findOne({ user: user._id });

        const isClubManager = club && agreement.club.clubRef.toString() === club._id.toString();
        const isSponsor = sponsor && agreement.sponsor.sponsorRef.toString() === sponsor._id.toString();

        if (!isClubManager && !isSponsor && user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Update deliverable
        const deliverable = agreement.deliverables[deliverableIndex];

        if (status) {
            // Only club can mark as completed, sponsor can verify
            if (status === 'completed' && !isClubManager) {
                return res.status(403).json({ error: 'Only club manager can mark as completed' });
            }
            if (status === 'verified' && !isSponsor) {
                return res.status(403).json({ error: 'Only sponsor can verify deliverables' });
            }

            deliverable.status = status;
            if (status === 'completed') {
                deliverable.completedAt = new Date();
            }
            if (status === 'verified') {
                deliverable.verifiedAt = new Date();
            }
        }

        if (notes) {
            deliverable.notes = notes;
        }

        agreement.addHistory('deliverable-updated', user._id,
            `Deliverable "${deliverable.title}" updated to ${status}`,
            { deliverableIndex, status }
        );

        await agreement.save();

        res.json({
            message: 'Deliverable updated successfully',
            deliverable
        });
    } catch (error) {
        console.error('Update deliverable error:', error);
        res.status(500).json({ error: 'Failed to update deliverable' });
    }
});

/**
 * POST /api/agreements/:id/deliverables/:idx/evidence
 * Add evidence to a deliverable
 */
router.post('/:id/deliverables/:idx/evidence', async (req, res) => {
    try {
        const { firebaseUid, evidenceType, url, description } = req.body;
        const { id, idx } = req.params;
        const deliverableIndex = parseInt(idx);

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!evidenceType || !url) {
            return res.status(400).json({ error: 'Evidence type and URL are required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        if (!agreement.deliverables[deliverableIndex]) {
            return res.status(404).json({ error: 'Deliverable not found' });
        }

        // Only club manager can add evidence
        const club = await Club.findOne({ manager: user._id });
        if (!club || agreement.club.clubRef.toString() !== club._id.toString()) {
            return res.status(403).json({ error: 'Only club manager can add evidence' });
        }

        agreement.deliverables[deliverableIndex].evidence.push({
            type: evidenceType,
            url,
            description,
            uploadedAt: new Date()
        });

        agreement.addHistory('deliverable-updated', user._id,
            `Evidence added to "${agreement.deliverables[deliverableIndex].title}"`,
            { deliverableIndex, evidenceType }
        );

        await agreement.save();

        res.json({
            message: 'Evidence added successfully',
            deliverable: agreement.deliverables[deliverableIndex]
        });
    } catch (error) {
        console.error('Add evidence error:', error);
        res.status(500).json({ error: 'Failed to add evidence' });
    }
});

export default router;
