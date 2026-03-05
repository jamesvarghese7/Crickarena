/**
 * Test Script for Real-time Analytics System
 * Run this to verify all components are working
 */

import matchAnalytics from './services/matchAnalytics.js';

console.log('🧪 Testing Real-time Analytics System\n');

// Test 1: Win Probability Calculator
console.log('Test 1: Win Probability Calculator');
console.log('=====================================');

const matchState1 = {
  target: 180,
  currentScore: 150,
  wicketsLost: 5,
  ballsRemaining: 18,
  requiredRunRate: 10.0,
  currentRunRate: 8.5,
  recentForm: 8.0
};

const winProb1 = matchAnalytics.calculateWinProbability(matchState1);
console.log('Scenario: Chasing 180, currently 150/5 in 17 overs');
console.log(`Result: Batting ${winProb1.batting}%, Bowling ${winProb1.bowling}%`);
console.log('Expected: Close match, ~45-55%');
console.log(winProb1.batting >= 40 && winProb1.batting <= 60 ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 2: Momentum Calculator
console.log('Test 2: Momentum Calculator');
console.log('============================');

const recentOvers = [
  { totalRuns: 12, totalWickets: 0 },
  { totalRuns: 8, totalWickets: 1 },
  { totalRuns: 15, totalWickets: 0 },
  { totalRuns: 10, totalWickets: 0 }
];

const momentum = matchAnalytics.calculateMomentum(recentOvers);
console.log('Scenario: Last 4 overs - 12, 8, 15, 10 runs with 1 wicket');
console.log(`Result: Momentum ${momentum.value}, Trend: ${momentum.trend}`);
console.log('Expected: Positive momentum');
console.log(momentum.trend === 'positive' ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 3: Score Prediction
console.log('Test 3: Score Prediction');
console.log('========================');

const currentInnings = {
  runs: 120,
  wickets: 3,
  balls: 90 // 15 overs
};

const prediction = matchAnalytics.predictFinalScore(currentInnings, 20);
console.log('Scenario: 120/3 in 15 overs');
console.log(`Result: Predicted ${prediction.predicted} (Range: ${prediction.range.min}-${prediction.range.max})`);
console.log('Expected: ~180-200');
console.log(prediction.predicted >= 170 && prediction.predicted <= 210 ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 4: Insights Generator
console.log('Test 4: Insights Generator');
console.log('==========================');

const match = {
  oversLimit: 20
};

const innings = {
  runs: 85,
  wickets: 6,
  balls: 60, // 10 overs
  battingCard: [
    { playerName: 'Player 1', runs: 45, balls: 30, dismissal: { how: 'caught' } },
    { playerName: 'Player 2', runs: 25, balls: 20, dismissal: null },
    { playerName: 'Player 3', runs: 15, balls: 10, dismissal: null }
  ]
};

const insights = matchAnalytics.generateInsights(match, innings);
console.log('Scenario: 85/6 in 10 overs');
console.log(`Result: ${insights.length} insights generated`);
insights.forEach(insight => {
  console.log(`  - [${insight.type}] ${insight.message}`);
});
console.log('Expected: Critical insights about wickets');
console.log(insights.length > 0 ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 5: Scoring Heatmap
console.log('Test 5: Scoring Heatmap');
console.log('=======================');

const battingCard = [
  { playerName: 'Player 1', runs: 45, balls: 30, fours: 5, sixes: 2 },
  { playerName: 'Player 2', runs: 30, balls: 25, fours: 3, sixes: 1 }
];

const heatmap = matchAnalytics.generateScoringHeatmap(battingCard);
console.log('Scenario: Two batsmen with boundaries');
console.log(`Result: ${heatmap.boundaries} boundaries, ${heatmap.boundaryPercentage}% boundary rate`);
console.log('Expected: 11 boundaries (5+2+3+1)');
console.log(heatmap.boundaries === 11 ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 6: Edge Cases
console.log('Test 6: Edge Cases');
console.log('==================');

// Test with no data
const emptyMomentum = matchAnalytics.calculateMomentum([]);
console.log('Empty overs array:', emptyMomentum.value === 0 ? '✅ PASS' : '❌ FAIL');

// Test with winning position
const winningState = {
  target: 150,
  currentScore: 151,
  wicketsLost: 3,
  ballsRemaining: 30,
  requiredRunRate: 0,
  currentRunRate: 8.0,
  recentForm: 8.0
};

const winningProb = matchAnalytics.calculateWinProbability(winningState);
console.log('Already won scenario:', winningProb.batting === 100 ? '✅ PASS' : '❌ FAIL');

// Test with no balls remaining
const noBallsInnings = {
  runs: 180,
  wickets: 8,
  balls: 120 // 20 overs
};

const noBallsPrediction = matchAnalytics.predictFinalScore(noBallsInnings, 20);
console.log('No balls remaining:', noBallsPrediction.predicted === 180 ? '✅ PASS' : '❌ FAIL');

console.log('');

// Summary
console.log('=================================');
console.log('🎉 All Tests Completed!');
console.log('=================================');
console.log('');
console.log('Next Steps:');
console.log('1. Start the backend server: npm run dev');
console.log('2. Start the frontend: cd frontend && npm run dev');
console.log('3. Navigate to a live match analytics page');
console.log('4. Verify WebSocket connection in browser console');
console.log('');
console.log('For more information, see:');
console.log('- QUICK_START_GUIDE.md');
console.log('- SEMINAR_DOCUMENTATION.md');
console.log('- ANALYTICS_README.md');
