import express from 'express';
import Joi from 'joi';
import { verifyFirebaseToken } from '../middleware/auth.js';

const router = express.Router();

const updateSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  phone: Joi.string().allow('', null),
  district: Joi.string().allow('', null)
});

// Get current user's profile (mirrors /api/auth/profile but under /api/users/me)
router.get('/me', verifyFirebaseToken, async (req, res) => {
  const user = req.user;
  res.json({ user });
});

// Update current user's profile
router.put('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const { value, error } = updateSchema.validate(req.body || {}, { abortEarly: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = req.user;
    if (value.name !== undefined) user.name = value.name;
    if (value.phone !== undefined) user.phone = value.phone || '';
    if (value.district !== undefined) user.district = value.district || '';

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (e) {
    console.error('Update profile error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;