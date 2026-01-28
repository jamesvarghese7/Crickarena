/**
 * Agreement PDF Routes
 * Handles PDF generation and download
 */
import express from 'express';
import SponsorshipAgreement from '../../models/SponsorshipAgreement.js';
import User from '../../models/User.js';
import { generateAgreementHtml, generateAgreementPdf } from '../../utils/agreementPdf.js';

const router = express.Router();

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

        // If format=html is specified, return HTML directly
        if (format === 'html') {
            const htmlContent = generateAgreementHtml(agreement);
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="${agreement.agreementNumber}.html"`);
            return res.send(htmlContent);
        }

        // Generate PDF (with HTML fallback)
        const result = await generateAgreementPdf(agreement);

        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
        res.setHeader('Content-Length', result.buffer.length);
        return res.send(result.buffer);

    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

export default router;
