import nodemailer from 'nodemailer';

/**
 * Ticket Email Notifications
 * Sends email confirmations for ticket bookings
 * Pattern mirrors sponsorEmails.js for consistency
 */

let transporter = null;

// Initialize email transporter
async function initTransporter() {
    if (transporter) return transporter;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.warn('⚠️ Email configuration missing. Ticket notifications disabled.');
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
        console.log('✅ Ticket email transporter configured');
        return transporter;
    } catch (error) {
        console.warn('⚠️ Ticket email transporter failed:', error.message);
        return null;
    }
}

// Generic email sender
async function sendEmail(to, subject, html, text) {
    const transport = await initTransporter();
    if (!transport) return false;

    try {
        await transport.sendMail({
            from: `"CrickArena Tickets" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text
        });
        return true;
    } catch (error) {
        console.error('Ticket email send failed:', error.message);
        return false;
    }
}

// Email Templates
const templates = {
    ticketConfirmed(booking) {
        const { user, bookingCode, section, quantity, totalAmount, matchDetails, qrCodeData, tickets } = booking;

        const matchDate = matchDetails?.date
            ? new Date(matchDetails.date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'To be announced';

        const homeTeam = matchDetails?.homeClub || 'TBA';
        const awayTeam = matchDetails?.awayClub || 'TBA';
        const matchTime = matchDetails?.time || 'TBA';
        const venue = matchDetails?.venue || 'TBA';
        const round = matchDetails?.round || matchDetails?.stage || 'Knockout Match';

        return {
            subject: `🎟️ Ticket Confirmed - ${homeTeam} vs ${awayTeam} | ${bookingCode}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏏 CrickArena</h1>
              <p style="color: #BFDBFE; margin: 10px 0 0; font-size: 16px;">Your Tickets Are Confirmed!</p>
            </div>
            
            <!-- Content -->
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Success Message -->
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="display: inline-block; background: #ECFDF5; border-radius: 50%; padding: 15px; margin-bottom: 10px;">
                  <span style="font-size: 40px;">✅</span>
                </div>
                <h2 style="color: #059669; margin: 10px 0 5px;">Booking Confirmed!</h2>
                <p style="color: #6B7280; margin: 0;">Thank you for your purchase, <strong>${user.name}</strong></p>
              </div>
              
              <!-- Booking Code Banner -->
              <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                <p style="color: #D1FAE5; margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Code</p>
                <p style="color: white; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 3px;">${bookingCode}</p>
              </div>
              
              <!-- Match Details Card -->
              <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 20px; color: #1E40AF; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                  📅 Match Details
                </h3>
                
                <!-- Teams -->
                <div style="text-align: center; margin-bottom: 20px;">
                  <span style="font-size: 20px; font-weight: bold; color: #1F2937;">${homeTeam}</span>
                  <span style="color: #9CA3AF; padding: 0 15px; font-size: 16px;">vs</span>
                  <span style="font-size: 20px; font-weight: bold; color: #1F2937;">${awayTeam}</span>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E5E7EB;">🏆 Round</td>
                    <td style="padding: 10px 0; color: #1F2937; font-weight: 500; text-align: right; border-bottom: 1px solid #E5E7EB;">${round}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E5E7EB;">📆 Date</td>
                    <td style="padding: 10px 0; color: #1F2937; font-weight: 500; text-align: right; border-bottom: 1px solid #E5E7EB;">${matchDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E5E7EB;">⏰ Time</td>
                    <td style="padding: 10px 0; color: #1F2937; font-weight: 500; text-align: right; border-bottom: 1px solid #E5E7EB;">${matchTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6B7280;">📍 Venue</td>
                    <td style="padding: 10px 0; color: #1F2937; font-weight: 500; text-align: right;">${venue}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Ticket Details -->
              <div style="background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px; color: #92400E; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                  🎫 Your Tickets
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #92400E;">Section</td>
                    <td style="padding: 8px 0; color: #1F2937; font-weight: bold; text-align: right;">${section}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #92400E;">Quantity</td>
                    <td style="padding: 8px 0; color: #1F2937; font-weight: bold; text-align: right;">${quantity} ticket${quantity > 1 ? 's' : ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #92400E;">Total Paid</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 20px; text-align: right;">₹${totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </table>
                
                ${tickets && tickets.length > 0 ? `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #F59E0B;">
                    <p style="color: #92400E; margin: 0 0 8px; font-size: 13px;">Ticket Numbers:</p>
                    <p style="margin: 0;">
                      ${tickets.map(t => `<code style="background: white; padding: 4px 8px; margin: 2px; display: inline-block; border-radius: 4px; font-family: monospace; font-size: 12px; border: 1px solid #E5E7EB;">${t.ticketNumber}</code>`).join(' ')}
                    </p>
                  </div>
                ` : ''}
              </div>
              
              <!-- QR Code Section -->
              <div style="text-align: center; padding: 30px; background: #F8FAFC; border-radius: 12px; margin-bottom: 25px;">
                <h3 style="color: #1E40AF; margin: 0 0 10px;">🔐 Your Entry QR Code</h3>
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 20px;">Show this QR code at the venue entrance</p>
                
                ${qrCodeData
                    ? `<img src="${qrCodeData}" alt="Ticket QR Code" style="width: 220px; height: 220px; border: 4px solid #3B82F6; border-radius: 12px; padding: 10px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">`
                    : '<p style="color: #DC2626; background: #FEE2E2; padding: 15px; border-radius: 8px;">QR Code generation pending</p>'
                }
                
                <p style="color: #9CA3AF; font-size: 12px; margin: 15px 0 0;">Screenshot this email for quick access</p>
              </div>
              
              <!-- Important Instructions -->
              <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
                <h4 style="color: #DC2626; margin: 0 0 12px; font-size: 14px;">⚠️ Important Instructions</h4>
                <ul style="margin: 0; padding-left: 20px; color: #7F1D1D; font-size: 14px; line-height: 1.8;">
                  <li>Carry a valid photo ID matching your booking name</li>
                  <li>Arrive at least <strong>30 minutes</strong> before match time</li>
                  <li>This QR code is unique - <strong>do not share</strong></li>
                  <li>Screenshots of this email are acceptable for entry</li>
                  <li>Outside food and drinks may not be allowed</li>
                </ul>
              </div>
              
              <!-- View Tickets Button -->
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-tickets" 
                   style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                  View My Tickets
                </a>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; padding-top: 25px; border-top: 1px solid #E5E7EB;">
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 5px;">
                  Need help? Contact us at <a href="mailto:support@crickarena.com" style="color: #3B82F6;">support@crickarena.com</a>
                </p>
                <p style="color: #9CA3AF; font-size: 13px; margin: 10px 0 0;">
                  See you at the match! 🏏🎉
                </p>
                <p style="color: #D1D5DB; font-size: 12px; margin: 15px 0 0;">
                  © ${new Date().getFullYear()} CrickArena. All rights reserved.
                </p>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
🎟️ CRICKARENA - TICKET CONFIRMED!

Hi ${user.name},

Your ticket booking is confirmed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BOOKING CODE: ${bookingCode}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MATCH DETAILS
─────────────
Match: ${homeTeam} vs ${awayTeam}
Round: ${round}
Date: ${matchDate}
Time: ${matchTime}
Venue: ${venue}

YOUR TICKETS
────────────
Section: ${section}
Quantity: ${quantity} ticket${quantity > 1 ? 's' : ''}
Total Paid: ₹${totalAmount.toLocaleString('en-IN')}

${tickets && tickets.length > 0 ? `Ticket Numbers: ${tickets.map(t => t.ticketNumber).join(', ')}` : ''}

IMPORTANT INSTRUCTIONS
──────────────────────
• Carry a valid photo ID matching your booking name
• Arrive at least 30 minutes before match time
• Show this email or screenshot at the venue entrance
• Do not share your QR code with others

View your tickets: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-tickets

Need help? Contact support@crickarena.com

See you at the match! 🏏

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CrickArena - Your Cricket, Your Arena
      `
        };
    },

    ticketCancelled(booking, refundAmount) {
        const { user, bookingCode, matchDetails } = booking;
        const homeTeam = matchDetails?.homeClub || 'TBA';
        const awayTeam = matchDetails?.awayClub || 'TBA';

        return {
            subject: `❌ Ticket Cancelled - ${bookingCode} | CrickArena`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="background: #6B7280; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏏 CrickArena</h1>
            </div>
            
            <!-- Content -->
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #374151; margin-top: 0;">Ticket Cancelled</h2>
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>Your ticket booking <strong>${bookingCode}</strong> for <strong>${homeTeam} vs ${awayTeam}</strong> has been cancelled.</p>
              
              ${refundAmount ? `
                <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #059669;">
                    <strong>Refund Amount:</strong> ₹${refundAmount.toLocaleString('en-IN')}<br>
                    <small style="color: #6B7280;">Will be processed within 5-7 business days</small>
                  </p>
                </div>
              ` : ''}
              
              <p style="color: #6B7280;">If you have any questions about this cancellation, please contact our support team.</p>
              
              <div style="text-align: center; margin-top: 25px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tickets" 
                   style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                  Browse Other Matches
                </a>
              </div>
              
              <p style="margin-top: 30px; color: #6B7280; font-size: 14px; text-align: center;">
                The CrickArena Team
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
CrickArena - Ticket Cancelled

Hi ${user.name},

Your ticket booking ${bookingCode} for ${homeTeam} vs ${awayTeam} has been cancelled.

${refundAmount ? `Refund Amount: ₹${refundAmount.toLocaleString('en-IN')} (will be processed within 5-7 business days)` : ''}

If you have any questions, please contact support@crickarena.com

The CrickArena Team
      `
        };
    },

    matchReminder(booking) {
        const { user, bookingCode, section, quantity, matchDetails, qrCodeData } = booking;
        const homeTeam = matchDetails?.homeClub || 'TBA';
        const awayTeam = matchDetails?.awayClub || 'TBA';
        const matchTime = matchDetails?.time || 'TBA';
        const venue = matchDetails?.venue || 'TBA';

        return {
            subject: `⏰ Match Tomorrow! ${homeTeam} vs ${awayTeam} | CrickArena`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏏 CrickArena</h1>
              <p style="color: #FEF3C7; margin: 10px 0 0;">Match Day Reminder!</p>
            </div>
            
            <!-- Content -->
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #D97706; margin-top: 0; text-align: center;">⏰ Your Match is Tomorrow!</h2>
              
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>This is a friendly reminder that your match is <strong>tomorrow</strong>!</p>
              
              <!-- Match Info -->
              <div style="background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="font-size: 22px; font-weight: bold; color: #1F2937; margin: 0 0 10px;">
                  ${homeTeam} vs ${awayTeam}
                </p>
                <p style="color: #92400E; margin: 0;">
                  ⏰ ${matchTime} | 📍 ${venue}
                </p>
              </div>
              
              <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0;"><strong>Booking Code:</strong> ${bookingCode}</p>
                <p style="margin: 5px 0 0;"><strong>Section:</strong> ${section} | <strong>Tickets:</strong> ${quantity}</p>
              </div>
              
              <!-- QR Code -->
              ${qrCodeData ? `
                <div style="text-align: center; margin: 20px 0;">
                  <p style="color: #6B7280; margin-bottom: 10px;">Your Entry QR Code:</p>
                  <img src="${qrCodeData}" alt="QR Code" style="width: 180px; height: 180px; border: 3px solid #F59E0B; border-radius: 8px; padding: 8px; background: white;">
                </div>
              ` : ''}
              
              <!-- Checklist -->
              <div style="background: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <strong style="color: #059669;">Quick Checklist:</strong>
                <ul style="margin: 10px 0 0; padding-left: 20px; color: #374151;">
                  <li>✅ Photo ID ready</li>
                  <li>✅ This email/QR code saved</li>
                  <li>✅ Plan to arrive 30 mins early</li>
                </ul>
              </div>
              
              <p style="text-align: center; color: #6B7280; margin-top: 25px;">
                Enjoy the match! 🎉
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Match Reminder - CrickArena

Hi ${user.name},

Your match is TOMORROW!

${homeTeam} vs ${awayTeam}
Time: ${matchTime}
Venue: ${venue}

Booking Code: ${bookingCode}
Section: ${section} | Tickets: ${quantity}

Quick Checklist:
✅ Photo ID ready
✅ This email/QR code saved  
✅ Plan to arrive 30 mins early

Enjoy the match!
CrickArena Team
      `
        };
    }
};

// Notification Functions
export async function notifyTicketConfirmed(booking) {
    const { subject, html, text } = templates.ticketConfirmed(booking);
    const success = await sendEmail(booking.user.email, subject, html, text);
    if (success) {
        console.log(`✉️ Ticket confirmation email sent to ${booking.user.email}`);
    }
    return success;
}

export async function notifyTicketCancelled(booking, refundAmount = null) {
    const { subject, html, text } = templates.ticketCancelled(booking, refundAmount);
    const success = await sendEmail(booking.user.email, subject, html, text);
    if (success) {
        console.log(`✉️ Ticket cancellation email sent to ${booking.user.email}`);
    }
    return success;
}

export async function notifyMatchReminder(booking) {
    const { subject, html, text } = templates.matchReminder(booking);
    const success = await sendEmail(booking.user.email, subject, html, text);
    if (success) {
        console.log(`✉️ Match reminder email sent to ${booking.user.email}`);
    }
    return success;
}

export default {
    notifyTicketConfirmed,
    notifyTicketCancelled,
    notifyMatchReminder
};
