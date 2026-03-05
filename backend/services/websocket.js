/**
 * WebSocket Service for Real-time Match Updates
 * Handles live match event streaming to connected clients
 */

import { Server } from 'socket.io';
import matchAnalytics from './matchAnalytics.js';

class WebSocketService {
  constructor() {
    this.io = null;
    this.matchRooms = new Map(); // Track active match rooms
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket service initialized');
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Join match room
      socket.on('join-match', (matchId) => {
        socket.join(`match-${matchId}`);
        console.log(`📺 Client ${socket.id} joined match-${matchId}`);
        
        // Track room
        if (!this.matchRooms.has(matchId)) {
          this.matchRooms.set(matchId, new Set());
        }
        this.matchRooms.get(matchId).add(socket.id);

        // Send initial connection confirmation
        socket.emit('match-joined', { matchId, timestamp: Date.now() });
      });

      // Leave match room
      socket.on('leave-match', (matchId) => {
        socket.leave(`match-${matchId}`);
        console.log(`👋 Client ${socket.id} left match-${matchId}`);
        
        if (this.matchRooms.has(matchId)) {
          this.matchRooms.get(matchId).delete(socket.id);
          if (this.matchRooms.get(matchId).size === 0) {
            this.matchRooms.delete(matchId);
          }
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        
        // Clean up from all rooms
        this.matchRooms.forEach((clients, matchId) => {
          clients.delete(socket.id);
          if (clients.size === 0) {
            this.matchRooms.delete(matchId);
          }
        });
      });

      // Request analytics update
      socket.on('request-analytics', (data) => {
        const { matchId } = data;
        socket.emit('analytics-requested', { matchId, timestamp: Date.now() });
      });
    });
  }

  /**
   * Broadcast match update to all clients watching a match
   */
  broadcastMatchUpdate(matchId, updateData) {
    if (!this.io) return;

    const room = `match-${matchId}`;
    const clientCount = this.matchRooms.get(matchId)?.size || 0;

    if (clientCount > 0) {
      this.io.to(room).emit('match-update', {
        matchId,
        timestamp: Date.now(),
        ...updateData
      });
      console.log(`📡 Broadcast to ${clientCount} clients in match-${matchId}`);
    }
  }

  /**
   * Broadcast ball-by-ball update
   */
  broadcastBallUpdate(matchId, ballData) {
    if (!this.io) return;

    this.io.to(`match-${matchId}`).emit('ball-update', {
      matchId,
      timestamp: Date.now(),
      ...ballData
    });
  }

  /**
   * Broadcast analytics update (win probability, predictions, etc.)
   */
  broadcastAnalytics(matchId, match, currentInnings) {
    if (!this.io) return;

    try {
      // Calculate analytics
      const analytics = this.calculateMatchAnalytics(match, currentInnings);

      this.io.to(`match-${matchId}`).emit('analytics-update', {
        matchId,
        timestamp: Date.now(),
        analytics
      });

      console.log(`📊 Analytics broadcast for match-${matchId}`);
    } catch (error) {
      console.error('Error broadcasting analytics:', error);
    }
  }

  /**
   * Calculate comprehensive match analytics
   */
  calculateMatchAnalytics(match, currentInnings) {
    if (!currentInnings) return null;

    const runs = currentInnings.runs || 0;
    const wickets = currentInnings.wickets || 0;
    const balls = currentInnings.balls || 0;
    const oversLimit = match.oversLimit || 20;
    const ballsRemaining = (oversLimit * 6) - balls;

    // Don't calculate analytics if no balls have been bowled yet
    if (balls === 0) {
      return null;
    }

    // Get target if second innings
    let target = null;
    let winProbability = null;
    
    if (match.innings && match.innings.length >= 2) {
      const firstInnings = match.innings[0];
      target = (firstInnings.runs || 0) + 1;
      
      const currentRunRate = balls > 0 ? (runs / balls) * 6 : 0;
      const requiredRunRate = ballsRemaining > 0 ? ((target - runs) / ballsRemaining) * 6 : 0;

      // Calculate recent form (last 6 overs)
      const recentOvers = currentInnings.overs?.slice(-6) || [];
      const recentRuns = recentOvers.reduce((sum, over) => sum + (over.totalRuns || 0), 0);
      const recentForm = recentOvers.length > 0 ? recentRuns / recentOvers.length : 0;

      winProbability = matchAnalytics.calculateWinProbability({
        target,
        currentScore: runs,
        wicketsLost: wickets,
        ballsRemaining,
        requiredRunRate,
        currentRunRate,
        recentForm
      });
    }

    // Calculate momentum
    const momentum = matchAnalytics.calculateMomentum(currentInnings.overs || []);

    // Predict final score
    const finalScorePrediction = matchAnalytics.predictFinalScore(currentInnings, oversLimit);

    // Generate insights
    const insights = matchAnalytics.generateInsights(match, currentInnings);

    // Scoring heatmap
    const heatmap = matchAnalytics.generateScoringHeatmap(currentInnings.battingCard || []);

    return {
      winProbability,
      momentum,
      finalScorePrediction,
      insights,
      heatmap,
      currentRunRate: balls > 0 ? ((runs / balls) * 6).toFixed(2) : '0.00',
      requiredRunRate: target && ballsRemaining > 0 ? 
        (((target - runs) / ballsRemaining) * 6).toFixed(2) : null,
      projectedScore: finalScorePrediction.predicted,
      // Add innings comparison data
      inningsComparison: this.compareInnings(match)
    };
  }

  /**
   * Compare both innings at same stage (same number of overs)
   */
  compareInnings(match) {
    if (!match.innings || match.innings.length < 2) {
      return null;
    }

    const firstInnings = match.innings[0];
    const secondInnings = match.innings[1];

    // Get team names
    const getTeamName = (clubId) => {
      if (!clubId) return 'Team';
      
      // Check if match has populated club data
      if (match.homeClub) {
        const homeId = match.homeClub._id || match.homeClub;
        const awayId = match.awayClub._id || match.awayClub;
        
        if (String(clubId) === String(homeId)) {
          return match.homeClub.name || match.homeClub.clubName || 'Home Team';
        }
        if (String(clubId) === String(awayId)) {
          return match.awayClub.name || match.awayClub.clubName || 'Away Team';
        }
      }
      
      return 'Team';
    };

    const firstInningsTeam = getTeamName(firstInnings.battingClub);
    const secondInningsTeam = getTeamName(secondInnings.battingClub);

    // Get current over in second innings
    const currentBalls = secondInnings.balls || 0;
    const currentOvers = Math.floor(currentBalls / 6);

    // Calculate first innings score at same stage
    let firstInningsAtStage = {
      runs: 0,
      wickets: 0,
      runRate: 0
    };

    // Sum up runs from first innings up to current over
    if (firstInnings.overs && firstInnings.overs.length > 0) {
      const oversToCompare = firstInnings.overs.slice(0, currentOvers + 1);
      firstInningsAtStage.runs = oversToCompare.reduce((sum, over) => sum + (over.totalRuns || 0), 0);
      firstInningsAtStage.wickets = oversToCompare.reduce((sum, over) => sum + (over.totalWickets || 0), 0);
      
      const ballsAtStage = Math.min(currentBalls, firstInnings.balls || 0);
      firstInningsAtStage.runRate = ballsAtStage > 0 ? (firstInningsAtStage.runs / ballsAtStage * 6).toFixed(2) : '0.00';
    } else {
      // Fallback if no over-by-over data
      const ballsAtStage = Math.min(currentBalls, firstInnings.balls || 0);
      if (ballsAtStage > 0 && firstInnings.balls > 0) {
        const proportion = ballsAtStage / firstInnings.balls;
        firstInningsAtStage.runs = Math.round((firstInnings.runs || 0) * proportion);
        firstInningsAtStage.wickets = Math.round((firstInnings.wickets || 0) * proportion);
        firstInningsAtStage.runRate = (firstInningsAtStage.runs / ballsAtStage * 6).toFixed(2);
      }
    }

    // Current second innings stats
    const secondInningsAtStage = {
      runs: secondInnings.runs || 0,
      wickets: secondInnings.wickets || 0,
      runRate: currentBalls > 0 ? ((secondInnings.runs || 0) / currentBalls * 6).toFixed(2) : '0.00'
    };

    // Calculate difference
    const runDifference = secondInningsAtStage.runs - firstInningsAtStage.runs;
    const wicketDifference = firstInningsAtStage.wickets - secondInningsAtStage.wickets; // Positive means chasing team has more wickets in hand

    return {
      currentOvers: `${currentOvers}.${currentBalls % 6}`,
      firstInnings: {
        ...firstInningsAtStage,
        total: firstInnings.runs || 0,
        totalWickets: firstInnings.wickets || 0,
        teamName: firstInningsTeam
      },
      secondInnings: {
        ...secondInningsAtStage,
        total: secondInnings.runs || 0,
        totalWickets: secondInnings.wickets || 0,
        teamName: secondInningsTeam
      },
      comparison: {
        runDifference, // Positive = chasing team ahead
        wicketDifference, // Positive = chasing team has more wickets
        status: runDifference > 0 ? 'ahead' : runDifference < 0 ? 'behind' : 'level',
        chasingTeam: secondInningsTeam,
        firstBattingTeam: firstInningsTeam
      }
    };
  }

  /**
   * Broadcast wicket event
   */
  broadcastWicket(matchId, wicketData) {
    if (!this.io) return;

    this.io.to(`match-${matchId}`).emit('wicket', {
      matchId,
      timestamp: Date.now(),
      ...wicketData
    });
  }

  /**
   * Broadcast boundary event (4 or 6)
   */
  broadcastBoundary(matchId, boundaryData) {
    if (!this.io) return;

    this.io.to(`match-${matchId}`).emit('boundary', {
      matchId,
      timestamp: Date.now(),
      ...boundaryData
    });
  }

  /**
   * Get active viewers count for a match
   */
  getViewersCount(matchId) {
    return this.matchRooms.get(matchId)?.size || 0;
  }

  /**
   * Get all active matches being watched
   */
  getActiveMatches() {
    return Array.from(this.matchRooms.keys());
  }
}

export default new WebSocketService();
