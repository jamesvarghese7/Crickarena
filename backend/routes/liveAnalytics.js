/**
 * Live Analytics API Routes
 * Provides real-time match analytics, predictions, and insights
 */

import express from 'express';
import Match from '../models/Match.js';
import matchAnalytics from '../services/matchAnalytics.js';
import websocketService from '../services/websocket.js';

const router = express.Router();

/**
 * Pick the most recent innings that has at least one legal delivery recorded.
 */
function getLatestActiveInnings(match) {
  if (!match?.innings?.length) return null;

  for (let i = match.innings.length - 1; i >= 0; i -= 1) {
    const innings = match.innings[i];
    if ((innings?.balls || 0) > 0) return innings;
  }

  return null;
}

/**
 * GET /api/live-analytics/:matchId
 * Get comprehensive analytics for a live match
 */
router.get('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate('homeClub', 'name clubName logoUrl')
      .populate('awayClub', 'name clubName logoUrl')
      .populate('tournament', 'name');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const currentInnings = getLatestActiveInnings(match);

    if (!currentInnings) {
      return res.status(400).json({ 
        success: false,
        message: 'No innings data available. Analytics will be available once the match starts and balls are bowled.' 
      });
    }

    // Calculate comprehensive analytics
    const analytics = websocketService.calculateMatchAnalytics(match, currentInnings);

    // If analytics calculation returns null (insufficient data), return error
    if (!analytics) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient match data for analytics calculation.' 
      });
    }

    // Add viewer count
    const viewersCount = websocketService.getViewersCount(matchId);

    res.json({
      success: true,
      matchId,
      match: {
        id: match._id,
        homeClub: match.homeClub,
        awayClub: match.awayClub,
        tournament: match.tournament,
        status: match.status,
        venue: match.venue,
        date: match.date,
        innings: match.innings // Include innings for team name lookup
      },
      analytics: {
        ...analytics,
        viewersCount
      }
    });
  } catch (error) {
    console.error('Error fetching live analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/live-analytics/:matchId/win-probability
 * Get win probability for current match state
 */
router.get('/:matchId/win-probability', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.innings.length < 2) {
      return res.status(400).json({ message: 'Win probability available only in second innings' });
    }

    const firstInnings = match.innings[0];
    const secondInnings = match.innings[1];
    
    const target = (firstInnings.runs || 0) + 1;
    const currentScore = secondInnings.runs || 0;
    const wicketsLost = secondInnings.wickets || 0;
    const balls = secondInnings.balls || 0;
    const ballsRemaining = (match.oversLimit * 6) - balls;
    
    const currentRunRate = balls > 0 ? (currentScore / balls) * 6 : 0;
    const requiredRunRate = ballsRemaining > 0 ? ((target - currentScore) / ballsRemaining) * 6 : 0;

    const recentOvers = secondInnings.overs?.slice(-6) || [];
    const recentRuns = recentOvers.reduce((sum, over) => sum + (over.totalRuns || 0), 0);
    const recentForm = recentOvers.length > 0 ? recentRuns / recentOvers.length : 0;

    const winProbability = matchAnalytics.calculateWinProbability({
      target,
      currentScore,
      wicketsLost,
      ballsRemaining,
      requiredRunRate,
      currentRunRate,
      recentForm,
      format: match.matchFormat || 'T20',
      overs: balls / 6
    });

    // Calculate pressure index
    const pressureIndex = matchAnalytics.calculatePressureIndex({
      requiredRunRate,
      currentRunRate,
      wicketsLost,
      ballsRemaining,
      overs: balls / 6
    });

    res.json({
      success: true,
      matchId,
      winProbability,
      pressureIndex,
      pressureLevel: pressureIndex < 30 ? 'low' : pressureIndex < 60 ? 'moderate' : pressureIndex < 80 ? 'high' : 'extreme',
      context: {
        target,
        currentScore,
        runsNeeded: target - currentScore,
        ballsRemaining,
        wicketsLost,
        currentRunRate: currentRunRate.toFixed(2),
        requiredRunRate: requiredRunRate.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error calculating win probability:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/live-analytics/:matchId/momentum
 * Get current match momentum
 */
router.get('/:matchId/momentum', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const currentInnings = getLatestActiveInnings(match);
    if (!currentInnings) {
      return res.status(400).json({ message: 'No innings data available' });
    }

    const phase = matchAnalytics.getMatchPhase(
      (currentInnings.balls || 0) / 6,
      match.matchFormat || 'T20'
    );
    const momentum = matchAnalytics.calculateMomentum(currentInnings.overs || [], phase);

    res.json({
      success: true,
      matchId,
      momentum
    });
  } catch (error) {
    console.error('Error calculating momentum:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/live-analytics/:matchId/prediction
 * Get final score prediction
 */
router.get('/:matchId/prediction', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const currentInnings = getLatestActiveInnings(match);
    if (!currentInnings) {
      return res.status(400).json({ message: 'No innings data available' });
    }

    const prediction = matchAnalytics.predictFinalScore(
      currentInnings, 
      match.oversLimit || 20,
      match.matchFormat || 'T20'
    );

    res.json({
      success: true,
      matchId,
      prediction,
      currentScore: {
        runs: currentInnings.runs || 0,
        wickets: currentInnings.wickets || 0,
        overs: `${Math.floor((currentInnings.balls || 0) / 6)}.${(currentInnings.balls || 0) % 6}`
      }
    });
  } catch (error) {
    console.error('Error predicting final score:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/live-analytics/:matchId/insights
 * Get match insights and key statistics
 */
router.get('/:matchId/insights', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const currentInnings = getLatestActiveInnings(match);
    if (!currentInnings) {
      return res.status(400).json({ message: 'No innings data available' });
    }

    const insights = matchAnalytics.generateInsights(match, currentInnings);
    const heatmap = matchAnalytics.generateScoringHeatmap(currentInnings.battingCard || []);

    res.json({
      success: true,
      matchId,
      insights,
      heatmap
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/live-analytics/active
 * Get all active matches with live viewers
 */
router.get('/active/matches', async (req, res) => {
  try {
    const activeMatchIds = websocketService.getActiveMatches();
    
    const matches = await Promise.all(
      activeMatchIds.map(async (matchId) => {
        const match = await Match.findById(matchId)
          .populate('homeClub', 'name logo')
          .populate('awayClub', 'name logo')
          .select('homeClub awayClub status venue date');
        
        return {
          match,
          viewersCount: websocketService.getViewersCount(matchId)
        };
      })
    );

    res.json({
      success: true,
      count: matches.length,
      matches: matches.filter(m => m.match !== null)
    });
  } catch (error) {
    console.error('Error fetching active matches:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/live-analytics/:matchId/broadcast
 * Manually trigger analytics broadcast (for testing/admin)
 */
router.post('/:matchId/broadcast', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const currentInnings = getLatestActiveInnings(match);
    if (!currentInnings) {
      return res.status(400).json({ message: 'No innings data available' });
    }

    // Broadcast analytics update
    websocketService.broadcastAnalytics(matchId, match, currentInnings);

    res.json({
      success: true,
      message: 'Analytics broadcast sent',
      viewersCount: websocketService.getViewersCount(matchId)
    });
  } catch (error) {
    console.error('Error broadcasting analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
