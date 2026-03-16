/**
 * Real-time Match Analytics Service (Enhanced)
 * Provides win probability, player performance predictions, and live analytics
 * Phase 1 Enhancements: Context-aware insights, pressure index, phase detection
 */

class MatchAnalyticsService {
  /**
   * Match phases for different formats
   */
  PHASES = {
    T20: { powerplay: 6, middle: 16, death: 20 },
    ODI: { powerplay: 10, middle: 40, death: 50 },
    T10: { powerplay: 3, middle: 8, death: 10 }
  };

  /**
   * Phase-specific benchmarks for run rates
   */
  BENCHMARKS = {
    T20: {
      powerplay: { excellent: 9, good: 7, poor: 5 },
      middle: { excellent: 10, good: 8, poor: 6 },
      death: { excellent: 12, good: 10, poor: 8 }
    },
    ODI: {
      powerplay: { excellent: 7, good: 5.5, poor: 4 },
      middle: { excellent: 7, good: 5.5, poor: 4.5 },
      death: { excellent: 9, good: 7, poor: 5 }
    },
    T10: {
      powerplay: { excellent: 11, good: 9, poor: 7 },
      middle: { excellent: 13, good: 11, poor: 9 },
      death: { excellent: 15, good: 12, poor: 10 }
    }
  };

  /**
   * Detect current match phase
   */
  getMatchPhase(overs, format = 'T20') {
    const phases = this.PHASES[format] || this.PHASES.T20;
    
    if (overs <= phases.powerplay) return 'powerplay';
    if (overs <= phases.middle) return 'middle';
    return 'death';
  }

  /**
   * Get phase-specific benchmarks
   */
  getPhaseBenchmarks(phase, format = 'T20') {
    const benchmarks = this.BENCHMARKS[format] || this.BENCHMARKS.T20;
    return benchmarks[phase] || benchmarks.middle;
  }

  /**
   * Calculate pressure index (0-100)
   * Higher = more pressure on batting team
   */
  calculatePressureIndex(matchState) {
    const {
      requiredRunRate,
      currentRunRate,
      wicketsLost,
      ballsRemaining,
      overs
    } = matchState;

    // RRR acceleration needed
    const rrDiff = requiredRunRate - currentRunRate;
    const rrPressure = Math.max(0, Math.min(40, rrDiff * 8)); // 0-40 points

    // Wickets pressure
    const wicketsPressure = (wicketsLost / 10) * 30; // 0-30 points

    // Time pressure (less overs = more pressure)
    const timePressure = Math.max(0, 30 - (ballsRemaining / 6)); // 0-30 points

    const totalPressure = rrPressure + wicketsPressure + timePressure;
    return Math.min(100, Math.round(totalPressure));
  }
  /**
   * Calculate win probability based on current match state (Enhanced)
   * Uses logistic regression-like approach with cricket-specific factors
   */
  calculateWinProbability(matchState) {
    const {
      target,
      currentScore,
      wicketsLost,
      ballsRemaining,
      requiredRunRate,
      currentRunRate,
      recentForm,
      format = 'T20'
    } = matchState;

    const clamp01 = (value) => Math.max(0, Math.min(1, value));

    const runsNeeded = Math.max(0, (target || 0) - (currentScore || 0));
    const safeBallsRemaining = Math.max(0, ballsRemaining || 0);

    if (runsNeeded <= 0) {
      return { batting: 100, bowling: 0 };
    }

    if (safeBallsRemaining <= 0) {
      return { batting: 0, bowling: 100 };
    }

    const safeCurrentRR = Math.max(0, currentRunRate || 0);
    const safeRequiredRR = Math.max(0, requiredRunRate || ((runsNeeded / safeBallsRemaining) * 6));
    const wicketsRemaining = Math.max(0, 10 - (wicketsLost || 0));
    const oversRemaining = safeBallsRemaining / 6;

    // Ease factor: if current scoring pace can cover required runs, this increases.
    const projectedAtCurrentPace = (safeCurrentRR * oversRemaining);
    const chaseEaseFactor = clamp01(projectedAtCurrentPace / Math.max(1, runsNeeded));

    // RR gap factor: positive gap hurts chasing side, negative gap helps.
    const rrGap = safeRequiredRR - safeCurrentRR;
    const rrGapFactor = 1 / (1 + Math.exp(rrGap * 0.9));

    // Wickets factor: punish tail-end chases heavily.
    let wicketsFactor = Math.pow(wicketsRemaining / 10, 0.8);
    if (wicketsRemaining <= 3) wicketsFactor *= 0.75;

    // Time factor: more balls left increases batting chance.
    const maxBallsForFormat = ((this.PHASES[format]?.death || 20) * 6);
    const ballsFactor = clamp01(safeBallsRemaining / Math.max(1, maxBallsForFormat));

    // Recent form relative to required RR.
    const formRatio = recentForm ? (recentForm / Math.max(1, safeRequiredRR)) : 1;
    const formFactor = clamp01(formRatio / 1.4);

    // Pressure reduces conversion confidence but does not dominate the model.
    const pressureIndex = this.calculatePressureIndex({
      requiredRunRate: safeRequiredRR,
      currentRunRate: safeCurrentRR,
      wicketsLost: wicketsLost || 0,
      ballsRemaining: safeBallsRemaining,
      overs: matchState.overs || 0
    });
    const pressurePenalty = 1 - ((pressureIndex / 100) * 0.20); // up to 20% dampening

    const probability01 = clamp01((
      chaseEaseFactor * 0.30 +
      rrGapFactor * 0.25 +
      wicketsFactor * 0.25 +
      ballsFactor * 0.10 +
      formFactor * 0.10
    ) * pressurePenalty);

    const batting = Math.round(probability01 * 100);

    return {
      batting,
      bowling: 100 - batting
    };
  }

  /**
   * Calculate momentum based on recent overs (Enhanced)
   */
  calculateMomentum(recentOvers, phase = 'middle') {
    if (!recentOvers || recentOvers.length === 0) {
      return { value: 0, trend: 'neutral', description: 'Match just started' };
    }

    const weights = [0.4, 0.3, 0.2, 0.1]; // Recent overs weighted more
    let momentum = 0;

    recentOvers.slice(-4).forEach((over, idx) => {
      const weight = weights[idx] || 0.1;
      const overScore = over.totalRuns || 0;
      const wickets = over.totalWickets || 0;
      
      // Phase-aware scoring (death overs boundaries more valuable)
      const scoreMultiplier = phase === 'death' ? 1.2 : 1.0;
      
      // High scoring overs increase momentum, wickets decrease it
      momentum += (overScore * weight * scoreMultiplier) - (wickets * 5 * weight);
    });

    // Calculate trend with more granularity
    let trend, description;
    if (momentum > 8) {
      trend = 'surging';
      description = 'Strong batting momentum';
    } else if (momentum > 5) {
      trend = 'positive';
      description = 'Building well';
    } else if (momentum > -3) {
      trend = 'neutral';
      description = 'Even contest';
    } else if (momentum > -8) {
      trend = 'negative';
      description = 'Under pressure';
    } else {
      trend = 'struggling';
      description = 'Bowlers dominating';
    }
    
    return {
      value: Math.round(momentum * 10) / 10,
      trend,
      description
    };
  }

  /**
   * Predict player performance based on historical data
   */
  predictPlayerPerformance(player, matchContext) {
    const { recentScores, average, strikeRate, venue, opposition } = player;
    
    // Simple prediction model
    const baseScore = average || 25;
    const formFactor = recentScores ? 
      recentScores.slice(-5).reduce((a, b) => a + b, 0) / (recentScores.length || 1) / baseScore : 1;
    
    const predicted = Math.round(baseScore * formFactor);
    
    return {
      predictedRuns: predicted,
      confidence: Math.min(formFactor * 70, 95),
      range: {
        min: Math.max(0, predicted - 15),
        max: predicted + 25
      }
    };
  }

  /**
   * Generate match insights and key statistics (Enhanced)
   */
  generateInsights(match, currentInnings) {
    const insights = [];
    
    if (!currentInnings) return insights;

    const runs = currentInnings.runs || 0;
    const wickets = currentInnings.wickets || 0;
    const balls = currentInnings.balls || 0;
    const totalOvers = Math.floor(balls / 6);
    const overs = totalOvers + ((balls % 6) / 10);
    const format = match.matchFormat || 'T20';
    const oversLimit = match.oversLimit || 20;
    
    // Detect match phase
    const phase = this.getMatchPhase(overs, format);
    const benchmarks = this.getPhaseBenchmarks(phase, format);

    // Run rate insights (phase-aware)
    const currentRR = balls > 0 ? parseFloat((runs / balls * 6).toFixed(2)) : 0;
    
    if (currentRR >= benchmarks.excellent) {
      insights.push({
        type: 'positive',
        priority: 'high',
        message: `Outstanding ${phase} run rate of ${currentRR} - batting team dominating`,
        icon: '🔥'
      });
    } else if (currentRR >= benchmarks.good) {
      insights.push({
        type: 'positive',
        priority: 'medium',
        message: `Good scoring rate in ${phase} phase (${currentRR})`,
        icon: '✅'
      });
    } else if (currentRR <= benchmarks.poor) {
      insights.push({
        type: 'negative',
        priority: 'high',
        message: `Run rate of ${currentRR} below par for ${phase} phase`,
        icon: '⚠️'
      });
    }

    // Wickets insights (context-aware)
    const wicketsRemaining = 10 - wickets;
    
    if (wickets >= 7) {
      insights.push({
        type: 'critical',
        priority: 'urgent',
        message: `Only ${wicketsRemaining} wickets remaining - tail exposed`,
        icon: '🚨'
      });
    } else if (wickets >= 5 && overs < oversLimit / 2) {
      insights.push({
        type: 'critical',
        priority: 'high',
        message: `${wickets} wickets down early - batting collapse in progress`,
        icon: '📉'
      });
    } else if (wickets <= 2 && overs > oversLimit / 2) {
      insights.push({
        type: 'positive',
        priority: 'medium',
        message: `Solid platform with ${wicketsRemaining} wickets in hand`,
        icon: '💪'
      });
    }

    // Partnership insights (enhanced)
    const battingCard = currentInnings.battingCard || [];
    const notOut = battingCard.filter(b => !b.dismissal?.how);
    
    if (notOut.length >= 2) {
      const partnership = notOut.reduce((sum, b) => sum + (b.runs || 0), 0);
      const partnershipBalls = notOut.reduce((sum, b) => sum + (b.balls || 0), 0);
      const partnershipRR = partnershipBalls > 0 ? (partnership / partnershipBalls * 6).toFixed(1) : 0;
      
      if (partnership >= 100) {
        insights.push({
          type: 'milestone',
          priority: 'high',
          message: `Century partnership! ${partnership} runs at ${partnershipRR} per over`,
          icon: '🎯'
        });
      } else if (partnership >= 50) {
        insights.push({
          type: 'positive',
          priority: 'medium',
          message: `Strong partnership of ${partnership} runs - scoring at ${partnershipRR}/over`,
          icon: '🤝'
        });
      } else if (phase === 'death' && partnership >= 30 && partnershipRR > 10) {
        insights.push({
          type: 'positive',
          priority: 'medium',
          message: `Explosive death overs partnership - ${partnership} at ${partnershipRR}/over`,
          icon: '💥'
        });
      }
    }

    // Phase-specific insights
    if (phase === 'powerplay') {
      const expectedRuns = overs * benchmarks.good;
      if (runs < expectedRuns * 0.8) {
        insights.push({
          type: 'warning',
          priority: 'medium',
          message: `Powerplay struggles - ${runs} runs below expected pace`,
          icon: '⏰'
        });
      }
    }

    if (phase === 'death') {
      const deathOversStarted = Math.max(0, totalOvers - (format === 'T20' ? 16 : 40));
      if (deathOversStarted > 0) {
        const deathBalls = balls - ((format === 'T20' ? 96 : 240));
        const deathRuns = runs; // Simplified - would need tracking
        const deathRR = deathBalls > 0 ? (deathRuns / deathBalls * 6).toFixed(1) : 0;
        
        if (deathRR > benchmarks.excellent) {
          insights.push({
            type: 'positive',
            priority: 'high',
            message: `Excellent death overs execution - ${deathRR} run rate`,
            icon: '🎆'
          });
        }
      }
    }

    // Momentum-based insights
    const recentOvers = currentInnings.overs || [];
    if (recentOvers.length >= 3) {
      const last3Runs = recentOvers.slice(-3).reduce((sum, o) => sum + (o.totalRuns || 0), 0);
      
      if (last3Runs >= 36) {
        insights.push({
          type: 'momentum',
          priority: 'high',
          message: `Momentum shift! ${last3Runs} runs in last 3 overs`,
          icon: '📈'
        });
      } else if (last3Runs <= 12 && wickets >= 1) {
        insights.push({
          type: 'momentum',
          priority: 'medium',
          message: `Pressure building - only ${last3Runs} runs in last 3 overs`,
          icon: '🎯'
        });
      }
    }

    // Milestone watch
    const topScorer = battingCard.reduce((max, b) => 
      (b.runs || 0) > (max.runs || 0) ? b : max, { runs: 0 });
    
    if (topScorer.runs >= 90 && !topScorer.dismissal) {
      insights.push({
        type: 'milestone',
        priority: 'high',
        message: `${topScorer.playerName} on ${topScorer.runs}* - Century watch!`,
        icon: '👀'
      });
    } else if (topScorer.runs >= 45 && topScorer.runs < 50 && !topScorer.dismissal) {
      insights.push({
        type: 'milestone',
        priority: 'medium',
        message: `${topScorer.playerName} approaching fifty on ${topScorer.runs}*`,
        icon: '🎖️'
      });
    }

    // Team score milestone watch
    if (runs >= 180 && runs < 200 && format === 'T20') {
      insights.push({
        type: 'milestone',
        priority: 'medium',
        message: `Chasing 200 - currently ${runs}/${wickets}`,
        icon: '🏆'
      });
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    insights.sort((a, b) => 
      (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
    );

    return insights;
  }

  /**
   * Calculate player heatmap data (scoring zones)
   */
  generateScoringHeatmap(battingCard) {
    const heatmap = {
      boundaries: 0,
      singles: 0,
      dots: 0,
      boundaryPercentage: 0
    };

    battingCard.forEach(batsman => {
      const fours = batsman.fours || 0;
      const sixes = batsman.sixes || 0;
      const runs = batsman.runs || 0;
      const balls = batsman.balls || 0;

      heatmap.boundaries += (fours + sixes);
      const boundaryRuns = (fours * 4) + (sixes * 6);
      heatmap.singles += (runs - boundaryRuns);
      heatmap.dots += Math.max(0, balls - (runs - boundaryRuns) - (fours + sixes));
    });

    const totalBalls = battingCard.reduce((sum, b) => sum + (b.balls || 0), 0);
    heatmap.boundaryPercentage = totalBalls > 0 ? 
      Math.round((heatmap.boundaries / totalBalls) * 100) : 0;

    return heatmap;
  }

  /**
   * Predict final score based on current state (Enhanced)
   */
  predictFinalScore(currentInnings, oversLimit, format = 'T20') {
    const runs = currentInnings.runs || 0;
    const balls = currentInnings.balls || 0;
    const wickets = currentInnings.wickets || 0;
    
    if (balls === 0) return { 
      predicted: 0, 
      range: { min: 0, max: 0 },
      confidence: 0
    };

    const currentRR = (runs / balls) * 6;
    const ballsRemaining = (oversLimit * 6) - balls;
    const wicketsRemaining = 10 - wickets;
    const oversPlayed = balls / 6;
    const oversRemaining = ballsRemaining / 6;
    
    // Detect phase for projection
    const currentPhase = this.getMatchPhase(oversPlayed, format);

    // Wicket factor with non-linear penalty
    let wicketFactor;
    if (wicketsRemaining >= 7) {
      wicketFactor = 1.0; // Full batting depth
    } else if (wicketsRemaining >= 4) {
      wicketFactor = 0.85; // Some depth
    } else if (wicketsRemaining >= 2) {
      wicketFactor = 0.65; // Tail coming in
    } else {
      wicketFactor = 0.40; // Last pair
    }

    // Phase-based run rate projection
    let projectedRR;
    if (currentPhase === 'powerplay') {
      // Expect acceleration in middle/death
      projectedRR = currentRR * 1.15 * wicketFactor;
    } else if (currentPhase === 'middle') {
      // Expect death overs boost
      projectedRR = currentRR * 1.20 * wicketFactor;
    } else {
      // Death overs - current pace likely to continue or slow
      projectedRR = currentRR * 0.95 * wicketFactor;
    }

    // Calculate additional runs
    const additionalRuns = (oversRemaining) * projectedRR;
    const predicted = Math.round(runs + additionalRuns);

    // Confidence based on data available
    let confidence;
    if (oversPlayed <= 5) {
      confidence = 45; // Low - too early
    } else if (oversPlayed <= 10) {
      confidence = 65; // Medium
    } else if (oversPlayed <= 15) {
      confidence = 80; // Good
    } else {
      confidence = 92; // Very high - near end
    }

    // Adjust confidence based on wickets (unstable = lower confidence)
    if (wicketsRemaining <= 3) {
      confidence -= 15;
    }

    // Dynamic range based on confidence
    const rangePercent = confidence > 75 ? 0.10 : 0.15;

    return {
      predicted,
      range: {
        min: Math.round(predicted * (1 - rangePercent)),
        max: Math.round(predicted * (1 + rangePercent))
      },
      confidence: Math.max(30, confidence),
      projectedRunRate: projectedRR.toFixed(1)
    };
  }

  /**
   * Predict partnership momentum and sustainability
   */
  predictPartnershipMomentum(notOutBatsmen, recentOvers) {
    if (notOutBatsmen.length < 2) {
      return { sustainable: false, message: 'New batsman at crease' };
    }

    const partnership = notOutBatsmen.reduce((sum, b) => sum + (b.runs || 0), 0);
    const partnershipBalls = notOutBatsmen.reduce((sum, b) => sum + (b.balls || 0), 0);
    const partnershipRR = partnershipBalls > 0 ? (partnership / partnershipBalls * 6) : 0;

    // Check if partnership is building
    let sustainable, message, momentum;

    if (partnershipRR > 10 && partnership > 30) {
      sustainable = true;
      momentum = 'explosive';
      message = `Explosive partnership - ${partnership} at ${partnershipRR.toFixed(1)}/over`;
    } else if (partnershipRR > 7 && partnership > 20) {
      sustainable = true;
      momentum = 'strong';
      message = `Solid partnership building - steady scoring`;
    } else if (partnershipBalls > 30 && partnershipRR < 5) {
      sustainable = false;
      momentum = 'struggling';
      message = `Partnership struggling - pressure mounting`;
    } else {
      sustainable = true;
      momentum = 'developing';
      message = `Partnership in early stages`;
    }

    return {
      sustainable,
      momentum,
      message,
      runs: partnership,
      runRate: partnershipRR.toFixed(1),
      balls: partnershipBalls
    };
  }
}

export default new MatchAnalyticsService();
