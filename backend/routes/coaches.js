import express from 'express';
import multer from 'multer';
import Coach from '../models/Coach.js';
import Club from '../models/Club.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Player from '../models/Player.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { body, validationResult, param } from 'express-validator';

const router = express.Router();

// Configure multer for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'), false);
    }
  }
});

// Validation middleware
const validateCoachRegistration = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('phone').matches(/^(\+91[\s-]?)?[6-9]\d{9}$/).withMessage('Valid Indian phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('address.street').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Street address must be 3-200 characters'),
  body('address.city').trim().isLength({ min: 2, max: 50 }).withMessage('City is required'),
  body('address.district').trim().isLength({ min: 2, max: 50 }).withMessage('District is required'),
  body('address.state').trim().isLength({ min: 2, max: 50 }).withMessage('State is required'),
  body('address.pincode').matches(/^\d{6}$/).withMessage('Valid 6-digit pincode is required'),
  body('coachingExperience').isIn(['beginner', '1-2 years', '3-5 years', '5-10 years', '10+ years']).withMessage('Valid coaching experience is required'),
  body('specializations').isArray().withMessage('Specializations must be an array'),
  body('specializations.*').isIn(['batting', 'bowling', 'fielding', 'wicket-keeping', 'fitness', 'mental-coaching', 'strategy', 'youth-development']).withMessage('Invalid specialization'),
  body('coachingPhilosophy').optional().trim().isLength({ max: 1000 }).withMessage('Coaching philosophy must be less than 1000 characters'),
  body('methodology').optional().trim().isLength({ max: 1000 }).withMessage('Methodology must be less than 1000 characters')
];

// GET /api/coaches/profile - Get current coach's profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id })
      .populate('currentClub', 'name clubName district city')
      .populate('applications.club', 'name clubName district city')
      .populate('applications.processedBy', 'name email');

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    // Add computed field to indicate if profile photo exists
    const coachData = coach.toObject();
    coachData.hasProfilePhoto = !!(coach.profilePhoto && coach.profilePhoto.data);
    
    console.log(`[DEBUG] Coach profile request - hasProfilePhoto: ${coachData.hasProfilePhoto}`);

    res.json({ coach: coachData });
  } catch (error) {
    console.error('Error fetching coach profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/register - Register as a coach
router.post('/register', verifyFirebaseToken, validateCoachRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user already has a coach profile
    const existingCoach = await Coach.findOne({ user: req.user._id });
    if (existingCoach) {
      return res.status(400).json({ message: 'Coach profile already exists' });
    }

    // Calculate age from date of birth
    const birthDate = new Date(req.body.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Validate age (must be between 18 and 70 for coaches)
    if (age < 18 || age > 70) {
      return res.status(400).json({ message: 'Coach age must be between 18 and 70 years' });
    }

    const coachData = {
      user: req.user._id,
      userUid: req.firebase?.uid || req.user.firebaseUid,
      ...req.body,
      age,
      email: req.user.email
    };

    const coach = new Coach(coachData);
    // Mark profile as completed upon successful registration
    coach.profileCompleted = true;
    await coach.save();

    // Update user role to include coach
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { role: 'coach' } }
    );

    res.status(201).json({ 
      message: 'Coach profile created successfully',
      coach: await coach.populate('currentClub', 'name clubName district city')
    });
  } catch (error) {
    console.error('Error creating coach profile:', error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// PUT /api/coaches/profile - Update coach profile
router.put('/profile', verifyFirebaseToken, validateCoachRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    // Calculate age from date of birth
    const birthDate = new Date(req.body.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Update coach data
    Object.assign(coach, req.body, { age });
    coach.profileCompleted = true;
    
    await coach.save();

    res.json({ 
      message: 'Coach profile updated successfully',
      coach: await coach.populate('currentClub', 'name clubName district city')
    });
  } catch (error) {
    console.error('Error updating coach profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/upload-document - Upload a document
router.post('/upload-document', verifyFirebaseToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ message: 'Document name and type are required' });
    }

    const validTypes = ['certificate', 'reference', 'portfolio', 'photo'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const document = {
      name,
      type,
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    coach.documents.push(document);
    await coach.save();

    res.json({ 
      message: 'Document uploaded successfully',
      documentId: coach.documents[coach.documents.length - 1]._id
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/document/:documentId - Get a document
router.get('/document/:documentId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const document = coach.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.set({
      'Content-Type': document.contentType,
      'Content-Disposition': `inline; filename="${document.name}"`
    });
    
    res.send(document.data);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/coaches/document/:documentId - Delete a document
router.delete('/document/:documentId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const documentIndex = coach.documents.findIndex(doc => doc._id.toString() === req.params.documentId);
    if (documentIndex === -1) {
      return res.status(404).json({ message: 'Document not found' });
    }

    coach.documents.splice(documentIndex, 1);
    await coach.save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/upload-photo - Upload profile photo
router.post('/upload-photo', verifyFirebaseToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }

    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    coach.profilePhoto = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    await coach.save();

    res.json({ message: 'Profile photo uploaded successfully' });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/photo - Get profile photo
router.get('/photo', verifyFirebaseToken, async (req, res) => {
  try {
    console.log(`[DEBUG] Coach photo request from user: ${req.user._id} (${req.user.email})`);
    const coach = await Coach.findOne({ user: req.user._id });
    console.log(`[DEBUG] Coach found: ${!!coach}`);
    
    if (!coach) {
      console.log(`[DEBUG] No coach profile found for user: ${req.user._id}`);
      return res.status(404).json({ message: 'Coach profile not found' });
    }
    
    console.log(`[DEBUG] Coach has profile photo: ${!!(coach.profilePhoto && coach.profilePhoto.data)}`);
    
    if (!coach.profilePhoto || !coach.profilePhoto.data) {
      console.log(`[DEBUG] No photo data found for coach: ${req.user._id}`);
      return res.status(404).json({ message: 'Profile photo not found' });
    }
    
    // Set content type for image response with no-cache headers
    res.set({
      'Content-Type': coach.profilePhoto.contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'ETag': `"${req.user._id}-${Date.now()}"`
    });

    console.log(`[DEBUG] Sending coach photo data: ${coach.profilePhoto.data.length} bytes`);
    res.send(coach.profilePhoto.data);
  } catch (error) {
    console.error('Error fetching coach profile photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/apply-to-club/:clubId - Apply to coach a club
router.post('/apply-to-club/:clubId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    if (!coach.profileCompleted) {
      return res.status(400).json({ message: 'Please complete your profile before applying to clubs' });
    }

    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.status !== 'approved') {
      return res.status(400).json({ message: 'Can only apply to approved clubs' });
    }

    if (!coach.canApplyToClub(req.params.clubId)) {
      return res.status(400).json({ 
        message: 'Cannot apply to this club. You may have a pending application, already be associated with a club, or recently applied to this club.' 
      });
    }

    await coach.addApplication(req.params.clubId);

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error applying to club:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/coaches/applications - Get coach's applications
router.get('/applications', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id })
      .populate('applications.club', 'name clubName district city logoUrl')
      .populate('applications.processedBy', 'name email');
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    res.json({ applications: coach.applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/clubs/available - Get clubs available for application
router.get('/clubs/available', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    // Get approved clubs
    const clubs = await Club.find({ status: 'approved' })
      .select('name clubName district city logoUrl description memberCount')
      .sort({ name: 1, clubName: 1 });

    res.json({ clubs });
  } catch (error) {
    console.error('Error fetching available clubs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/club-status - Check if coach is associated with a club
router.get('/club-status', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id })
      .populate('currentClub', 'name clubName district city')
      .select('currentClub joinedClubAt applications');
    
    if (!coach) {
      return res.json({ 
        hasClub: false, 
        canApply: false,
        message: 'Coach profile not found. Please complete your profile first.' 
      });
    }

    // Check if coach is already associated with a club
    if (coach.currentClub) {
      return res.json({
        hasClub: true,
        canApply: false,
        currentClub: {
          id: coach.currentClub._id,
          name: coach.currentClub.clubName || coach.currentClub.name,
          district: coach.currentClub.district,
          city: coach.currentClub.city
        },
        joinedAt: coach.joinedClubAt,
        message: `Already coaching ${coach.currentClub.clubName || coach.currentClub.name}`
      });
    }

    // Check if coach has any pending applications
    const pendingApplication = coach.applications.find(app => app.status === 'pending');
    if (pendingApplication) {
      return res.json({
        hasClub: false,
        canApply: false,
        hasPendingApplication: true,
        message: 'You have a pending application. Please wait for the club manager to review it.'
      });
    }

    // Coach can apply to clubs
    res.json({
      hasClub: false,
      canApply: true,
      message: 'You can apply to coach clubs'
    });
  } catch (error) {
    console.error('Error checking coach club status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/training-programs - Get all training programs for the coach
router.get('/training-programs', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    res.json({ trainingPrograms: coach.trainingPrograms });
  } catch (error) {
    console.error('Error fetching training programs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/training-programs - Create a new training program
router.post('/training-programs', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const trainingProgram = req.body;
    
    // Validate required fields
    if (!trainingProgram.title || !trainingProgram.description || !trainingProgram.startDate || !trainingProgram.endDate) {
      return res.status(400).json({ message: 'Title, description, start date, and end date are required' });
    }
    
    // Validate date logic
    if (new Date(trainingProgram.startDate) >= new Date(trainingProgram.endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    // Add the training program
    const newProgram = await coach.createTrainingProgram(trainingProgram);

    res.status(201).json({ 
      message: 'Training program created successfully',
      trainingProgram: newProgram.trainingPrograms[newProgram.trainingPrograms.length - 1]
    });
  } catch (error) {
    console.error('Error creating training program:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/coaches/training-programs/:programId - Update a training program
router.put('/training-programs/:programId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const trainingProgram = req.body;
    
    // Validate date logic if dates are provided
    if (trainingProgram.startDate && trainingProgram.endDate) {
      if (new Date(trainingProgram.startDate) >= new Date(trainingProgram.endDate)) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }
    
    // Update the training program
    await coach.updateTrainingProgram(req.params.programId, trainingProgram);

    res.json({ message: 'Training program updated successfully' });
  } catch (error) {
    console.error('Error updating training program:', error);
    if (error.message === 'Training program not found') {
      return res.status(404).json({ message: 'Training program not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/coaches/training-programs/:programId - Delete a training program
router.delete('/training-programs/:programId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    // Delete the training program
    await coach.deleteTrainingProgram(req.params.programId);

    res.json({ message: 'Training program deleted successfully' });
  } catch (error) {
    console.error('Error deleting training program:', error);
    if (error.message === 'Training program not found') {
      return res.status(404).json({ message: 'Training program not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/training-programs/:programId - Get a specific training program
router.get('/training-programs/:programId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const program = coach.trainingPrograms.id(req.params.programId);
    if (!program) {
      return res.status(404).json({ message: 'Training program not found' });
    }

    res.json({ trainingProgram: program });
  } catch (error) {
    console.error('Error fetching training program:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/players-in-program/:programId - Get players in a training program
router.get('/players-in-program/:programId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    // In a real implementation, this would fetch players enrolled in the specific program
    // For now, we'll return mock data
    const mockPlayers = [
      {
        _id: '101',
        name: 'Rahul Sharma',
        preferredPosition: 'Batsman',
        lastUpdated: '2023-03-15',
        attendanceRate: 92,
        overallProgress: 78,
        skills: [
          { name: 'Batting Technique', progress: 85, notes: 'Improved footwork significantly' },
          { name: 'Shot Selection', progress: 72, notes: 'Working on aggressive shots' },
          { name: 'Mental Strength', progress: 65, notes: 'Needs more focus under pressure' }
        ],
        recentSessions: [
          { id: '1', date: '2023-03-15', focusArea: 'Cover Drive', notes: 'Excellent technique', attended: true },
          { id: '2', date: '2023-03-12', focusArea: 'Footwork', notes: 'Needs improvement', attended: true },
          { id: '3', date: '2023-03-10', focusArea: 'Shot Selection', notes: 'Good progress', attended: false }
        ],
        sessionsCompleted: 12,
        totalSessions: 15
      },
      {
        _id: '102',
        name: 'Vikram Patel',
        preferredPosition: 'Bowler',
        lastUpdated: '2023-03-14',
        attendanceRate: 85,
        overallProgress: 82,
        skills: [
          { name: 'Line & Length', progress: 90, notes: 'Consistent accuracy' },
          { name: 'Variations', progress: 75, notes: 'Working on slower balls' },
          { name: 'Fitness', progress: 80, notes: 'Good stamina levels' }
        ],
        recentSessions: [
          { id: '1', date: '2023-03-14', focusArea: 'Yorkers', notes: 'Excellent execution', attended: true },
          { id: '2', date: '2023-03-11', focusArea: 'Line & Length', notes: 'Consistent performance', attended: true },
          { id: '3', date: '2023-03-09', focusArea: 'Variations', notes: 'Needs more practice', attended: true }
        ],
        sessionsCompleted: 14,
        totalSessions: 15
      }
    ];

    res.json({ players: mockPlayers });
  } catch (error) {
    console.error('Error fetching players in program:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/add-player-to-program - Add a player to a training program
router.post('/add-player-to-program', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const { playerId, programId } = req.body;
    
    // In a real implementation, this would add the player to the program
    // For now, we'll just return a success message
    res.json({ message: 'Player added to program successfully' });
  } catch (error) {
    console.error('Error adding player to program:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/coaches/remove-player-from-program/:playerId/:programId - Remove a player from a training program
router.delete('/remove-player-from-program/:playerId/:programId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const { playerId, programId } = req.params;
    
    // In a real implementation, this would remove the player from the program
    // For now, we'll just return a success message
    res.json({ message: 'Player removed from program successfully' });
  } catch (error) {
    console.error('Error removing player from program:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/player-progress - Add/update player progress
router.post('/player-progress', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const progressData = req.body;
    
    // Validate required fields
    if (!progressData.player || !progressData.program) {
      return res.status(400).json({ message: 'Player and program are required' });
    }
    
    // Check if progress record already exists
    const existingProgress = coach.playerProgress.find(p => 
      p.player.toString() === progressData.player && 
      p.program.toString() === progressData.program
    );
    
    if (existingProgress) {
      // Update existing progress
      Object.assign(existingProgress, progressData);
    } else {
      // Add new progress record
      coach.playerProgress.push(progressData);
    }
    
    await coach.save();
    
    res.json({ message: 'Player progress updated successfully' });
  } catch (error) {
    console.error('Error updating player progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/player-progress/:programId - Get all player progress for a program
router.get('/player-progress/:programId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const { programId } = req.params;
    
    const progressRecords = coach.getPlayerProgressForProgram(programId);
    
    res.json({ progressRecords });
  } catch (error) {
    console.error('Error fetching player progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/player-progress-detail/:playerId/:programId - Get detailed progress for a player in a program
router.get('/player-progress-detail/:playerId/:programId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const { playerId, programId } = req.params;
    
    const progressRecord = coach.playerProgress.find(p => 
      p.player.toString() === playerId && 
      p.program.toString() === programId
    );
    
    if (!progressRecord) {
      return res.status(404).json({ message: 'Player progress record not found' });
    }
    
    res.json({ progress: progressRecord });
  } catch (error) {
    console.error('Error fetching player progress detail:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/sessions - Create a new training session
router.post('/sessions', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const sessionData = req.body;
    
    // Validate required fields
    if (!sessionData.date || !sessionData.startTime || !sessionData.endTime || 
        !sessionData.focusArea || !sessionData.location) {
      return res.status(400).json({ message: 'All session fields are required' });
    }
    
    // In a real implementation, this would create a new session
    // For now, we'll just return a success message
    res.status(201).json({ message: 'Session created successfully', sessionId: 'mock-session-id' });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/coaches/sessions/:sessionId - Update a training session
router.put('/sessions/:sessionId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const { sessionId } = req.params;
    const sessionData = req.body;
    
    // In a real implementation, this would update the session
    // For now, we'll just return a success message
    res.json({ message: 'Session updated successfully' });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/coaches/sessions/:sessionId - Delete a training session
router.delete('/sessions/:sessionId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const { sessionId } = req.params;
    
    // In a real implementation, this would delete the session
    // For now, we'll just return a success message
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/sessions/:programId - Get all sessions for a training program
router.get('/sessions/:programId', verifyFirebaseToken, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const { programId } = req.params;
    
    // In a real implementation, this would fetch sessions for the program
    // For now, we'll return mock data
    const mockSessions = [
      {
        _id: '101',
        date: '2023-03-15',
        startTime: '09:00',
        endTime: '11:00',
        focusArea: 'Cover Drive Technique',
        location: 'Main Ground',
        notes: 'Focus on footwork and bat angle'
      },
      {
        _id: '102',
        date: '2023-03-17',
        startTime: '10:00',
        endTime: '12:00',
        focusArea: 'Yorker Practice',
        location: 'Net Bowsing Area',
        notes: 'All bowlers must attend'
      },
      {
        _id: '103',
        date: '2023-03-20',
        startTime: '16:00',
        endTime: '18:00',
        focusArea: 'Fielding Positions',
        location: 'Main Ground',
        notes: 'Bring gloves and helmets'
      }
    ];

    res.json({ sessions: mockSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Club Manager Routes

// GET /api/coaches/club/applications - Get applications for club manager's club
router.get('/club/applications', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  try {
    // Find the club managed by this user
    const club = await Club.findOne({ manager: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'No club found for this manager' });
    }

    // Find all coaches with applications to this club
    const coaches = await Coach.find({ 'applications.club': club._id })
      .populate('user', 'name email')
      .select('fullName age coachingExperience specializations applications profilePhoto');

    // Filter and format applications for this club
    const applications = [];
    coaches.forEach(coach => {
      const clubApplications = coach.applications.filter(app => 
        app.club.toString() === club._id.toString()
      );
      
      clubApplications.forEach(app => {
        applications.push({
          _id: app._id,
          coach: {
            _id: coach._id,
            fullName: coach.fullName,
            age: coach.age,
            coachingExperience: coach.coachingExperience,
            specializations: coach.specializations,
            coachingHistory: coach.coachingHistory,
            hasProfilePhoto: !!(coach.profilePhoto && coach.profilePhoto.data),
            user: coach.user
          },
          status: app.status,
          appliedAt: app.appliedAt,
          processedAt: app.processedAt,
          rejectionReason: app.rejectionReason,
          approvalNotes: app.approvalNotes
        });
      });
    });

    // Sort by application date (newest first)
    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching club applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/coaches/club/applications/:applicationId/approve - Approve an application
router.put('/club/applications/:applicationId/approve', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  try {
    const { approvalNotes } = req.body;

    // Find the club managed by this user
    const club = await Club.findOne({ manager: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'No club found for this manager' });
    }

    // Find the coach with this application
    const coach = await Coach.findOne({ 'applications._id': req.params.applicationId });
    if (!coach) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = coach.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify this application is for the manager's club
    if (application.club.toString() !== club._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to process this application' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application has already been processed' });
    }

    // Approve the application
    application.status = 'approved';
    application.processedAt = new Date();
    application.processedBy = req.user._id;
    application.approvalNotes = approvalNotes;

    // Set coach's current club
    coach.currentClub = club._id;
    coach.joinedClubAt = new Date();

    await coach.save();

    res.json({ message: 'Application approved successfully' });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/coaches/club/applications/:applicationId/reject - Reject an application
router.put('/club/applications/:applicationId/reject', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({ message: 'Rejection reason must be at least 10 characters long' });
    }

    // Find the club managed by this user
    const club = await Club.findOne({ manager: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'No club found for this manager' });
    }

    // Find the coach with this application
    const coach = await Coach.findOne({ 'applications._id': req.params.applicationId });
    if (!coach) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = coach.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify this application is for the manager's club
    if (application.club.toString() !== club._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to process this application' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application has already been processed' });
    }

    // Reject the application
    application.status = 'rejected';
    application.processedAt = new Date();
    application.processedBy = req.user.uid;
    application.rejectionReason = rejectionReason.trim();

    await coach.save();

    res.json({ message: 'Application rejected successfully' });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/club/coach/:coachId - Get detailed coach info for club manager
router.get('/club/coach/:coachId', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  try {
    // Find the club managed by this user
    const club = await Club.findOne({ manager: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'No club found for this manager' });
    }

    const coach = await Coach.findById(req.params.coachId)
      .populate('user', 'name email')
      .populate('applications.club', 'name clubName')
      .populate('currentClub', 'name clubName');

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    // Check if this coach has applied to the manager's club
    const hasApplicationToClub = coach.applications.some(app => 
      app.club._id.toString() === club._id.toString()
    );

    if (!hasApplicationToClub) {
      return res.status(403).json({ message: 'Unauthorized to view this coach' });
    }

    res.json({ coach });
  } catch (error) {
    console.error('Error fetching coach details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/club/coach/:coachId/photo - Get coach photo for club manager
router.get('/club/coach/:coachId/photo', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  try {
    // Find the club managed by this user
    const club = await Club.findOne({ manager: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'No club found for this manager' });
    }

    const coach = await Coach.findById(req.params.coachId);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    // Check if this coach has applied to the manager's club
    const hasApplicationToClub = coach.applications.some(app => 
      app.club.toString() === club._id.toString()
    );

    if (!hasApplicationToClub) {
      return res.status(403).json({ message: 'Unauthorized to view this coach' });
    }

    if (!coach.profilePhoto || !coach.profilePhoto.data) {
      return res.status(404).json({ message: 'Profile photo not found' });
    }

    res.set({
      'Content-Type': coach.profilePhoto.contentType,
      'Cache-Control': 'public, max-age=86400'
    });
    
    res.send(coach.profilePhoto.data);
  } catch (error) {
    console.error('Error fetching coach photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/club/coach/:coachId/document/:documentId - Get coach document for club manager
router.get('/club/coach/:coachId/document/:documentId', verifyFirebaseToken, requireRole('clubManager'), async (req, res) => {
  try {
    // Find the club managed by this user
    const club = await Club.findOne({ manager: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'No club found for this manager' });
    }

    const coach = await Coach.findById(req.params.coachId);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    // Check if this coach has applied to the manager's club
    const hasApplicationToClub = coach.applications.some(app => 
      app.club.toString() === club._id.toString()
    );

    if (!hasApplicationToClub) {
      return res.status(403).json({ message: 'Unauthorized to view this coach' });
    }

    const document = coach.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.set({
      'Content-Type': document.contentType,
      'Content-Disposition': `inline; filename="${document.name}"`
    });
    
    res.send(document.data);
  } catch (error) {
    console.error('Error fetching coach document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes

// GET /api/coaches/admin/all - Get all coaches (admin only)
router.get('/admin/all', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, district, status } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (district) {
      query['address.district'] = district;
    }
    
    if (status) {
      query.isActive = status === 'active';
    }

    const coaches = await Coach.find(query)
      .populate('user', 'name email')
      .populate('currentClub', 'name clubName district')
      .select('fullName age coachingExperience specializations address.district currentClub isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Coach.countDocuments(query);

    res.json({
      coaches,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching all coaches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coaches/messages - Get messages for the current coach
router.get('/messages', verifyFirebaseToken, async (req, res) => {
  try {
    const coachId = req.user._id;
    
    // Find messages where the coach is a recipient or sender
    const messages = await Message.find({
      $or: [
        { 'recipients.recipient': coachId, 'recipients.recipientModel': 'Coach' },
        { sender: coachId, senderModel: 'Coach' }
      ]
    })
    .populate('sender', 'fullName') // Populate sender info
    .populate('recipients.recipient', 'fullName') // Populate recipient info
    .sort({ timestamp: -1 }); // Sort by newest first
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching coach messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/messages - Send a message from coach to players
router.post('/messages', verifyFirebaseToken, async (req, res) => {
  try {
    const { content, subject = 'Message from Coach', type = 'general', recipients } = req.body;
    const coachId = req.user._id;
    
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: 'At least one recipient is required' });
    }
    
    // Get coach to find their club
    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    
    // Create message
    const message = new Message({
      sender: coachId,
      senderModel: 'Coach',
      recipients: recipients.map(recipientId => ({
        recipient: recipientId,
        recipientModel: 'Player'
      })),
      subject,
      content,
      type
    });
    
    await message.save();
    
    res.status(201).json({ message: 'Message sent successfully', messageId: message._id });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coaches/messages/:messageId/reply - Reply to a message
router.post('/messages/:messageId/reply', verifyFirebaseToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const coachId = req.user._id;
    
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }
    
    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Verify the coach is either the sender or a recipient
    const isSender = message.sender.toString() === coachId.toString() && message.senderModel === 'Coach';
    const isRecipient = message.recipients.some(recipient => 
      recipient.recipient.toString() === coachId.toString() && recipient.recipientModel === 'Coach'
    );
    
    if (!isSender && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized to reply to this message' });
    }
    
    // Add reply
    message.replies.push({
      sender: coachId,
      senderModel: 'Coach',
      content
    });
    
    await message.save();
    
    res.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/coaches/messages/:messageId/read - Mark message as read (for replies to coach)
router.put('/messages/:messageId/read', verifyFirebaseToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const coachId = req.user._id;
    
    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Find the recipient entry and mark as read
    const recipient = message.recipients.find(rec => 
      rec.recipient.toString() === coachId.toString() && rec.recipientModel === 'Coach'
    );
    
    if (!recipient) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }
    
    recipient.read = true;
    recipient.readAt = new Date();
    
    await message.save();
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
