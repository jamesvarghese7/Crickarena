import express from 'express';
import ContactSubmission from '../models/ContactSubmission.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Rate limiting map (simple in-memory rate limiting)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3; // 3 submissions per 15 minutes per IP

// Helper function to check rate limit
function isRateLimited(ip) {
    const now = Date.now();
    const userRequests = rateLimitMap.get(ip) || [];

    // Clean old requests
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= MAX_REQUESTS) {
        return true;
    }

    // Add current request
    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);

    return false;
}

// Clean up rate limit map every hour
setInterval(() => {
    const now = Date.now();
    for (const [ip, requests] of rateLimitMap.entries()) {
        const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
        if (recentRequests.length === 0) {
            rateLimitMap.delete(ip);
        } else {
            rateLimitMap.set(ip, recentRequests);
        }
    }
}, 60 * 60 * 1000);

// Configure email transporter (optional - only if SMTP is configured)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('✅ Email transporter configured successfully');
    } catch (error) {
        console.warn('⚠️ Email transporter configuration failed:', error.message);
    }
}

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Get IP address
        const ip = req.ip || req.connection.remoteAddress || 'unknown';

        // Check rate limit
        if (isRateLimited(ip)) {
            return res.status(429).json({
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000 / 60) // minutes
            });
        }

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: 'All fields are required',
                fields: { name, email, subject, message }
            });
        }

        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Please provide a valid email address'
            });
        }

        // Message length validation
        if (message.length < 10) {
            return res.status(400).json({
                message: 'Message must be at least 10 characters long'
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                message: 'Message cannot exceed 2000 characters'
            });
        }

        // Create contact submission
        const submission = await ContactSubmission.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            ipAddress: ip,
            userAgent: req.get('user-agent') || ''
        });

        // Send email notification if transporter is configured
        if (transporter) {
            try {
                const adminEmail = process.env.ADMIN_EMAIL || 'crickarena201@gmail.com';

                await transporter.sendMail({
                    from: `"CrickArena Contact Form" <${process.env.SMTP_USER}>`,
                    to: adminEmail,
                    subject: `[CrickArena Contact] ${subject}`,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              </div>
              
              <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #374151;">Message:</h3>
                <p style="white-space: pre-wrap; color: #4b5563; line-height: 1.6;">${message}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; font-size: 12px; color: #6b7280;">
                <p style="margin: 3px 0;"><strong>Submission ID:</strong> ${submission._id}</p>
                <p style="margin: 3px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 3px 0;"><strong>IP Address:</strong> ${ip}</p>
              </div>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
                <p>This is an automated notification from CrickArena contact form.</p>
              </div>
            </div>
          `,
                    text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Submission ID: ${submission._id}
Submitted: ${new Date().toLocaleString()}
IP Address: ${ip}
          `
                });

                console.log('✅ Contact form email sent successfully');
            } catch (emailError) {
                console.error('❌ Failed to send email notification:', emailError.message);
                // Don't fail the request if email fails
            }
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you within 1-2 business days.',
            submissionId: submission._id
        });

    } catch (error) {
        console.error('Error processing contact form:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            message: 'Failed to submit contact form. Please try again later.'
        });
    }
});

// GET /api/contact - Get all contact submissions (for admin use - should add auth)
router.get('/', async (req, res) => {
    try {
        const { status, limit = 50, skip = 0 } = req.query;

        const filter = {};
        if (status) {
            filter.status = status;
        }

        const submissions = await ContactSubmission.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await ContactSubmission.countDocuments(filter);

        res.json({
            submissions,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        });
    } catch (error) {
        console.error('Error fetching contact submissions:', error);
        res.status(500).json({
            message: 'Failed to fetch contact submissions'
        });
    }
});

// PUT /api/contact/:id/status - Update submission status (for admin use - should add auth)
router.put('/:id/status', async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        if (!['new', 'read', 'responded', 'archived'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status value'
            });
        }

        const submission = await ContactSubmission.findByIdAndUpdate(
            req.params.id,
            { status, adminNotes: adminNotes || '' },
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({
                message: 'Submission not found'
            });
        }

        res.json(submission);
    } catch (error) {
        console.error('Error updating submission status:', error);
        res.status(500).json({
            message: 'Failed to update submission status'
        });
    }
});

export default router;
