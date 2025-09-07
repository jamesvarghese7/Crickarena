import express from 'express';
import Joi from 'joi';
import Club from '../models/Club.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Enhanced club registration schema with better validation
const clubRegistrationSchema = Joi.object({
  clubName: Joi.string().trim().min(3).max(100).required()
    .messages({
      'string.min': 'Club name must be at least 3 characters',
      'string.max': 'Club name must be less than 100 characters',
      'any.required': 'Club name is required'
    }),
  district: Joi.string().trim().min(1).max(50).required()
    .messages({
      'any.required': 'District is required'
    }),
  city: Joi.string().trim().min(1).max(50).required()
    .messages({
      'any.required': 'City is required'
    }),
  foundedYear: Joi.number().integer().min(1850).max(new Date().getFullYear()).optional()
    .messages({
      'number.min': 'Founded year must be after 1850',
      'number.max': `Founded year cannot be in the future`
    }),
  managerName: Joi.string().trim().min(2).max(100).pattern(/^[a-zA-Z\s.'-]+$/).required()
    .messages({
      'string.pattern.base': 'Manager name contains invalid characters',
      'any.required': 'Manager name is required'
    }),
  phone: Joi.string().trim().pattern(/^(\+91[\s-]?)?[6-9]\d{9}$/).required()
    .messages({
      'string.pattern.base': 'Please enter a valid Indian phone number',
      'any.required': 'Phone number is required'
    }),
  email: Joi.string().trim().email().required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  description: Joi.string().trim().max(1000).optional()
    .messages({
      'string.max': 'Description must be less than 1000 characters'
    }),
  groundName: Joi.string().trim().max(100).optional()
    .messages({
      'string.max': 'Ground name must be less than 100 characters'
    }),
  memberCount: Joi.number().integer().min(1).max(10000).optional()
    .messages({
      'number.min': 'Member count must be at least 1',
      'number.max': 'Member count seems too high'
    }),
  website: Joi.string().trim().uri().optional()
    .messages({
      'string.uri': 'Please enter a valid URL'
    }),
  achievements: Joi.string().trim().max(1000).optional()
    .messages({
      'string.max': 'Achievements must be less than 1000 characters'
    }),
  // Accept http/https and data URLs for now (replace with real upload URL later)
  logoUrl: Joi.string().uri({ scheme: [/https?/, 'data'] }).optional(),
  agreeTerms: Joi.boolean().valid(true).required()
    .messages({
      'any.only': 'You must agree to the terms and conditions'
    }),
  status: Joi.string().valid('pending').default('pending')
});

// Club registration (restricted to club managers)
router.post('/register', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  try {
    logger.info('Club registration attempt', { 
      userId: req.user._id, 
      email: req.user.email,
      clubName: req.body.clubName 
    });

    const { value, error } = clubRegistrationSchema.validate(req.body);
    if (error) {
      logger.warn('Club registration validation failed', { 
        userId: req.user._id, 
        error: error.details[0].message 
      });
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if user already has a club registration
    const existingClub = await Club.findOne({ 
      $or: [
        { manager: req.user._id },
        { email: value.email }
      ]
    });

    if (existingClub) {
      return res.status(400).json({ 
        message: 'You already have a club registration. Please contact admin if you need to update it.' 
      });
    }

    // Create new club registration
    // If logoUrl is a data URL, convert and store binary in MongoDB
    let logo;
    if (value.logoUrl && typeof value.logoUrl === 'string' && value.logoUrl.startsWith('data:')) {
      const match = value.logoUrl.match(/^data:(.*?);base64,(.*)$/);
      if (match) {
        const [, mime, b64] = match;
        try { logo = { data: Buffer.from(b64, 'base64'), contentType: mime }; } catch {}
      }
    }

    const club = await Club.create({
      ...value,
      logo,
      manager: req.user._id,
      submittedAt: new Date(),
      status: 'pending'
    });

    res.status(201).json({ 
      message: 'Club registration submitted successfully. You will receive an email once reviewed.',
      club: {
        id: club._id,
        clubName: club.clubName,
        status: club.status,
        submittedAt: club.submittedAt
      }
    });
  } catch (error) {
    console.error('Club registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's club (for club manager dashboard)
router.get('/my-club', verifyFirebaseToken, async (req, res) => {
  try {
    const club = await Club.findOne({ manager: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'No club found' });
    }
    res.json({ club });
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user's club details (manager can request changes)
const clubUpdateSchema = Joi.object({
  clubName: Joi.string().min(3).optional(),
  district: Joi.string().optional(),
  city: Joi.string().optional(),
  foundedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  managerName: Joi.string().optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
  description: Joi.string().allow('').optional(),
  groundName: Joi.string().allow('').optional(),
  memberCount: Joi.number().integer().min(1).optional(),
  website: Joi.string().uri().allow('').optional(),
  achievements: Joi.string().allow('').optional(),
  // Accept http/https and data URLs for now (replace with real upload URL later)
  logoUrl: Joi.string().uri({ scheme: [/https?/, 'data'] }).allow('').optional()
});

router.put('/my-club', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  try {
    const { value, error } = clubUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details?.[0]?.message || 'Invalid input' });

    const club = await Club.findOne({ manager: req.user._id });
    if (!club) return res.status(404).json({ message: 'No club found' });

    // Apply updates
    Object.assign(club, value);

    // If logoUrl is a data URL, store binary and set stable path
    if (typeof value.logoUrl === 'string' && value.logoUrl.startsWith('data:')) {
      const match = value.logoUrl.match(/^data:(.*?);base64,(.*)$/);
      if (match) {
        const [, mime, b64] = match;
        try {
          club.logo = { data: Buffer.from(b64, 'base64'), contentType: mime };
          club.logoUrl = `/api/clubs/${club._id}/logo`;
        } catch {}
      }
    }

    // If club is approved, mark back to pending for re-approval when details change
    if (club.status === 'approved') {
      club.status = 'pending';
      club.processedAt = null;
      club.processedBy = null;
      club.rejectionReason = undefined;
    }

    await club.save();
    res.json({ message: 'Club updated and sent for re-approval', club });
  } catch (err) {
    console.error('Error updating club:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Legacy club manager creates/updates club (keeping for backward compatibility)
const legacyClubSchema = Joi.object({ 
  name: Joi.string().min(3).required(), 
  logoUrl: Joi.string().uri().allow(''), 
  district: Joi.string().allow('') 
});

router.post('/', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  const { value, error } = legacyClubSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  let club = await Club.findOne({ manager: req.user._id });
  if (!club) {
    club = await Club.create({ ...value, manager: req.user._id });
  } else {
    club.name = value.name; club.logoUrl = value.logoUrl; club.district = value.district; club.status = 'pending';
    await club.save();
  }
  res.json({ message: 'Club submitted for approval', club });
});

// Admin approval
router.put('/:id/approve', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'approved',
        processedAt: new Date(),
        processedBy: req.user._id
      }, 
      { new: true }
    );
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    res.json({ message: 'Club approved successfully', club });
  } catch (error) {
    console.error('Error approving club:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin rejection
router.put('/:id/reject', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const club = await Club.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'rejected',
        rejectionReason: reason,
        processedAt: new Date(),
        processedBy: req.user._id
      }, 
      { new: true }
    );
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    res.json({ message: 'Club rejected successfully', club });
  } catch (error) {
    console.error('Error rejecting club:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve club logo binary
router.get('/:id/logo', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).select('logo');
    if (!club || !club.logo || !club.logo.data) return res.status(404).end();
    res.set('Content-Type', club.logo.contentType || 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(club.logo.data);
  } catch (err) {
    return res.status(404).end();
  }
});

// Public fetches approved clubs
router.get('/public', async (req, res) => {
  try {
    const clubs = await Club.find({ status: 'approved' })
      .select('clubName name logoUrl district city description memberCount groundName')
      .sort({ clubName: 1 });

    // Normalize shape for frontend and ensure logoUrl fallback
    const mapped = clubs.map(c => ({
      id: c._id,
      name: c.clubName || c.name,
      district: c.district,
      city: c.city,
      description: c.description,
      memberCount: c.memberCount,
      groundName: c.groundName,
      logoUrl: c.logoUrl || (c.logo?.data ? `/api/clubs/${c._id}/logo` : ''),
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching public clubs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public fetch of a single club by id
router.get('/public/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club || club.status !== 'approved') {
      return res.status(404).json({ message: 'Club not found' });
    }
    const payload = {
      id: club._id,
      name: club.clubName || club.name,
      district: club.district,
      city: club.city,
      description: club.description,
      memberCount: club.memberCount,
      groundName: club.groundName,
      website: club.website,
      achievements: club.achievements,
      foundedYear: club.foundedYear,
      email: club.email,
      phone: club.phone,
      logoUrl: club.logoUrl || (club.logo?.data ? `/api/clubs/${club._id}/logo` : ''),
    };
    res.json(payload);
  } catch (error) {
    console.error('Error fetching public club details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;