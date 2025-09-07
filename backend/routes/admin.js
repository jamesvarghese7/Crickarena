import express from 'express';
import Club from '../models/Club.js';
import Tournament from '../models/Tournament.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// Get all club registrations for admin review
router.get('/clubs', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const clubs = await Club.find(filter)
      .populate('manager', 'name email')
      .sort({ submittedAt: -1 });

    // Transform data for frontend
    const transformedClubs = clubs.map(club => ({
      id: club._id,
      clubName: club.clubName || club.name, // Support both new and legacy format
      district: club.district,
      city: club.city,
      foundedYear: club.foundedYear,
      managerName: club.managerName || club.manager?.name,
      phone: club.phone,
      email: club.email || club.manager?.email,
      description: club.description,
      groundName: club.groundName,
      memberCount: club.memberCount,
      website: club.website,
      achievements: club.achievements,
      status: club.status,
      submittedAt: club.submittedAt || club.createdAt,
      processedAt: club.processedAt,
      rejectionReason: club.rejectionReason
    }));

    res.json({ clubs: transformedClubs });
  } catch (error) {
    console.error('Error fetching clubs for admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get admin dashboard statistics
router.get('/stats', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      Club.countDocuments({ status: 'pending' }),
      Club.countDocuments({ status: 'approved' }),
      Club.countDocuments({ status: 'rejected' }),
      Club.countDocuments({})
    ]);

    res.json({
      stats: {
        pending,
        approved,
        rejected,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve club registration
router.put('/clubs/:id/approve', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
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

    res.json({ 
      message: 'Club approved successfully', 
      club: {
        id: club._id,
        status: club.status,
        processedAt: club.processedAt
      }
    });
  } catch (error) {
    console.error('Error approving club:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject club registration
router.put('/clubs/:id/reject', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    const club = await Club.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: reason || 'No reason provided',
        processedAt: new Date(),
        processedBy: req.user._id
      },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json({ 
      message: 'Club rejected successfully', 
      club: {
        id: club._id,
        status: club.status,
        processedAt: club.processedAt,
        rejectionReason: club.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error rejecting club:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== Tournament Management (Admin) =====
// Create tournament
router.post('/tournaments', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const body = req.body || {};

    // Normalize incoming fields to match model
    const normalizeFormat = (v) => {
      if (!v) return 'league';
      const s = String(v).toLowerCase();
      if (s === 'knockout') return 'knockout';
      if (s === 'league') return 'league';
      if (s === 'league+playoff' || s === 'leagueplusplayoff' || s === 'league_playoff') return 'league+playoff';
      if (s === 'round-robin' || s === 'roundrobin') return 'round-robin';
      return 'league';
    };
    const normalizeStatus = (v) => {
      if (!v) return 'open';
      const map = { open: 'open', ongoing: 'ongoing', completed: 'completed', cancelled: 'cancelled' };
      const s = String(v).toLowerCase();
      return map[s] || 'open';
    };

    // Allow legacy keys: type -> format, banner -> bannerUrl
    const format = normalizeFormat(body.format || body.type);
    const status = normalizeStatus(body.status);
    const bannerUrl = body.bannerUrl || body.banner || '';

    // Basic required validation
    if (!body.name) return res.status(400).json({ message: 'Name is required' });
    if (!body.startDate || !body.endDate) return res.status(400).json({ message: 'Start and End dates are required' });

    const t = await Tournament.create({
      name: body.name,
      description: body.description || '',
      rules: body.rules || '',
      district: body.district || '',
      location: body.location || body.district || '',
      venues: body.venues || [],
      bannerUrl,
      format,
      startDate: body.startDate,
      endDate: body.endDate,
      status,
      maxTeams: body.maxTeams || 16,
      registrationDeadline: body.registrationDeadline,
      organizer: req.user._id,
    });
    res.json(t);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ message: 'Failed to create tournament' });
  }
});

// List tournaments with optional status filter
router.get('/tournaments', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const list = await Tournament.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Error listing tournaments:', error);
    res.status(500).json({ message: 'Failed to fetch tournaments' });
  }
});

// Update tournament
router.put('/tournaments/:id', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const updates = req.body || {};
    const t = await Tournament.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    res.json(t);
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ message: 'Failed to update tournament' });
  }
});

// Cancel tournament
router.put('/tournaments/:id/cancel', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const t = await Tournament.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    res.json(t);
  } catch (error) {
    console.error('Error cancelling tournament:', error);
    res.status(500).json({ message: 'Failed to cancel tournament' });
  }
});

// View registrations
router.get('/tournaments/:id/registrations', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id)
      .populate('registrations.club', 'clubName district managerName');
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    res.json(t.registrations || []);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

// Approve/Reject registration
router.put('/tournaments/:id/registrations/:regId/:action', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { action } = req.params; // 'approve' or 'reject'
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    const reg = t.registrations.id(req.params.regId);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

    reg.status = action === 'approve' ? 'approved' : 'rejected';
    reg.decisionAt = new Date();
    await t.save();

    // Maintain legacy participants array
    if (reg.status === 'approved') {
      const exists = (t.participants || []).some(id => String(id) === String(reg.club));
      if (!exists) t.participants.push(reg.club);
      await t.save();
    }

    res.json(reg);
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ message: 'Failed to update registration' });
  }
});

export default router;