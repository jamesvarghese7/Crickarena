/**
 * Agreement Signing Routes
 * Handles agreement signature operations
 */
import express from 'express';
import SponsorshipAgreement from '../../models/SponsorshipAgreement.js';
import SponsorshipDeal from '../../models/SponsorshipDeal.js';
import Sponsor from '../../models/Sponsor.js';
import Club from '../../models/Club.js';
import User from '../../models/User.js';
import PaymentTransaction from '../../models/PaymentTransaction.js';
import sponsorEmails from '../../utils/sponsorEmails.js';

const router = express.Router();

/**
 * PUT /api/agreements/:id/sign
 * Sign the agreement (sponsor or club)
 */
router.put('/:id/sign', async (req, res) => {
    try {
        const { firebaseUid, signature, signatoryName, signatoryDesignation } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!signature) {
            return res.status(400).json({ error: 'Signature is required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id)
            .populate('sponsor.sponsorRef')
            .populate('club.clubRef');

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Determine who is signing
        const sponsor = await Sponsor.findOne({ user: user._id });
        const club = await Club.findOne({ manager: user._id });

        const isSponsor = sponsor && agreement.sponsor.sponsorRef._id.toString() === sponsor._id.toString();
        const isClubManager = club && agreement.club.clubRef._id.toString() === club._id.toString();

        if (!isSponsor && !isClubManager) {
            return res.status(403).json({ error: 'You are not a party to this agreement' });
        }

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (isSponsor) {
            // Sponsor signing
            if (agreement.status !== 'pending-sponsor') {
                return res.status(400).json({ error: 'Agreement is not pending sponsor signature' });
            }

            agreement.sponsor.signatory.name = signatoryName || agreement.sponsor.signatory.name;
            agreement.sponsor.signatory.designation = signatoryDesignation || agreement.sponsor.signatory.designation;
            agreement.sponsor.signature = signature;
            agreement.sponsor.signedAt = new Date();
            agreement.sponsor.ipAddress = clientIp;

            agreement.status = 'pending-club';
            agreement.addHistory('sponsor-signed', user._id, 'Sponsor signed the agreement');
            agreement.addHistory('sent-to-club', user._id, 'Agreement sent to club for counter-signature');

            // Notify club manager
            try {
                const clubManager = await User.findById(agreement.club.clubRef.manager);
                if (clubManager && sponsorEmails.notifyAgreementSigned) {
                    await sponsorEmails.notifyAgreementSigned(
                        clubManager.email,
                        clubManager.name,
                        sponsor.companyName,
                        agreement.agreementNumber
                    );
                }
            } catch (emailError) {
                console.error('Failed to send signature notification:', emailError);
            }

        } else if (isClubManager) {
            // Club manager signing
            if (agreement.status !== 'pending-club') {
                return res.status(400).json({ error: 'Agreement is not pending club signature' });
            }

            agreement.club.signatory.name = signatoryName || agreement.club.signatory.name;
            agreement.club.signatory.designation = signatoryDesignation || agreement.club.signatory.designation;
            agreement.club.signature = signature;
            agreement.club.signedAt = new Date();
            agreement.club.ipAddress = clientIp;

            agreement.status = 'active';
            agreement.addHistory('club-signed', user._id, 'Club manager signed the agreement');
            agreement.addHistory('activated', user._id, 'Agreement is now active');

            // Update the deal status
            const deal = await SponsorshipDeal.findById(agreement.deal);
            if (deal) {
                deal.status = 'active';
                deal.startDate = agreement.startDate;
                deal.endDate = agreement.endDate;
                await deal.save();
            }

            // Notify sponsor
            try {
                const sponsorData = await Sponsor.findById(agreement.sponsor.sponsorRef).populate('user');
                if (sponsorData && sponsorEmails.notifyAgreementActive) {
                    await sponsorEmails.notifyAgreementActive(
                        sponsorData.contactEmail || sponsorData.user?.email,
                        sponsorData.contactPerson || sponsorData.user?.name,
                        sponsorData.companyName,
                        club.name,
                        agreement.agreementNumber
                    );
                }
            } catch (emailError) {
                console.error('Failed to send activation notification:', emailError);
            }

            // Auto-create payment request for "On Agreement Signing" milestone
            try {
                const paymentSchedule = agreement.financialTerms?.paymentSchedule || [];
                for (let i = 0; i < paymentSchedule.length; i++) {
                    const milestone = paymentSchedule[i];
                    // Check if this is a signing-related milestone
                    if (milestone.milestone &&
                        milestone.milestone.toLowerCase().includes('signing') &&
                        milestone.status !== 'paid') {

                        // Check if request already exists
                        const existingRequest = await PaymentTransaction.findOne({
                            agreement: agreement._id,
                            milestoneIndex: i,
                            status: { $in: ['pending', 'approved', 'processing', 'completed'] }
                        });

                        if (!existingRequest) {
                            // Auto-create payment request
                            const autoTransaction = new PaymentTransaction({
                                agreement: agreement._id,
                                type: 'fund-request',
                                amount: milestone.amount,
                                milestoneIndex: i,
                                milestoneName: milestone.milestone,
                                status: 'pending',
                                requestedBy: user._id,
                                requestNotes: 'Auto-created: Agreement signed and activated'
                            });
                            await autoTransaction.save();

                            agreement.addHistory('payment-requested', user._id,
                                `Auto-created fund request of ₹${milestone.amount.toLocaleString()} for "${milestone.milestone}"`
                            );
                        }
                    }
                }
            } catch (autoPaymentError) {
                console.error('Failed to auto-create payment request:', autoPaymentError);
            }
        }

        await agreement.save();

        res.json({
            message: 'Agreement signed successfully',
            agreement
        });
    } catch (error) {
        console.error('Sign agreement error:', error);
        res.status(500).json({ error: 'Failed to sign agreement' });
    }
});

export default router;
