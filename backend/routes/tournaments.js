import express from 'express';
import Joi from 'joi';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import Club from '../models/Club.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Public/club-facing listings
router.get('/open', async (req, res) => {
  try {
    const list = await Tournament.find({ status: 'open' }).sort({ startDate: 1 });
    res.json(list);
  } catch (error) {
    console.error('Error fetching open tournaments:', error);
    res.status(500).json({ message: 'Failed to fetch open tournaments' });
  }
});

router.get('/mine', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  try {
    const myClub = await Club.findOne({ manager: req.user._id });
    if (!myClub) return res.json([]);
    const list = await Tournament.find({ 'registrations.club': myClub._id })
      .select('name bannerUrl format startDate endDate district registrationDeadline registrations status')
      .lean();
    // Attach my registration status
    const mapped = list.map(t => {
      const reg = (t.registrations || []).find(r => String(r.club) === String(myClub._id));
      return { ...t, myRegistrationStatus: reg?.status || 'pending' };
    });
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching my tournaments:', error);
    res.status(500).json({ message: 'Failed to fetch my tournaments' });
  }
});

// Registration endpoint with strict validation
router.post('/:id/register', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  const fail = (msg) => {
    logger.warn('Tournament registration failed', { 
      userId: req.user._id, 
      tournamentId: req.params.id, 
      reason: msg 
    });
    return res.status(400).json({ error: msg });
  };
  
  try {
    logger.info('Tournament registration attempt', { 
      userId: req.user._id, 
      tournamentId: req.params.id 
    });
    const t = await Tournament.findById(req.params.id).lean();
    if (!t) return res.status(404).json({ error: 'Tournament not found.' });

    // 2) Tournament status must be Open
    if (t.status !== 'open') return fail('Registration not available.');

    // 3) Current date <= registrationDeadline (if set)
    if (t.registrationDeadline && new Date(t.registrationDeadline) < new Date()) {
      return fail('Registration closed.');
    }

    // 1) Club must be approved by admin
    const myClub = await Club.findOne({ manager: req.user._id });
    if (!myClub) return fail('No club found for this user.');
    if (myClub.status !== 'approved') return fail('Club not approved.');

    // 5) No duplicate registration
    const regs = Array.isArray(t.registrations) ? t.registrations : [];
    const myReg = regs.find(r => String(r.club) === String(myClub._id));
    if (myReg) return fail('Already registered.');

    // 6) Previously rejected? Allow re-registration after 24 hours with admin approval
    const rejectedReg = regs.find(r => String(r.club) === String(myClub._id) && r.status === 'rejected');
    if (rejectedReg) {
      const rejectionTime = new Date(rejectedReg.rejectedAt || rejectedReg.appliedAt);
      const hoursSinceRejection = (Date.now() - rejectionTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceRejection < 24) {
        return fail('Registration was rejected. Please wait 24 hours before re-applying.');
      }
      
      // Allow re-registration but mark it for admin review
      console.log(`Club ${myClub._id} re-applying after rejection. Flagging for admin review.`);
    }

    // 4) Capacity check with atomic operation to prevent race conditions
    const updateResult = await Tournament.updateOne(
      { 
        _id: t._id,
        $expr: {
          $lt: [
            { $size: { $filter: { 
              input: '$registrations', 
              cond: { $in: ['$$this.status', ['pending', 'approved']] }
            }}},
            '$maxTeams'
          ]
        },
        'registrations.club': { $ne: myClub._id } // Ensure no duplicate
      },
      { $push: { registrations: { club: myClub._id, status: 'pending', appliedAt: new Date() } } }
    );

    if (updateResult.matchedCount === 0) {
      // Either tournament is full or club already registered
      const updatedT = await Tournament.findById(t._id).lean();
      const currentRegs = Array.isArray(updatedT.registrations) ? updatedT.registrations : [];
      const taken = currentRegs.filter(r => ['pending', 'approved'].includes(r.status)).length;
      
      if (taken >= t.maxTeams) {
        return fail('Tournament is full.');
      }
      
      const existingReg = currentRegs.find(r => String(r.club) === String(myClub._id));
      if (existingReg) {
        return fail('Already registered.');
      }
      
      return fail('Registration failed. Please try again.');
    }

    logger.info('Tournament registration successful', { 
      userId: req.user._id, 
      clubId: myClub._id,
      tournamentId: t._id,
      tournamentName: t.name
    });
    
    return res.json({ message: 'Registered successfully', tournamentId: t._id });
  } catch (error) {
    logger.error('Tournament registration error', { 
      userId: req.user._id, 
      tournamentId: req.params.id, 
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to register.' });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const list = await Tournament.find({ 
      status: { $in: ['upcoming', 'ongoing'] } 
    })
    .populate('organizer', 'name email')
    .sort({ startDate: 1 });
    res.json(list);
  } catch (error) {
    console.error('Error fetching upcoming tournaments:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming tournaments' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const list = await Tournament.find({ 
      status: 'completed' 
    })
    .populate('organizer', 'name email')
    .sort({ endDate: -1 });
    res.json(list);
  } catch (error) {
    console.error('Error fetching tournament history:', error);
    res.status(500).json({ message: 'Failed to fetch tournament history' });
  }
});

// Get single tournament
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('participants', 'name location');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ message: 'Failed to fetch tournament' });
  }
});

// Basic matches endpoint (for later expansion)
router.get('/:id/matches', async (req, res) => {
  try {
    const matches = await Match.find({ tournament: req.params.id })
      .populate('homeClub awayClub');
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Failed to fetch matches' });
  }
});

export default router;