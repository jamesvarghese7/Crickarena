#!/usr/bin/env node

/**
 * Initial ML Model Training Script
 * Run this once to train the ML model with existing player data
 */

import 'dotenv/config';
import { connectDB } from './config/db.js';
import Player from './models/Player.js';
import mlService from './services/pythonMLService.js';

async function trainInitialModel() {
  console.log('🚀 Starting initial ML model training...\n');
  
  try {
    // Connect to database
    console.log('📊 Connecting to database...');
    await connectDB(process.env.MONGO_URI);
    console.log('✅ Database connected\n');
    
    // Fetch all active players with statistics
    console.log('📥 Fetching player data...');
    const players = await Player.find({ 
      isActive: true,
      'statistics.matchesPlayed': { $gt: 0 } // Only players with match history
    })
    .select('fullName age preferredPosition battingStyle bowlingStyle jerseyNumber statistics playingExperience')
    .limit(1000);
    
    console.log(`✅ Found ${players.length} players with statistics\n`);
    
    if (players.length < 10) {
      console.error('❌ Insufficient data for training.');
      console.error('   Need at least 10 players with match statistics.');
      console.error('   Run generatePlayerStats.js first to populate player statistics.');
      process.exit(1);
    }
    
    // Format players for ML service
    console.log('🔧 Formatting player data...');
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
    
    // Show sample data
    console.log('\n📋 Sample Player Data:');
    console.log('   Name:', formattedPlayers[0].fullName);
    console.log('   Position:', formattedPlayers[0].position);
    console.log('   Matches:', formattedPlayers[0].statistics.matchesPlayed);
    console.log('   Runs:', formattedPlayers[0].statistics.runsScored);
    console.log('   Wickets:', formattedPlayers[0].statistics.wicketsTaken);
    console.log();
    
    // Train the model
    console.log('🤖 Training ML model...');
    console.log('   This may take a few seconds...\n');
    
    const metrics = await mlService.trainModel(formattedPlayers);
    
    // Display results
    console.log('\n✅ ML Model Training Complete!\n');
    console.log('📊 Training Metrics:');
    console.log('   Performance Model R² Score:', metrics.performance_model_score.toFixed(3));
    console.log('   Consistency Model R² Score:', metrics.consistency_model_score.toFixed(3));
    console.log('   Training Samples:', metrics.n_samples);
    console.log('   Features Used:', metrics.n_features);
    console.log('   Model Type:', metrics.model_type);
    
    if (metrics.top_features && metrics.top_features.length > 0) {
      console.log('\n🎯 Top 5 Most Important Features:');
      metrics.top_features.slice(0, 5).forEach(([feature, importance], idx) => {
        console.log(`   ${idx + 1}. ${feature}: ${(importance * 100).toFixed(2)}%`);
      });
    }
    
    console.log('\n🎉 Success! ML model is now ready for lineup suggestions.');
    console.log('   Coaches can now use AI-powered lineup recommendations.\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Training Failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Ensure Python is installed: python --version');
    console.error('   2. Install dependencies: cd backend/ml && pip install -r requirements.txt');
    console.error('   3. Check player statistics: Run generatePlayerStats.js first');
    console.error('   4. Verify database connection in .env file\n');
    process.exit(1);
  }
}

// Run the training
trainInitialModel();
