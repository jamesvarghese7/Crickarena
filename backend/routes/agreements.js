import express from 'express';
import SponsorshipAgreement from '../models/SponsorshipAgreement.js';
import SponsorshipDeal from '../models/SponsorshipDeal.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';
import User from '../models/User.js';
import sponsorEmails from '../utils/sponsorEmails.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import razorpayUtils from '../utils/razorpay.js';

const router = express.Router();

// =============================================
// AGREEMENT CREATION
// =============================================

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

        // Parse dates
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

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

            // Validate total amount
            const totalScheduled = paymentSchedule.reduce((sum, p) => sum + (p.amount || 0), 0);
            const agreedAmount = deal.agreedAmount || deal.proposedAmount;

            // Allow a small margin for floating point errors, though usually integers are used
            if (totalScheduled > agreedAmount + 1) {
                return res.status(400).json({
                    error: `Payment schedule total (₹${totalScheduled}) cannot exceed the agreed amount (₹${agreedAmount})`
                });
            }
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

// =============================================
// GET AGREEMENTS
// =============================================

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

// =============================================
// SIGNING
// =============================================

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

            // Issue 3: Auto-create payment request for "On Agreement Signing" milestone
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

// =============================================
// DELIVERABLES
// =============================================

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

// =============================================
// PDF GENERATION
// =============================================

/**
 * GET /api/agreements/:id/pdf
 * Generate and download agreement PDF
 */
router.get('/:id/pdf', async (req, res) => {
    try {
        const { firebaseUid, format } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id)
            .populate('sponsor.sponsorRef', 'companyName contactPerson contactEmail address')
            .populate('club.clubRef', 'name district homeGround')
            .populate('deal');

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Generate HTML content
        const htmlContent = generateAgreementHtml(agreement);

        // If format=html is specified, return HTML
        if (format === 'html') {
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="${agreement.agreementNumber}.html"`);
            return res.send(htmlContent);
        }

        // Try to generate PDF using puppeteer
        try {
            const puppeteer = await import('puppeteer');
            const browser = await puppeteer.default.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    bottom: '20mm',
                    left: '15mm',
                    right: '15mm'
                }
            });

            await browser.close();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${agreement.agreementNumber}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            return res.send(pdfBuffer);

        } catch (puppeteerError) {
            console.log('Puppeteer not available, falling back to HTML:', puppeteerError.message);

            // Fallback: Return HTML with print-friendly styling for PDF
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="${agreement.agreementNumber}.html"`);
            return res.send(htmlContent);
        }

    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// Helper function to generate agreement HTML
function generateAgreementHtml(agreement) {
    const sponsor = agreement.sponsor.sponsorRef;
    const club = agreement.club.clubRef;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const formatAmount = (amount) => new Intl.NumberFormat('en-IN').format(amount);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sponsorship Agreement - ${agreement.agreementNumber}</title>
    <style>
        body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
        h1 { text-align: center; color: #1a5f2a; border-bottom: 2px solid #1a5f2a; padding-bottom: 10px; }
        h2 { color: #1a5f2a; margin-top: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .agreement-number { font-size: 14px; color: #666; }
        .parties { display: flex; justify-content: space-between; margin: 20px 0; }
        .party { width: 45%; padding: 15px; background: #f9f9f9; border-radius: 5px; }
        .party h3 { margin: 0 0 10px 0; color: #1a5f2a; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f5f5f5; }
        .signature-block { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature { width: 45%; text-align: center; }
        .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
        .signed { color: #1a5f2a; font-style: italic; }
        .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SPONSORSHIP AGREEMENT</h1>
        <p class="agreement-number">Agreement No: ${agreement.agreementNumber}</p>
        <p>Date: ${formatDate(agreement.createdAt)}</p>
    </div>

    <div class="parties">
        <div class="party">
            <h3>SPONSOR</h3>
            <p><strong>${sponsor.companyName}</strong></p>
            <p>${sponsor.address?.street || ''}</p>
            <p>${sponsor.address?.city || ''}, ${sponsor.address?.district || ''}</p>
            <p>Contact: ${sponsor.contactPerson}</p>
            <p>Email: ${sponsor.contactEmail}</p>
        </div>
        <div class="party">
            <h3>CLUB</h3>
            <p><strong>${club.name}</strong></p>
            <p>District: ${club.district}</p>
            <p>Home Ground: ${club.homeGround || 'N/A'}</p>
        </div>
    </div>

    <h2>1. AGREEMENT TERMS</h2>
    <table>
        <tr>
            <th>Contract Period</th>
            <td>${formatDate(agreement.startDate)} to ${formatDate(agreement.endDate)}</td>
        </tr>
        <tr>
            <th>Total Amount</th>
            <td>₹${formatAmount(agreement.financialTerms.totalAmount)}</td>
        </tr>
        <tr>
            <th>Exclusivity</th>
            <td>${agreement.terms.exclusivity}</td>
        </tr>
        <tr>
            <th>Notice Period</th>
            <td>${agreement.terms.termination.noticePeriodDays} days</td>
        </tr>
    </table>

    <h2>2. PAYMENT SCHEDULE</h2>
    <table>
        <tr>
            <th>Milestone</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Status</th>
        </tr>
        ${agreement.financialTerms.paymentSchedule.map(p => `
        <tr>
            <td>${p.milestone}</td>
            <td>₹${formatAmount(p.amount)}</td>
            <td>${p.dueDate ? formatDate(p.dueDate) : 'TBD'}</td>
            <td>${p.status}</td>
        </tr>
        `).join('')}
    </table>

    <h2>3. DELIVERABLES</h2>
    <table>
        <tr>
            <th>Deliverable</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
        </tr>
        ${agreement.deliverables.map(d => `
        <tr>
            <td>${d.title}</td>
            <td>${d.description || '-'}</td>
            <td>${d.dueDate ? formatDate(d.dueDate) : 'TBD'}</td>
            <td>${d.status}</td>
        </tr>
        `).join('')}
    </table>

    ${agreement.terms.additionalTerms ? `
    <h2>4. ADDITIONAL TERMS</h2>
    <p>${agreement.terms.additionalTerms}</p>
    ` : ''}

    <div class="signature-block">
        <div class="signature">
            <p><strong>FOR THE SPONSOR</strong></p>
            ${agreement.sponsor.signedAt ? `
            <p class="signed">Digitally Signed</p>
            <p><strong>${agreement.sponsor.signatory.name}</strong></p>
            <p>${agreement.sponsor.signatory.designation}</p>
            <p>Date: ${formatDate(agreement.sponsor.signedAt)}</p>
            ` : `
            <div class="signature-line">
                <p>Authorized Signatory</p>
            </div>
            `}
        </div>
        <div class="signature">
            <p><strong>FOR THE CLUB</strong></p>
            ${agreement.club.signedAt ? `
            <p class="signed">Digitally Signed</p>
            <p><strong>${agreement.club.signatory.name}</strong></p>
            <p>${agreement.club.signatory.designation}</p>
            <p>Date: ${formatDate(agreement.club.signedAt)}</p>
            ` : `
            <div class="signature-line">
                <p>Club Manager</p>
            </div>
            `}
        </div>
    </div>

    <div class="footer">
        <p>This is a digitally generated agreement from CrickArena Platform.</p>
        <p>Agreement ID: ${agreement._id} | Generated on ${formatDate(new Date())}</p>
    </div>
</body>
</html>
    `;
}

// =============================================
// TERMINATION
// =============================================

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

// =============================================
// PAYMENT MANAGEMENT
// =============================================

/**
 * GET /api/agreements/:id/payments
 * Get all payment transactions for an agreement
 */
router.get('/:id/payments', async (req, res) => {
    try {
        const { firebaseUid } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Get transactions
        const transactions = await PaymentTransaction.find({ agreement: req.params.id })
            .populate('requestedBy', 'name email')
            .populate('processedBy', 'name email')
            .populate('receipts.uploadedBy', 'name')
            .sort({ createdAt: -1 });

        // Get summary
        const summary = await PaymentTransaction.getSummaryForAgreement(req.params.id);

        res.json({
            transactions,
            summary,
            paymentSchedule: agreement.financialTerms?.paymentSchedule || []
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Failed to get payments' });
    }
});

/**
 * POST /api/agreements/:id/payments/request
 * Club manager requests fund release for a milestone
 */
router.post('/:id/payments/request', async (req, res) => {
    try {
        const { firebaseUid, milestoneIndex, amount, notes } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only club managers can request funds
        const club = await Club.findOne({ manager: user._id });
        if (!club) {
            return res.status(403).json({ error: 'Only club managers can request funds' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id)
            .populate('sponsor.sponsorRef');

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify club owns this agreement
        if (agreement.club.clubRef.toString() !== club._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (agreement.status !== 'active') {
            return res.status(400).json({ error: 'Agreement is not active' });
        }

        // Get milestone details
        let milestoneName = 'General Fund Request';
        let requestAmount = amount;

        if (milestoneIndex >= 0 && agreement.financialTerms?.paymentSchedule?.[milestoneIndex]) {
            const milestone = agreement.financialTerms.paymentSchedule[milestoneIndex];
            milestoneName = milestone.milestone;
            requestAmount = requestAmount || milestone.amount;

            // Issue 1: Check if milestone is already paid
            if (milestone.status === 'paid') {
                return res.status(400).json({
                    error: 'This milestone has already been paid'
                });
            }

            // Check if there's an active request (pending, approved, processing)
            const activeRequest = await PaymentTransaction.findOne({
                agreement: agreement._id,
                milestoneIndex: milestoneIndex,
                status: { $in: ['pending', 'approved', 'processing'] }
            });

            if (activeRequest) {
                return res.status(400).json({
                    error: 'A request for this milestone is already in progress',
                    existingRequest: activeRequest._id
                });
            }

            // Note: Rejected requests are allowed to be re-submitted (Issue 4)
        } else {
            // Issue 2: For general fund requests (no milestone), amount is required
            if (!requestAmount || requestAmount <= 0) {
                return res.status(400).json({
                    error: 'Amount is required for general fund requests'
                });
            }
        }

        // Create transaction
        const transaction = new PaymentTransaction({
            agreement: agreement._id,
            type: 'fund-request',
            amount: requestAmount,
            milestoneIndex: milestoneIndex ?? -1,
            milestoneName,
            status: 'pending',
            requestedBy: user._id,
            requestNotes: notes
        });

        await transaction.save();

        // Update agreement history
        agreement.addHistory('payment-requested', user._id,
            `Fund request of ₹${requestAmount.toLocaleString()} for "${milestoneName}"`
        );
        await agreement.save();

        // Send email to sponsor
        try {
            const sponsor = agreement.sponsor.sponsorRef;
            if (sponsor?.contactEmail && sponsorEmails.notifyPaymentRequest) {
                await sponsorEmails.notifyPaymentRequest(
                    sponsor.contactEmail,
                    sponsor.contactPerson,
                    club.name,
                    requestAmount,
                    milestoneName
                );
            }
        } catch (emailError) {
            console.error('Failed to send payment request email:', emailError);
        }

        res.status(201).json({
            message: 'Fund request submitted successfully',
            transaction
        });
    } catch (error) {
        console.error('Request payment error:', error);
        res.status(500).json({ error: 'Failed to submit fund request' });
    }
});

/**
 * PUT /api/agreements/:id/payments/:txId/process
 * Sponsor approves or rejects a fund request
 */
router.put('/:id/payments/:txId/process', async (req, res) => {
    try {
        const { firebaseUid, action, notes, rejectionReason } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only sponsors can process requests
        const sponsor = await Sponsor.findOne({ user: user._id });
        if (!sponsor) {
            return res.status(403).json({ error: 'Only sponsors can process fund requests' });
        }

        const agreement = await SponsorshipAgreement.findById(id)
            .populate('club.clubRef');

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify sponsor owns this agreement
        if (agreement.sponsor.sponsorRef.toString() !== sponsor._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const transaction = await PaymentTransaction.findById(txId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ error: 'Transaction is not pending' });
        }

        if (action === 'approve') {
            transaction.updateStatus('approved', user._id, notes);
            agreement.addHistory('payment-approved', user._id,
                `Fund request of ₹${transaction.amount.toLocaleString()} approved`
            );
        } else {
            transaction.updateStatus('rejected', user._id, notes);
            transaction.rejectionReason = rejectionReason || 'Request rejected';
            agreement.addHistory('payment-rejected', user._id,
                `Fund request rejected: ${rejectionReason || 'No reason provided'}`
            );
        }

        await transaction.save();
        await agreement.save();

        // Send notification email to club
        try {
            const clubManager = await User.findById(agreement.club.clubRef.manager);
            if (clubManager?.email && sponsorEmails.notifyPaymentProcessed) {
                await sponsorEmails.notifyPaymentProcessed(
                    clubManager.email,
                    clubManager.name,
                    sponsor.companyName,
                    transaction.amount,
                    action,
                    rejectionReason
                );
            }
        } catch (emailError) {
            console.error('Failed to send payment processed email:', emailError);
        }

        res.json({
            message: `Fund request ${action}d successfully`,
            transaction
        });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({ error: 'Failed to process fund request' });
    }
});

/**
 * PUT /api/agreements/:id/payments/:txId/complete
 * Mark payment as completed (sponsor confirms payment made)
 */
router.put('/:id/payments/:txId/complete', async (req, res) => {
    try {
        const { firebaseUid, paymentMethod, transactionReference, notes } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only sponsors can mark as complete
        const sponsor = await Sponsor.findOne({ user: user._id });
        if (!sponsor) {
            return res.status(403).json({ error: 'Only sponsors can mark payments as complete' });
        }

        const agreement = await SponsorshipAgreement.findById(id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify sponsor owns this agreement
        if (agreement.sponsor.sponsorRef.toString() !== sponsor._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const transaction = await PaymentTransaction.findById(txId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (!['approved', 'processing'].includes(transaction.status)) {
            return res.status(400).json({ error: 'Transaction must be approved first' });
        }

        transaction.updateStatus('completed', user._id, notes);
        transaction.paymentMethod = paymentMethod || 'bank-transfer';
        transaction.transactionReference = transactionReference;

        await transaction.save();

        // Update milestone status in agreement if applicable
        if (transaction.milestoneIndex !== undefined && transaction.milestoneIndex !== null && transaction.milestoneIndex >= 0) {
            const index = Number(transaction.milestoneIndex);
            if (agreement.financialTerms?.paymentSchedule?.[index]) {
                agreement.financialTerms.paymentSchedule[index].status = 'paid';
                agreement.financialTerms.paymentSchedule[index].paidAt = new Date();
                agreement.markModified('financialTerms.paymentSchedule');
            }
        }

        agreement.addHistory('payment-completed', user._id,
            `Payment of ₹${transaction.amount.toLocaleString()} completed via ${paymentMethod || 'bank transfer'}`
        );
        await agreement.save();

        res.json({
            message: 'Payment marked as completed',
            transaction
        });
    } catch (error) {
        console.error('Complete payment error:', error);
        res.status(500).json({ error: 'Failed to complete payment' });
    }
});

/**
 * POST /api/agreements/:id/payments/:txId/receipt
 * Upload receipt for a transaction
 */
router.post('/:id/payments/:txId/receipt', async (req, res) => {
    try {
        const { firebaseUid, url, fileName, fileType, description } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!url) {
            return res.status(400).json({ error: 'Receipt URL is required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const agreement = await SponsorshipAgreement.findById(id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify access (both parties can upload receipts)
        const club = await Club.findOne({ manager: user._id });
        const sponsor = await Sponsor.findOne({ user: user._id });

        const isClubManager = club && agreement.club.clubRef.toString() === club._id.toString();
        const isSponsor = sponsor && agreement.sponsor.sponsorRef.toString() === sponsor._id.toString();

        if (!isClubManager && !isSponsor && user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const transaction = await PaymentTransaction.findById(txId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        transaction.addReceipt(user._id, {
            url,
            fileName: fileName || 'receipt',
            fileType: fileType || 'document',
            description
        });

        await transaction.save();

        agreement.addHistory('receipt-uploaded', user._id,
            `Receipt uploaded for payment of ₹${transaction.amount.toLocaleString()}`
        );
        await agreement.save();

        res.json({
            message: 'Receipt uploaded successfully',
            transaction
        });
    } catch (error) {
        console.error('Upload receipt error:', error);
        res.status(500).json({ error: 'Failed to upload receipt' });
    }
});

/**
 * GET /api/agreements/:id/payments/summary
 * Get payment summary for an agreement
 */
router.get('/:id/payments/summary', async (req, res) => {
    try {
        const { firebaseUid } = req.query;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        const summary = await PaymentTransaction.getSummaryForAgreement(req.params.id);

        // Add agreement total for context
        summary.agreementTotal = agreement.financialTerms?.totalAmount || 0;
        summary.remaining = summary.agreementTotal - summary.totalCompleted;

        res.json(summary);
    } catch (error) {
        console.error('Get payment summary error:', error);
        res.status(500).json({ error: 'Failed to get payment summary' });
    }
});

// =============================================
// RAZORPAY PAYMENT INTEGRATION
// =============================================

/**
 * POST /api/agreements/:id/milestones
 * Add a new payment milestone to an existing agreement
 */
router.post('/:id/milestones', async (req, res) => {
    try {
        const { firebaseUid, milestone, amount, dueDate } = req.body;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only club managers can add milestones (to request more funds)
        const club = await Club.findOne({ manager: user._id });
        if (!club) {
            return res.status(403).json({ error: 'Only club managers can add milestones' });
        }

        const agreement = await SponsorshipAgreement.findById(req.params.id);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify club owns this agreement
        if (agreement.club.clubRef.toString() !== club._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Validate inputs
        if (!milestone || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid milestone name and positive amount are required' });
        }

        // Validate due date if provided
        if (dueDate) {
            const date = new Date(dueDate);
            const start = new Date(agreement.startDate);
            const end = new Date(agreement.endDate);

            // Reset times to ignore time component
            date.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            if (date < start || date > end) {
                return res.status(400).json({
                    error: `Due date must be within the contract period (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`
                });
            }
        }

        // Check if adding this milestone exceeds the total agreement amount
        const currentTotal = agreement.financialTerms.paymentSchedule.reduce((sum, p) => sum + (p.amount || 0), 0);
        const agreementTotal = agreement.financialTerms.totalAmount;

        if (currentTotal + Number(amount) > agreementTotal) {
            const remaining = agreementTotal - currentTotal;
            return res.status(400).json({
                error: `Cannot exceed total agreement amount. Remaining budget: ₹${remaining.toLocaleString()}`
            });
        }

        // Add new milestone
        const newMilestone = {
            milestone,
            amount: Number(amount),
            dueDate: dueDate ? new Date(dueDate) : undefined,
            status: 'pending'
        };

        agreement.financialTerms.paymentSchedule.push(newMilestone);

        // Add history
        agreement.addHistory('updated', user._id,
            `Added new payment milestone: "${milestone}" (₹${amount.toLocaleString()})`
        );

        await agreement.save();

        res.status(201).json({
            message: 'Milestone added successfully',
            agreement
        });
    } catch (error) {
        console.error('Add milestone error:', error);
        res.status(500).json({ error: 'Failed to add milestone' });
    }
});

// =============================================
// RAZORPAY PAYMENT INTEGRATION
// =============================================

/**
 * POST /api/agreements/:id/payments/:txId/create-order
 * Create Razorpay order for a payment transaction
 */
router.post('/:id/payments/:txId/create-order', async (req, res) => {
    try {
        const { firebaseUid } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only sponsors can make payments
        const sponsor = await Sponsor.findOne({ user: user._id });
        if (!sponsor) {
            return res.status(403).json({ error: 'Only sponsors can make payments' });
        }

        const agreement = await SponsorshipAgreement.findById(id)
            .populate('club.clubRef');
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // Verify sponsor owns this agreement
        if (agreement.sponsor.sponsorRef.toString() !== sponsor._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const transaction = await PaymentTransaction.findById(txId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status !== 'approved') {
            return res.status(400).json({ error: 'Only approved transactions can be paid' });
        }

        // Generate receipt number for Razorpay
        const receiptId = razorpayUtils.generateReceiptNumber(transaction._id, agreement.agreementNumber);

        // Create Razorpay order
        const order = await razorpayUtils.createOrder(
            transaction.amount,
            'INR',
            receiptId,
            {
                agreementId: id,
                transactionId: txId,
                sponsorId: sponsor._id.toString(),
                milestoneName: transaction.milestoneName
            }
        );

        // Store order info in transaction
        transaction.razorpayOrderId = order.id;
        await transaction.save();

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: receiptId,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create Razorpay order error:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment order' });
    }
});

/**
 * POST /api/agreements/:id/payments/:txId/verify-payment
 * Verify Razorpay payment and complete transaction
 */
router.post('/:id/payments/:txId/verify-payment', async (req, res) => {
    try {
        const { firebaseUid, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification data required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify payment signature
        const isValid = razorpayUtils.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        const agreement = await SponsorshipAgreement.findById(id)
            .populate('sponsor.sponsorRef')
            .populate('club.clubRef');
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        const sponsor = await Sponsor.findById(agreement.sponsor.sponsorRef);
        const transaction = await PaymentTransaction.findById(txId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await razorpayUtils.fetchPayment(razorpay_payment_id);

        // Update transaction
        transaction.updateStatus('completed', user._id, 'Payment verified via Razorpay');
        transaction.paymentMethod = paymentDetails.method || 'razorpay';
        transaction.transactionReference = razorpay_payment_id;
        transaction.razorpayPaymentId = razorpay_payment_id;

        // Generate auto receipt
        const receiptNumber = razorpayUtils.generateReceiptNumber(transaction._id, agreement.agreementNumber);
        const receiptHtml = razorpayUtils.generateReceiptHtml({
            receiptNumber,
            amount: transaction.amount,
            paymentMethod: paymentDetails.method || 'Online Payment',
            transactionReference: razorpay_payment_id,
            paidAt: new Date(),
            sponsorName: sponsor?.companyName || 'Sponsor',
            clubName: agreement.club?.clubRef?.name || 'Club',
            agreementNumber: agreement.agreementNumber,
            milestoneName: transaction.milestoneName,
            paymentId: razorpay_payment_id
        });

        // Add auto-generated receipt to transaction
        transaction.addReceipt(user._id, {
            url: `data:text/html;base64,${Buffer.from(receiptHtml).toString('base64')}`,
            fileName: `receipt-${receiptNumber}.html`,
            fileType: 'html',
            description: `Auto-generated receipt - ${receiptNumber}`
        });
        transaction.invoice = {
            number: receiptNumber,
            generatedAt: new Date()
        };

        await transaction.save();

        // Update milestone status in agreement
        if (transaction.milestoneIndex !== undefined && transaction.milestoneIndex !== null && transaction.milestoneIndex >= 0) {
            const index = Number(transaction.milestoneIndex);
            if (agreement.financialTerms?.paymentSchedule?.[index]) {
                agreement.financialTerms.paymentSchedule[index].status = 'paid';
                agreement.financialTerms.paymentSchedule[index].paidAt = new Date();
                agreement.markModified('financialTerms.paymentSchedule');
            }
        }

        agreement.addHistory('payment-completed', user._id,
            `Payment of ₹${transaction.amount.toLocaleString()} completed via Razorpay (${razorpay_payment_id})`
        );
        await agreement.save();

        res.json({
            success: true,
            message: 'Payment verified and completed successfully',
            transaction,
            receiptNumber
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

/**
 * GET /api/agreements/:id/payments/:txId/receipt
 * Get auto-generated receipt for a transaction
 */
router.get('/:id/payments/:txId/receipt', async (req, res) => {
    try {
        const { firebaseUid } = req.query;
        const { id, txId } = req.params;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const transaction = await PaymentTransaction.findById(txId)
            .populate('requestedBy', 'name');
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status !== 'completed') {
            return res.status(400).json({ error: 'Receipt only available for completed payments' });
        }

        const agreement = await SponsorshipAgreement.findById(id)
            .populate('sponsor.sponsorRef')
            .populate('club.clubRef');

        const sponsor = await Sponsor.findById(agreement.sponsor.sponsorRef);

        const receiptNumber = transaction.invoice?.number ||
            razorpayUtils.generateReceiptNumber(transaction._id, agreement.agreementNumber);

        const receiptHtml = razorpayUtils.generateReceiptHtml({
            receiptNumber,
            amount: transaction.amount,
            paymentMethod: transaction.paymentMethod || 'Online Payment',
            transactionReference: transaction.transactionReference || transaction.razorpayPaymentId,
            paidAt: transaction.completedAt || transaction.updatedAt,
            sponsorName: sponsor?.companyName || 'Sponsor',
            clubName: agreement.club?.clubRef?.name || 'Club',
            agreementNumber: agreement.agreementNumber,
            milestoneName: transaction.milestoneName,
            paymentId: transaction.razorpayPaymentId
        });

        res.setHeader('Content-Type', 'text/html');
        res.send(receiptHtml);
    } catch (error) {
        console.error('Get receipt error:', error);
        res.status(500).json({ error: 'Failed to get receipt' });
    }
});

export default router;
