import express from 'express';
import Match from '../models/Match.js';
import Coach from '../models/Coach.js';
import Player from '../models/Player.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { body, validationResult, param } from 'express-validator';
import lineupOptimizer from '../services/lineupOptimizer.js';
import mlService from '../services/pythonMLService.js';

const router = express.Router();

// GET /api/matches/:matchId - Get single match by ID (for analytics page)
router.get('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const match = await Match.findById(matchId)
      .populate('homeClub', 'name clubName logoUrl')
      .populate('awayClub', 'name clubName logoUrl')
      .populate('tournament', 'name title');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Validation middleware for roster submission (11 playing + 3 substitutes)
const validateRoster = [
  param('matchId').isMongoId().withMessage('Valid match ID is required'),
  body('playing').isArray({ min: 11, max: 11 }).withMessage('Exactly 11 playing XI players must be selected'),
  body('playing.*.playerId').isMongoId().withMessage('Valid player ID is required'),
  body('playing.*.playerName').trim().isLength({ min: 1 }).withMessage('Player name is required'),
  body('playing.*.position').trim().isLength({ min: 1 }).withMessage('Player position is required'),
  body('playing.*.jerseyNumber').optional({ nullable: true }).isInt({ min: 0, max: 99 }).withMessage('Jersey number must be between 0-99'),
  body('substitutes').isArray({ min: 3, max: 3 }).withMessage('Exactly 3 substitute players must be selected'),
  body('substitutes.*.playerId').isMongoId().withMessage('Valid player ID is required'),
  body('substitutes.*.playerName').trim().isLength({ min: 1 }).withMessage('Player name is required'),
  body('substitutes.*.position').trim().isLength({ min: 1 }).withMessage('Player position is required'),
  body('substitutes.*.jerseyNumber').optional({ nullable: true }).isInt({ min: 0, max: 99 }).withMessage('Jersey number must be between 0-99')
];

// POST /api/matches/:matchId/roster - Submit roster for a match
router.post('/:matchId/roster', verifyFirebaseToken, validateRoster, async (req, res) => {
  try {
    console.log('Roster submission request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { matchId } = req.params;
    const { playing, substitutes } = req.body;

    // Get coach profile
    const coach = await Coach.findOne({ user: req.user._id }).populate('currentClub');
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    if (!coach.currentClub) {
      return res.status(400).json({ message: 'Coach is not associated with any club' });
    }

    // Get match details
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if match is upcoming (can only set roster for upcoming matches)
    if (match.status !== 'Scheduled') {
      return res.status(400).json({ message: 'Can only set roster for scheduled matches' });
    }

    // Check if coach's club is participating in this match
    const coachClubId = coach.currentClub._id.toString();
    const isHomeTeam = match.homeClub.toString() === coachClubId;
    const isAwayTeam = match.awayClub.toString() === coachClubId;

    if (!isHomeTeam && !isAwayTeam) {
      return res.status(403).json({ message: 'You can only set roster for your own club\'s matches' });
    }

    // Verify all players (playing + substitutes) belong to the coach's club
    const allPlayers = [...playing, ...substitutes];
    const playerIds = allPlayers.map(p => p.playerId);
    
    // Check for duplicate player IDs across playing and substitutes
    const uniquePlayerIds = [...new Set(playerIds.map(id => id.toString()))];
    if (uniquePlayerIds.length !== playerIds.length) {
      return res.status(400).json({ message: 'A player cannot be in both playing XI and substitutes' });
    }

    const clubPlayers = await Player.find({
      _id: { $in: playerIds },
      currentClub: coach.currentClub._id,
      isActive: true
    });

    if (clubPlayers.length !== allPlayers.length) {
      return res.status(400).json({ message: 'All selected players must be active members of your club' });
    }

    // Create roster object with playing XI and substitutes
    const roster = {
      playing: playing.map(player => ({
        playerId: player.playerId,
        playerName: player.playerName,
        position: player.position,
        jerseyNumber: player.jerseyNumber || null
      })),
      substitutes: substitutes.map(player => ({
        playerId: player.playerId,
        playerName: player.playerName,
        position: player.position,
        jerseyNumber: player.jerseyNumber || null
      })),
      substitutions: [], // Empty initially, will be populated during match
      submittedBy: coach._id,
      submittedAt: new Date()
    };

    // Update the appropriate roster field
    if (isHomeTeam) {
      match.homeClubRoster = roster;
    } else {
      match.awayClubRoster = roster;
    }

    await match.save();

    res.json({ 
      message: 'Roster submitted successfully',
      roster: roster,
      teamType: isHomeTeam ? 'home' : 'away'
    });

  } catch (error) {
    console.error('Error submitting roster:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/matches/:matchId/roster - Get roster for a match
router.get('/:matchId/roster', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate('homeClub', 'name clubName logoUrl')
      .populate('awayClub', 'name clubName logoUrl')
      .populate('homeClubRoster.submittedBy', 'fullName')
      .populate('awayClubRoster.submittedBy', 'fullName')
      .select('homeClub awayClub homeClubRoster awayClubRoster status');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const response = {
      matchId: match._id,
      status: match.status,
      homeTeam: {
        club: {
          _id: match.homeClub._id,
          name: match.homeClub.clubName || match.homeClub.name,
          logoUrl: match.homeClub.logoUrl
        },
        roster: match.homeClubRoster || null
      },
      awayTeam: {
        club: {
          _id: match.awayClub._id,
          name: match.awayClub.clubName || match.awayClub.name,
          logoUrl: match.awayClub.logoUrl
        },
        roster: match.awayClubRoster || null
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching roster:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/matches/:matchId/roster/my-team - Get roster status for coach's team
router.get('/:matchId/roster/my-team', verifyFirebaseToken, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get coach profile
    const coach = await Coach.findOne({ user: req.user._id }).populate('currentClub');
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    if (!coach.currentClub) {
      return res.status(400).json({ message: 'Coach is not associated with any club' });
    }

    const match = await Match.findById(matchId)
      .populate('homeClub', 'name clubName')
      .populate('awayClub', 'name clubName')
      .select('homeClub awayClub homeClubRoster awayClubRoster status');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if coach's club is participating in this match
    const coachClubId = coach.currentClub._id.toString();
    const isHomeTeam = match.homeClub._id.toString() === coachClubId;
    const isAwayTeam = match.awayClub._id.toString() === coachClubId;

    if (!isHomeTeam && !isAwayTeam) {
      return res.status(403).json({ message: 'You can only view roster for your own club\'s matches' });
    }

    const teamRoster = isHomeTeam ? match.homeClubRoster : match.awayClubRoster;

    res.json({
      matchId: match._id,
      matchStatus: match.status,
      teamType: isHomeTeam ? 'home' : 'away',
      hasRoster: !!teamRoster,
      roster: teamRoster || null,
      canSubmitRoster: match.status === 'Scheduled'
    });

  } catch (error) {
    console.error('Error fetching team roster status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/matches/:matchId/lineup/suggest - Get AI-powered lineup suggestions
router.post('/:matchId/lineup/suggest', verifyFirebaseToken, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get coach profile
    const coach = await Coach.findOne({ user: req.user._id }).populate('currentClub');
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    if (!coach.currentClub) {
      return res.status(400).json({ message: 'Coach is not associated with any club' });
    }

    // Get match details
    const match = await Match.findById(matchId)
      .populate('homeClub', 'name clubName')
      .populate('awayClub', 'name clubName');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Verify coach's club is participating
    const coachClubId = coach.currentClub._id.toString();
    const isHomeTeam = match.homeClub._id.toString() === coachClubId;
    const isAwayTeam = match.awayClub._id.toString() === coachClubId;

    if (!isHomeTeam && !isAwayTeam) {
      return res.status(403).json({ message: 'You can only get lineup suggestions for your own club\'s matches' });
    }

    // Get all active players from coach's club
    const players = await Player.find({
      currentClub: coach.currentClub._id,
      isActive: true
    }).select('fullName age preferredPosition battingStyle bowlingStyle jerseyNumber statistics playingExperience');

    if (players.length < 11) {
      return res.status(400).json({ 
        message: `Insufficient players. You need at least 11 active players, but only have ${players.length}.` 
      });
    }

    // Format players for optimizer
    const formattedPlayers = players.map(player => ({
      _id: player._id,
      fullName: player.fullName,
      age: player.age,
      position: player.preferredPosition,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
      jerseyNumber: player.jerseyNumber,
      statistics: player.statistics || {
        matchesPlayed: 0,
        runsScored: 0,
        wicketsTaken: 0,
        catches: 0,
        stumpings: 0
      },
      playingExperience: player.playingExperience
    }));

    // Build match context
    const opponentClub = isHomeTeam ? match.awayClub : match.homeClub;
    const matchContext = {
      opponent: opponentClub.clubName || opponentClub.name,
      venue: match.venue || 'TBD',
      isHomeMatch: isHomeTeam,
      matchFormat: match.matchFormat || 'T20'
    };

    // Generate AI suggestions
    const suggestions = await lineupOptimizer.generateSuggestions(formattedPlayers, matchContext);

    // Add reasoning for each player in each suggestion
    const enrichedSuggestions = suggestions.map(suggestion => ({
      ...suggestion,
      playing: suggestion.playing.map(player => ({
        ...player,
        reasoning: lineupOptimizer.getSelectionReasoning(player, player.scoreBreakdown)
      })),
      substitutes: suggestion.substitutes.map(player => ({
        ...player,
        reasoning: lineupOptimizer.getSelectionReasoning(player, player.scoreBreakdown)
      }))
    }));

    res.json({
      success: true,
      matchContext,
      suggestions: enrichedSuggestions,
      totalPlayersAnalyzed: formattedPlayers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating lineup suggestions:', error);
    res.status(500).json({ 
      message: 'Failed to generate lineup suggestions',
      error: error.message 
    });
  }
});

// POST /api/matches/ml/train - Train ML model with club's player data (Coach only)
router.post('/ml/train', verifyFirebaseToken, async (req, res) => {
  try {
    // Get coach profile
    const coach = await Coach.findOne({ user: req.user._id }).populate('currentClub');
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    if (!coach.currentClub) {
      return res.status(400).json({ message: 'Coach is not associated with any club' });
    }

    // Get all active players from ALL clubs (for better model training)
    const players = await Player.find({ isActive: true })
      .select('fullName age preferredPosition battingStyle bowlingStyle jerseyNumber statistics playingExperience')
      .limit(500); // Limit to prevent overload

    if (players.length < 20) {
      return res.status(400).json({ 
        message: 'Insufficient player data for training. Need at least 20 players with statistics.' 
      });
    }

    console.log(`🤖 Starting ML model training with ${players.length} players...`);

    // Format players for ML service
    const formattedPlayers = players.map(player => ({
      _id: player._id.toString(),
      fullName: player.fullName,
      age: player.age,
      position: player.preferredPosition,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
      jerseyNumber: player.jerseyNumber,
      statistics: player.statistics || {
        matchesPlayed: 0,
        runsScored: 0,
        wicketsTaken: 0,
        catches: 0,
        stumpings: 0
      },
      playingExperience: player.playingExperience
    }));

    // Train the model
    const metrics = await mlService.trainModel(formattedPlayers);

    res.json({
      success: true,
      message: 'ML model trained successfully',
      metrics,
      playersUsed: players.length,
      trainedBy: {
        coach: coach.fullName,
        club: coach.currentClub.clubName || coach.currentClub.name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error training ML model:', error);
    res.status(500).json({ 
      message: 'Failed to train ML model',
      error: error.message 
    });
  }
});

// GET /api/matches/ml/status - Check ML model status
router.get('/ml/status', verifyFirebaseToken, async (req, res) => {
  try {
    const isTrained = await mlService.isModelTrained();
    
    res.json({
      mlAvailable: true,
      modelTrained: isTrained,
      status: isTrained ? 'ready' : 'not-trained',
      message: isTrained 
        ? 'ML model is trained and ready for predictions' 
        : 'ML model needs training. Use POST /api/matches/ml/train to train the model.'
    });
  } catch (error) {
    res.json({
      mlAvailable: false,
      modelTrained: false,
      status: 'unavailable',
      message: 'ML service is not available. Python dependencies may be missing.',
      error: error.message
    });
  }
});

export default router;
