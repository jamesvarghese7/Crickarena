/**
 * Agreement PDF Generation Utility
 * Handles HTML template generation and PDF creation for sponsorship agreements
 */

/**
 * Generate HTML content for an agreement
 * @param {Object} agreement - Populated agreement document
 * @returns {string} HTML content
 */
export function generateAgreementHtml(agreement) {
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
        @media print {
            body { padding: 20px; }
            .signature-block { page-break-inside: avoid; }
        }
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

/**
 * Generate PDF buffer from agreement using Puppeteer
 * Falls back to HTML if Puppeteer is not available
 * @param {Object} agreement - Populated agreement document
 * @returns {Object} { buffer, contentType, fileName }
 */
export async function generateAgreementPdf(agreement) {
    const htmlContent = generateAgreementHtml(agreement);

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

        return {
            buffer: pdfBuffer,
            contentType: 'application/pdf',
            fileName: `${agreement.agreementNumber}.pdf`
        };

    } catch (puppeteerError) {
        console.log('Puppeteer not available, falling back to HTML:', puppeteerError.message);

        return {
            buffer: Buffer.from(htmlContent),
            contentType: 'text/html',
            fileName: `${agreement.agreementNumber}.html`
        };
    }
}
