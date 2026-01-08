import nodemailer from 'nodemailer';

let transporter = null;

// Initialize email transporter
async function initTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️ Email configuration missing. Notifications disabled.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: SMTP_PORT === '465',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    await transporter.verify();
    console.log('✅ Sponsor email transporter configured');
    return transporter;
  } catch (error) {
    console.warn('⚠️ Email transporter failed:', error.message);
    return null;
  }
}

// Generic email sender
async function sendEmail(to, subject, html, text) {
  const transport = await initTransporter();
  if (!transport) return false;

  try {
    await transport.sendMail({
      from: `"CrickArena" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
}

// Email Templates
const templates = {
  sponsorVerified(sponsorName, companyName) {
    return {
      subject: '✅ Your Sponsor Account Has Been Verified - CrickArena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1e40af; margin-top: 0;">Account Verified!</h2>
            <p>Hi ${sponsorName},</p>
            <p>Great news! Your sponsor account for <strong>${companyName}</strong> has been verified and approved.</p>
            <p>You can now:</p>
            <ul style="color: #374151;">
              <li>Browse sponsorship opportunities in the marketplace</li>
              <li>Apply for tournament and club sponsorships</li>
              <li>Track your deals and analytics</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sponsor-panel" 
               style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
              Go to Your Dashboard
            </a>
            <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
              Thank you for partnering with CrickArena!
            </p>
          </div>
        </div>
      `,
      text: `Your sponsor account for ${companyName} has been verified! You can now browse opportunities at ${process.env.FRONTEND_URL || 'http://localhost:5173'}/sponsor-panel`
    };
  },

  sponsorRejected(sponsorName, companyName, reason) {
    return {
      subject: '❌ Sponsor Account Verification Update - CrickArena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #EF4444; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #DC2626; margin-top: 0;">Account Not Approved</h2>
            <p>Hi ${sponsorName},</p>
            <p>We regret to inform you that your sponsor account for <strong>${companyName}</strong> was not approved.</p>
            <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 15px 0;">
              <strong>Reason:</strong><br/>
              ${reason || 'No specific reason provided.'}
            </div>
            <p>If you believe this is an error, please contact our support team.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact" 
               style="display: inline-block; background: #6B7280; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
              Contact Support
            </a>
          </div>
        </div>
      `,
      text: `Your sponsor account for ${companyName} was not approved. Reason: ${reason || 'Not specified'}`
    };
  },

  dealApplied(sponsorName, companyName, opportunityTitle, targetName, proposedAmount) {
    return {
      subject: '📋 New Sponsorship Application - CrickArena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1e40af; margin-top: 0;">New Sponsorship Application!</h2>
            <p>A new sponsor has applied for your opportunity.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr><td style="padding: 8px 0; color: #6B7280;">Sponsor:</td><td style="padding: 8px 0; font-weight: bold;">${companyName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B7280;">Opportunity:</td><td style="padding: 8px 0; font-weight: bold;">${opportunityTitle}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B7280;">For:</td><td style="padding: 8px 0;">${targetName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B7280;">Proposed Amount:</td><td style="padding: 8px 0; font-weight: bold; color: #10B981;">₹${proposedAmount?.toLocaleString()}</td></tr>
            </table>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/sponsors" 
               style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
              Review Application
            </a>
          </div>
        </div>
      `,
      text: `New sponsorship application from ${companyName} for ${opportunityTitle}. Proposed: ₹${proposedAmount?.toLocaleString()}`
    };
  },

  dealApproved(sponsorName, companyName, opportunityTitle, agreedAmount, startDate) {
    return {
      subject: '🎉 Sponsorship Approved! - CrickArena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #059669; margin-top: 0;">Congratulations! 🎉</h2>
            <p>Hi ${sponsorName},</p>
            <p>Your sponsorship application for <strong>${companyName}</strong> has been approved!</p>
            <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0 0 10px;"><strong>Opportunity:</strong> ${opportunityTitle}</p>
              <p style="margin: 0 0 10px;"><strong>Agreed Amount:</strong> ₹${agreedAmount?.toLocaleString()}</p>
              <p style="margin: 0;"><strong>Start Date:</strong> ${startDate ? new Date(startDate).toLocaleDateString() : 'TBD'}</p>
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sponsor-panel/deals" 
               style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
              View Your Deals
            </a>
          </div>
        </div>
      `,
      text: `Your sponsorship for ${opportunityTitle} has been approved! Agreed amount: ₹${agreedAmount?.toLocaleString()}`
    };
  },

  dealRejected(sponsorName, companyName, opportunityTitle, reason) {
    return {
      subject: '📋 Sponsorship Application Update - CrickArena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #6B7280; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #374151; margin-top: 0;">Application Update</h2>
            <p>Hi ${sponsorName},</p>
            <p>Unfortunately, your sponsorship application for <strong>${opportunityTitle}</strong> was not approved.</p>
            <div style="background: #F3F4F6; border-left: 4px solid #6B7280; padding: 15px; margin: 15px 0;">
              <strong>Reason:</strong><br/>
              ${reason || 'The organizer did not provide a specific reason.'}
            </div>
            <p>Don't worry! There are many other opportunities available in our marketplace.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sponsor-panel/marketplace" 
               style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
              Browse Other Opportunities
            </a>
          </div>
        </div>
      `,
      text: `Your sponsorship application for ${opportunityTitle} was not approved. Reason: ${reason || 'Not specified'}`
    };
  },

  // Agreement Templates
  agreementCreated(sponsorName, companyName, clubName, agreementNumber) {
    return {
      subject: '📄 New Sponsorship Agreement Ready for Signature - CrickArena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #059669; margin-top: 0;">Agreement Ready for Signature!</h2>
            <p>Hi ${sponsorName},</p>
            <p>Great news! <strong>${clubName}</strong> has prepared a sponsorship agreement for <strong>${companyName}</strong>.</p>
            <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0;"><strong>Agreement Number:</strong> ${agreementNumber}</p>
            </div>
            <p>Please review and sign the agreement to activate your sponsorship.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sponsor-panel/deals" 
               style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
              Review & Sign Agreement
            </a>
          </div>
        </div>
      `,
      text: `${clubName} has prepared sponsorship agreement ${agreementNumber} for ${companyName}. Please sign at ${process.env.FRONTEND_URL || 'http://localhost:5173'}/sponsor-panel/deals`
    };
  },

  agreementSigned(recipientName, signerCompanyOrClub, agreementNumber) {
    return {
      subject: '✍️ Agreement Signed - Awaiting Your Signature - CrickArena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #D97706; margin-top: 0;">Counter-Signature Required</h2>
            <p>Hi ${recipientName},</p>
            <p><strong>${signerCompanyOrClub}</strong> has signed agreement <strong>${agreementNumber}</strong>.</p>
            <p>The agreement is now awaiting your signature to become active.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/club-manager/sponsorships" 
               style="display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
              Review & Counter-Sign
            </a>
          </div>
        </div>
      `,
      text: `${signerCompanyOrClub} has signed agreement ${agreementNumber}. Please counter-sign at ${process.env.FRONTEND_URL || 'http://localhost:5173'}/club-manager/sponsorships`
    };
  },

  agreementActive(sponsorName, companyName, clubName, agreementNumber) {
    return {
      subject: '🎉 Agreement Active - Sponsorship Confirmed! - CrickArena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #059669; margin-top: 0;">Congratulations! 🎉</h2>
            <p>Hi ${sponsorName},</p>
            <p>The sponsorship agreement between <strong>${companyName}</strong> and <strong>${clubName}</strong> is now fully executed and active!</p>
            <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0;"><strong>Agreement Number:</strong> ${agreementNumber}</p>
              <p style="margin: 10px 0 0;"><strong>Status:</strong> Active ✅</p>
            </div>
            <p>You can track deliverables and view agreement details in your dashboard.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sponsor-panel/deals" 
               style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
              View Agreement
            </a>
          </div>
        </div>
      `,
      text: `Sponsorship agreement ${agreementNumber} between ${companyName} and ${clubName} is now active!`
    };
  }
};

// Notification functions
export async function notifySponsorVerified(email, sponsorName, companyName) {
  const { subject, html, text } = templates.sponsorVerified(sponsorName, companyName);
  return sendEmail(email, subject, html, text);
}

export async function notifySponsorRejected(email, sponsorName, companyName, reason) {
  const { subject, html, text } = templates.sponsorRejected(sponsorName, companyName, reason);
  return sendEmail(email, subject, html, text);
}

export async function notifyDealApplied(adminEmail, sponsorName, companyName, opportunityTitle, targetName, proposedAmount) {
  const { subject, html, text } = templates.dealApplied(sponsorName, companyName, opportunityTitle, targetName, proposedAmount);
  return sendEmail(adminEmail, subject, html, text);
}

export async function notifyDealApproved(email, sponsorName, companyName, opportunityTitle, agreedAmount, startDate) {
  const { subject, html, text } = templates.dealApproved(sponsorName, companyName, opportunityTitle, agreedAmount, startDate);
  return sendEmail(email, subject, html, text);
}

export async function notifyDealRejected(email, sponsorName, companyName, opportunityTitle, reason) {
  const { subject, html, text } = templates.dealRejected(sponsorName, companyName, opportunityTitle, reason);
  return sendEmail(email, subject, html, text);
}

// Agreement notification functions
export async function notifyAgreementCreated(email, sponsorName, companyName, clubName, agreementNumber) {
  const { subject, html, text } = templates.agreementCreated(sponsorName, companyName, clubName, agreementNumber);
  return sendEmail(email, subject, html, text);
}

export async function notifyAgreementSigned(email, recipientName, signerCompanyOrClub, agreementNumber) {
  const { subject, html, text } = templates.agreementSigned(recipientName, signerCompanyOrClub, agreementNumber);
  return sendEmail(email, subject, html, text);
}

export async function notifyAgreementActive(email, sponsorName, companyName, clubName, agreementNumber) {
  const { subject, html, text } = templates.agreementActive(sponsorName, companyName, clubName, agreementNumber);
  return sendEmail(email, subject, html, text);
}

// Payment notification functions
export async function notifyPaymentRequest(email, sponsorName, clubName, amount, milestone) {
  const subject = `💰 Fund Request from ${clubName} - CrickArena`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #059669; margin-top: 0;">Fund Request Received</h2>
        <p>Hi ${sponsorName},</p>
        <p><strong>${clubName}</strong> has requested a fund release:</p>
        <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981; margin: 20px 0;">
          <p style="margin: 0;"><strong>Milestone:</strong> ${milestone}</p>
          <p style="margin: 10px 0 0 0; font-size: 24px; color: #10B981;"><strong>₹${amount.toLocaleString()}</strong></p>
        </div>
        <p>Please review this request in your sponsor dashboard.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sponsor-panel/deals" 
           style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
          Review Request
        </a>
        <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
          The CrickArena Team
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html, null);
}

export async function notifyPaymentProcessed(email, recipientName, sponsorName, amount, action, reason) {
  const isApproved = action === 'approve';
  const subject = isApproved
    ? `✅ Fund Request Approved - ₹${amount.toLocaleString()} - CrickArena`
    : `❌ Fund Request Rejected - CrickArena`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${isApproved ? '#10B981, #059669' : '#EF4444, #DC2626'}); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🏏 CrickArena</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <h2 style="color: ${isApproved ? '#059669' : '#DC2626'}; margin-top: 0;">
          Fund Request ${isApproved ? 'Approved' : 'Rejected'}
        </h2>
        <p>Hi ${recipientName},</p>
        <p>Your fund request of <strong>₹${amount.toLocaleString()}</strong> has been ${isApproved ? 'approved' : 'rejected'} by <strong>${sponsorName}</strong>.</p>
        ${!isApproved && reason ? `
          <div style="background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #991B1B;"><strong>Reason:</strong> ${reason}</p>
          </div>
        ` : ''}
        ${isApproved ? `
          <p>The sponsor will process the payment shortly. You will receive a notification once the payment is completed.</p>
        ` : ''}
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/club-manager/sponsorships" 
           style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
          View in Dashboard
        </a>
        <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
          The CrickArena Team
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html, null);
}

export default {
  notifySponsorVerified,
  notifySponsorRejected,
  notifyDealApplied,
  notifyDealApproved,
  notifyDealRejected,
  notifyAgreementCreated,
  notifyAgreementSigned,
  notifyAgreementActive,
  notifyPaymentRequest,
  notifyPaymentProcessed
};

