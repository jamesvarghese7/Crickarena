/**
 * Lineup Optimizer Service
 * Intelligent lineup suggestion system using performance analytics
 * Supports both rule-based and ML-powered scoring
 */

import mlService from './pythonMLService.js';

class LineupOptimizerService {
  constructor() {
    this.useML = true; // Enable ML by default
  }

  /**
   * Calculate comprehensive player score (0-100)
   * @param {Object} player - Player document with statistics
   * @param {Object} matchContext - Match context (opponent, venue, etc.)
   * @param {Map} mlScores - Optional ML predictions map
   * @returns {Object} - Score breakdown and total
   */
  calculatePlayerScore(player, matchContext = {}, mlScores = null) {
    const scores = {
      performance: this.calculatePerformanceScore(player),
      consistency: this.calculateConsistencyScore(player),
      experience: this.calculateExperienceScore(player),
      position: this.calculatePositionScore(player, matchContext),
      age: this.calculateAgeFactor(player)
    };

    // If ML scores available, blend them with rule-based scores
    let totalScore;
    let mlEnhanced = false;
    
    if (mlScores && mlScores.has(player._id.toString())) {
      const mlData = mlScores.get(player._id.toString());
      
      // Hybrid approach: 60% ML + 40% Rule-based
      const ruleBasedScore = (
        scores.performance * 0.40 +
        scores.consistency * 0.20 +
        scores.experience * 0.15 +
        scores.position * 0.15 +
        scores.age * 0.10
      );
      
      totalScore = (mlData.mlScore * 0.60) + (ruleBasedScore * 0.40);
      scores.mlScore = mlData.mlScore;
      scores.mlConfidence = mlData.confidence;
      mlEnhanced = true;
    } else {
      // Fallback to pure rule-based scoring
      totalScore = (
        scores.performance * 0.40 +
        scores.consistency * 0.20 +
        scores.experience * 0.15 +
        scores.position * 0.15 +
        scores.age * 0.10
      );
    }

    return {
      total: Math.round(totalScore * 100) / 100,
      breakdown: scores,
      mlEnhanced,
      player: {
        id: player._id,
        name: player.fullName,
        position: player.position || player.preferredPosition
      }
    };
  }

  /**
   * Calculate performance score based on statistics
   */
  calculatePerformanceScore(player) {
    const stats = player.statistics || {};
    const matches = stats.matchesPlayed || 0;

    if (matches === 0) {
      // New player - use training data as proxy
      return 50; // Neutral score for untested players
    }

    const position = player.position || player.preferredPosition || '';
    let score = 0;

    // Position-specific scoring
    if (position.includes('batsman') || position.includes('all-rounder')) {
      // Batting performance
      const runsPerMatch = stats.runsScored / matches;
      const battingScore = Math.min((runsPerMatch / 30) * 100, 100); // 30 runs = 100 score
      score += battingScore * (position.includes('batsman') ? 1.0 : 0.5);
    }

    if (position.includes('bowler') || position.includes('all-rounder')) {
      // Bowling performance
      const wicketsPerMatch = stats.wicketsTaken / matches;
      const bowlingScore = Math.min((wicketsPerMatch / 2) * 100, 100); // 2 wickets = 100 score
      score += bowlingScore * (position.includes('bowler') ? 1.0 : 0.5);
    }

    if (position.includes('wicket-keeper')) {
      // Keeping performance
      const dismissalsPerMatch = (stats.catches + stats.stumpings) / matches;
      const keepingScore = Math.min((dismissalsPerMatch / 1.5) * 100, 100);
      score += keepingScore * 0.5;
    }

    // Fielding contribution
    const catchesPerMatch = stats.catches / matches;
    const fieldingScore = Math.min((catchesPerMatch / 0.5) * 100, 100);
    score += fieldingScore * 0.2;

    // Normalize
    return Math.min(score, 100);
  }

  /**
   * Calculate consistency score
   */
  calculateConsistencyScore(player) {
    const stats = player.statistics || {};
    const matches = stats.matchesPlayed || 0;

    if (matches < 3) return 50; // Insufficient data

    // Players with more matches and balanced contributions score higher
    let consistency = 50;

    // Bonus for experience
    if (matches >= 10) consistency += 20;
    else if (matches >= 5) consistency += 10;

    // Bonus for balanced all-round contribution
    const hasRuns = (stats.runsScored || 0) > 0;
    const hasWickets = (stats.wicketsTaken || 0) > 0;
    const hasCatches = (stats.catches || 0) > 0;

    if (hasRuns && hasWickets) consistency += 15; // All-rounder
    if (hasCatches) consistency += 5; // Good fielder

    return Math.min(consistency, 100);
  }

  /**
   * Calculate experience score
   */
  calculateExperienceScore(player) {
    const experience = player.playingExperience || 'beginner';
    const experienceMap = {
      'beginner': 30,
      '1-2 years': 50,
      '3-5 years': 70,
      '5-10 years': 85,
      '10+ years': 95
    };
    return experienceMap[experience] || 50;
  }

  /**
   * Calculate position suitability score
   */
  calculatePositionScore(player, matchContext) {
    // In future, this will consider opponent weaknesses, venue, etc.
    // For now, return base score for position clarity
    const position = player.position || player.preferredPosition || '';
    
    // Clear position definition scores higher
    if (position && position !== 'fielder') {
      return 80;
    }
    return 60;
  }

  /**
   * Calculate age factor (peak performance curve)
   */
  calculateAgeFactor(player) {
    const age = player.age || 25;
    
    // Cricket peak performance curve
    if (age >= 22 && age <= 32) return 100; // Peak years
    if (age >= 18 && age <= 21) return 85;  // Rising talent
    if (age >= 33 && age <= 36) return 80;  // Experienced
    if (age < 18) return 70;                // Very young
    if (age > 36) return 65;                // Veteran
    
    return 75; // Default
  }

  /**
   * Generate balanced lineup with constraints (11 playing + 3 substitutes)
   * @param {Array} scoredPlayers - Players with scores
   * @param {String} strategy - 'balanced', 'aggressive', 'defensive'
   * @returns {Object} - Lineup with playing XI, substitutes, and balance
   */
  generateLineup(scoredPlayers, strategy = 'balanced') {
    const lineup = [];
    const constraints = this.getStrategyConstraints(strategy);

    // Sort by score
    const sorted = [...scoredPlayers].sort((a, b) => b.total - a.total);

    // Step 1: Ensure wicket-keeper (mandatory)
    const wicketKeepers = sorted.filter(p => 
      this.getPlayerPosition(p).includes('wicket-keeper')
    );
    if (wicketKeepers.length > 0) {
      lineup.push(wicketKeepers[0]);
    }

    // Step 2: Select batsmen
    const batsmen = sorted.filter(p => 
      this.getPlayerPosition(p).includes('batsman') && 
      !lineup.includes(p)
    );
    lineup.push(...batsmen.slice(0, constraints.batsmen));

    // Step 3: Select bowlers
    const bowlers = sorted.filter(p => 
      this.getPlayerPosition(p).includes('bowler') && 
      !lineup.includes(p)
    );
    lineup.push(...bowlers.slice(0, constraints.bowlers));

    // Step 4: Select all-rounders
    const allRounders = sorted.filter(p => 
      this.getPlayerPosition(p).includes('all-rounder') && 
      !lineup.includes(p)
    );
    lineup.push(...allRounders.slice(0, constraints.allRounders));

    // Step 5: Fill remaining slots with best available
    const remaining = 11 - lineup.length;
    if (remaining > 0) {
      const available = sorted.filter(p => !lineup.includes(p));
      lineup.push(...available.slice(0, remaining));
    }

    // Step 6: Select 3 substitutes from remaining players
    // Ensure position diversity for substitutes
    const playingXI = lineup.slice(0, 11);
    const substitutes = this.selectSubstitutes(sorted, playingXI);

    // Calculate team balance (for playing XI)
    const balance = this.calculateTeamBalance(playingXI);

    return {
      playing: playingXI.map(p => ({
        _id: p.player.id,
        fullName: p.player.name,
        position: p.player.position,
        score: p.total,
        scoreBreakdown: p.breakdown
      })),
      substitutes: substitutes.map(p => ({
        _id: p.player.id,
        fullName: p.player.name,
        position: p.player.position,
        score: p.total,
        scoreBreakdown: p.breakdown
      })),
      balance,
      strategy,
      teamScore: this.calculateTeamScore(playingXI),
      confidence: this.calculateConfidence(playingXI, balance)
    };
  }

  /**
   * Select 3 substitutes ensuring position coverage
   * @param {Array} allPlayers - All scored players sorted by score
   * @param {Array} playingXI - Selected playing XI
   * @returns {Array} - 3 substitute players
   */
  selectSubstitutes(allPlayers, playingXI) {
    const substitutes = [];
    const playingIDs = new Set(playingXI.map(p => p.player.id.toString()));
    
    // Available players not in playing XI
    const available = allPlayers.filter(p => 
      !playingIDs.has(p.player.id.toString())
    );

    if (available.length === 0) return [];

    // Analyze playing XI positions
    const playingPositions = playingXI.map(p => this.getPlayerPosition(p));
    const hasExtraWK = playingPositions.filter(pos => pos.includes('wicket-keeper')).length > 1;
    const hasExtraBatsman = playingPositions.filter(pos => pos.includes('batsman')).length > 5;

    // Priority 1: Extra batsman if not enough in playing XI
    if (!hasExtraBatsman) {
      const batsman = available.find(p => this.getPlayerPosition(p).includes('batsman'));
      if (batsman) {
        substitutes.push(batsman);
        available.splice(available.indexOf(batsman), 1);
      }
    }

    // Priority 2: Extra bowler
    if (substitutes.length < 3) {
      const bowler = available.find(p => this.getPlayerPosition(p).includes('bowler'));
      if (bowler) {
        substitutes.push(bowler);
        available.splice(available.indexOf(bowler), 1);
      }
    }

    // Priority 3: All-rounder or best available
    if (substitutes.length < 3) {
      const allRounder = available.find(p => this.getPlayerPosition(p).includes('all-rounder'));
      if (allRounder) {
        substitutes.push(allRounder);
        available.splice(available.indexOf(allRounder), 1);
      }
    }

    // Fill remaining with next best players
    while (substitutes.length < 3 && available.length > 0) {
      substitutes.push(available.shift());
    }

    return substitutes;
  }

  /**
   * Get strategy-specific constraints
   */
  getStrategyConstraints(strategy) {
    const strategies = {
      'balanced': {
        batsmen: 5,
        bowlers: 4,
        allRounders: 2,
        description: 'Well-rounded team with equal focus on batting and bowling'
      },
      'aggressive': {
        batsmen: 6,
        bowlers: 3,
        allRounders: 2,
        description: 'Batting-heavy lineup for high-scoring games'
      },
      'defensive': {
        batsmen: 4,
        bowlers: 5,
        allRounders: 2,
        description: 'Bowling-focused team to restrict opposition'
      }
    };
    return strategies[strategy] || strategies.balanced;
  }

  /**
   * Calculate team balance
   */
  calculateTeamBalance(lineup) {
    const balance = {
      wicketKeepers: 0,
      batsmen: 0,
      bowlers: 0,
      allRounders: 0
    };

    lineup.forEach(player => {
      const position = this.getPlayerPosition(player);
      if (position.includes('wicket-keeper')) balance.wicketKeepers++;
      if (position.includes('batsman')) balance.batsmen++;
      if (position.includes('bowler')) balance.bowlers++;
      if (position.includes('all-rounder')) balance.allRounders++;
    });

    return balance;
  }

  /**
   * Calculate overall team score
   */
  calculateTeamScore(lineup) {
    if (lineup.length === 0) return 0;
    const avgScore = lineup.reduce((sum, p) => sum + p.total, 0) / lineup.length;
    return Math.round(avgScore * 100) / 100;
  }

  /**
   * Calculate confidence percentage
   */
  calculateConfidence(lineup, balance) {
    let confidence = 50;

    // Bonus for having exactly 11 players
    if (lineup.length === 11) confidence += 20;

    // Bonus for balanced team
    if (balance.wicketKeepers >= 1) confidence += 10;
    if (balance.batsmen >= 4 && balance.batsmen <= 6) confidence += 10;
    if (balance.bowlers >= 3 && balance.bowlers <= 5) confidence += 10;

    return Math.min(confidence, 100);
  }

  /**
   * Helper to get player position
   */
  getPlayerPosition(playerOrScore) {
    if (playerOrScore.player) {
      return (playerOrScore.player.position || '').toLowerCase();
    }
    return (playerOrScore.position || playerOrScore.preferredPosition || '').toLowerCase();
  }

  /**
   * Generate multiple lineup suggestions (ML-Enhanced)
   * @param {Array} players - Available players
   * @param {Object} matchContext - Match context
   * @param {Boolean} useML - Whether to use ML predictions
   * @returns {Array} - Array of 3 lineup suggestions
   */
  async generateSuggestions(players, matchContext = {}, useML = true) {
    let mlScores = null;
    let mlStatus = 'disabled';
    
    // Try to get ML predictions if enabled
    if (useML && this.useML) {
      try {
        console.log('🤖 Attempting to use ML predictions...');
        mlScores = await mlService.getMLPlayerScores(players);
        mlStatus = 'active';
        console.log(`✅ ML predictions loaded for ${mlScores.size} players`);
      } catch (error) {
        console.warn('⚠️ ML prediction failed, falling back to rule-based:', error.message);
        mlStatus = 'fallback';
      }
    }

    // Score all players (with or without ML)
    const scoredPlayers = players.map(player => 
      this.calculatePlayerScore(player, matchContext, mlScores)
    );

    // Generate 3 different strategies
    const suggestions = [
      this.generateLineup(scoredPlayers, 'balanced'),
      this.generateLineup(scoredPlayers, 'aggressive'),
      this.generateLineup(scoredPlayers, 'defensive')
    ];

    // Sort by team score
    suggestions.sort((a, b) => b.teamScore - a.teamScore);

    // Add ML status to each suggestion
    suggestions.forEach(suggestion => {
      suggestion.mlStatus = mlStatus;
      suggestion.mlEnhanced = mlStatus === 'active';
    });

    return suggestions;
  }

  /**
   * Get explanation for why a player was selected
   */
  getSelectionReasoning(player, scoreBreakdown) {
    const reasons = [];
    
    if (scoreBreakdown.performance > 75) {
      reasons.push('Excellent recent performance');
    } else if (scoreBreakdown.performance > 60) {
      reasons.push('Good performance record');
    }

    if (scoreBreakdown.experience > 80) {
      reasons.push('Highly experienced');
    }

    if (scoreBreakdown.consistency > 70) {
      reasons.push('Consistent contributor');
    }

    if (scoreBreakdown.age > 95) {
      reasons.push('Peak performance age');
    }

    if (reasons.length === 0) {
      reasons.push('Well-rounded player');
    }

    return reasons.join(' • ');
  }
}

export default new LineupOptimizerService();
