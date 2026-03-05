/**
 * Real-time Match Analytics Service
 * Provides win probability, player performance predictions, and live analytics
 */

class MatchAnalyticsService {
  /**
   * Calculate win probability based on current match state
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
      recentForm
    } = matchState;

    // Base probability from runs needed
    const runsNeeded = target - currentScore;
    const runsFactor = runsNeeded / (ballsRemaining || 1);
    
    // Wickets factor (more wickets lost = lower probability)
    const wicketsFactor = (10 - wicketsLost) / 10;
    
    // Run rate comparison
    const rrDiff = requiredRunRate - currentRunRate;
    const rrFactor = 1 / (1 + Math.exp(rrDiff * 0.5)); // Sigmoid function
    
    // Balls remaining factor
    const ballsFactor = Math.min(ballsRemaining / 60, 1); // Normalize to 10 overs
    
    // Recent form (last 6 overs run rate)
    const formFactor = recentForm ? Math.min(recentForm / 10, 1) : 0.5;
    
    // Weighted combination
    let probability = (
      runsFactor * 0.25 +
      wicketsFactor * 0.25 +
      rrFactor * 0.30 +
      ballsFactor * 0.10 +
      formFactor * 0.10
    );
    
    // Normalize to 0-100
    probability = Math.max(0, Math.min(100, probability * 100));
    
    // If chasing team ahead, invert
    if (runsNeeded <= 0) {
      return { batting: 100, bowling: 0 };
    }
    
    return {
      batting: Math.round(probability),
      bowling: Math.round(100 - probability)
    };
  }

  /**
   * Calculate momentum based on recent overs
   */
  calculateMomentum(recentOvers) {
    if (!recentOvers || recentOvers.length === 0) {
      return { value: 0, trend: 'neutral' };
    }

    const weights = [0.4, 0.3, 0.2, 0.1]; // Recent overs weighted more
    let momentum = 0;

    recentOvers.slice(-4).forEach((over, idx) => {
      const weight = weights[idx] || 0.1;
      const overScore = over.totalRuns || 0;
      const wickets = over.totalWickets || 0;
      
      // High scoring overs increase momentum, wickets decrease it
      momentum += (overScore * weight) - (wickets * 5 * weight);
    });

    const trend = momentum > 5 ? 'positive' : momentum < -5 ? 'negative' : 'neutral';
    
    return {
      value: Math.round(momentum * 10) / 10,
      trend
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
   * Generate match insights and key statistics
   */
  generateInsights(match, currentInnings) {
    const insights = [];
    
    if (!currentInnings) return insights;

    const runs = currentInnings.runs || 0;
    const wickets = currentInnings.wickets || 0;
    const balls = currentInnings.balls || 0;
    const overs = Math.floor(balls / 6) + (balls % 6) / 10;

    // Run rate insights
    const currentRR = balls > 0 ? (runs / balls * 6).toFixed(2) : 0;
    if (currentRR > 10) {
      insights.push({
        type: 'positive',
        message: `Excellent run rate of ${currentRR} - batting team dominating`
      });
    } else if (currentRR < 6) {
      insights.push({
        type: 'negative',
        message: `Low run rate of ${currentRR} - batting team under pressure`
      });
    }

    // Wickets insights
    if (wickets >= 5 && overs < 10) {
      insights.push({
        type: 'critical',
        message: `${wickets} wickets down early - batting collapse`
      });
    }

    // Partnership insights
    const battingCard = currentInnings.battingCard || [];
    const notOut = battingCard.filter(b => !b.dismissal?.how);
    if (notOut.length >= 2) {
      const partnership = notOut.reduce((sum, b) => sum + (b.runs || 0), 0);
      if (partnership > 50) {
        insights.push({
          type: 'positive',
          message: `Strong partnership of ${partnership} runs building`
        });
      }
    }

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
   * Predict final score based on current state
   */
  predictFinalScore(currentInnings, oversLimit) {
    const runs = currentInnings.runs || 0;
    const balls = currentInnings.balls || 0;
    const wickets = currentInnings.wickets || 0;
    
    if (balls === 0) return { predicted: 0, range: { min: 0, max: 0 } };

    const currentRR = (runs / balls) * 6;
    const ballsRemaining = (oversLimit * 6) - balls;
    const wicketsRemaining = 10 - wickets;

    // Adjust run rate based on wickets in hand
    const wicketFactor = wicketsRemaining / 10;
    const projectedRR = currentRR * (0.7 + (wicketFactor * 0.3));

    const additionalRuns = (ballsRemaining / 6) * projectedRR;
    const predicted = Math.round(runs + additionalRuns);

    return {
      predicted,
      range: {
        min: Math.round(predicted * 0.85),
        max: Math.round(predicted * 1.15)
      }
    };
  }
}

export default new MatchAnalyticsService();
