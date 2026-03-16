// Generate realistic cricket statistics for players
// Stats are based on:
// - Player's preferred position (batsman, bowler, all-rounder, wicket-keeper)
// - Playing experience level
// - Age and career length
// - Realistic cricket ratios and averages

import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Player from '../models/Player.js';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment. Aborting.');
  process.exit(1);
}

// Experience to matches played mapping
const experienceToMatches = {
  'beginner': { min: 10, max: 30 },
  '1-2 years': { min: 30, max: 80 },
  '3-5 years': { min: 80, max: 150 },
  '5-10 years': { min: 150, max: 300 },
  '10+ years': { min: 300, max: 500 }
};

// Position-based stat multipliers
const positionStats = {
  'batsman': {
    runsPerMatch: { min: 25, max: 45 },      // Specialist batsmen score well
    wicketsPerMatch: { min: 0.02, max: 0.1 }, // Rarely bowl
    catchesPerMatch: { min: 0.15, max: 0.35 }, // Moderate fielding
    stumpingsPerMatch: { min: 0, max: 0 }      // Never keep wickets
  },
  'bowler': {
    runsPerMatch: { min: 6, max: 15 },        // Lower-order batsmen
    wicketsPerMatch: { min: 1.2, max: 2.8 },  // Primary wicket-takers
    catchesPerMatch: { min: 0.2, max: 0.45 }, // Good fielders
    stumpingsPerMatch: { min: 0, max: 0 }      // Never keep wickets
  },
  'all-rounder': {
    runsPerMatch: { min: 18, max: 35 },       // Good batsmen
    wicketsPerMatch: { min: 0.4, max: 1.2 },  // Decent bowlers
    catchesPerMatch: { min: 0.3, max: 0.6 },  // Excellent fielders
    stumpingsPerMatch: { min: 0, max: 0 }      // Never keep wickets
  },
  'wicket-keeper': {
    runsPerMatch: { min: 12, max: 28 },       // Middle-order batsmen
    wicketsPerMatch: { min: 0, max: 0.03 },   // Rarely bowl
    catchesPerMatch: { min: 1.0, max: 2.5 },  // Specialist catchers
    stumpingsPerMatch: { min: 0.08, max: 0.35 } // Specialist stumpings
  },
  'fielder': {
    runsPerMatch: { min: 10, max: 25 },
    wicketsPerMatch: { min: 0, max: 0.5 },
    catchesPerMatch: { min: 0.25, max: 0.5 },
    stumpingsPerMatch: { min: 0, max: 0 }
  }
};

// Generate random number in range
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random float in range
function randomFloatInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Calculate realistic statistics for a player
function calculatePlayerStats(player) {
  const { preferredPosition, playingExperience, age } = player;
  
  // Get matches played based on experience
  const matchRange = experienceToMatches[playingExperience];
  if (!matchRange) {
    console.warn(`Unknown experience level: ${playingExperience}`);
    return null;
  }
  
  const matchesPlayed = randomInRange(matchRange.min, matchRange.max);
  
  // Adjust for age (older players might have played more)
  const ageBonus = age > 30 ? 1.1 : age > 25 ? 1.05 : 1.0;
  const adjustedMatches = Math.floor(matchesPlayed * ageBonus);
  
  // Get position-based stat ranges
  const posStats = positionStats[preferredPosition];
  if (!posStats) {
    console.warn(`Unknown position: ${preferredPosition}`);
    return null;
  }
  
  // Calculate runs scored
  const runsPerMatch = randomFloatInRange(posStats.runsPerMatch.min, posStats.runsPerMatch.max);
  const runsScored = Math.floor(adjustedMatches * runsPerMatch);
  
  // Calculate wickets taken
  const wicketsPerMatch = randomFloatInRange(posStats.wicketsPerMatch.min, posStats.wicketsPerMatch.max);
  const wicketsTaken = Math.floor(adjustedMatches * wicketsPerMatch);
  
  // Calculate catches
  const catchesPerMatch = randomFloatInRange(posStats.catchesPerMatch.min, posStats.catchesPerMatch.max);
  const catches = Math.floor(adjustedMatches * catchesPerMatch);
  
  // Calculate stumpings (only for wicket-keepers)
  const stumpingsPerMatch = randomFloatInRange(posStats.stumpingsPerMatch.min, posStats.stumpingsPerMatch.max);
  const stumpings = Math.floor(adjustedMatches * stumpingsPerMatch);
  
  return {
    matchesPlayed: adjustedMatches,
    runsScored,
    wicketsTaken,
    catches,
    stumpings
  };
}

// Main function to generate stats for all players
async function generatePlayerStats() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Fetch all active players
    const players = await Player.find({ isActive: true });
    
    if (players.length === 0) {
      console.log('❌ No players found! Please run seedPlayers.js first.');
      process.exit(1);
    }
    
    console.log(`📋 Found ${players.length} players\n`);
    console.log('📊 Generating realistic statistics...\n');
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Position-wise counters for summary
    const positionStats = {
      batsman: { count: 0, totalRuns: 0, totalWickets: 0 },
      bowler: { count: 0, totalRuns: 0, totalWickets: 0 },
      'all-rounder': { count: 0, totalRuns: 0, totalWickets: 0 },
      'wicket-keeper': { count: 0, totalRuns: 0, totalWickets: 0 },
      fielder: { count: 0, totalRuns: 0, totalWickets: 0 }
    };
    
    for (const player of players) {
      try {
        // Calculate stats
        const stats = calculatePlayerStats(player);
        
        if (!stats) {
          console.log(`  ⚠️  Skipped ${player.fullName} - invalid data`);
          skippedCount++;
          continue;
        }
        
        // Update player statistics
        player.statistics = stats;
        await player.save();
        
        // Track position-wise stats
        if (positionStats[player.preferredPosition]) {
          positionStats[player.preferredPosition].count++;
          positionStats[player.preferredPosition].totalRuns += stats.runsScored;
          positionStats[player.preferredPosition].totalWickets += stats.wicketsTaken;
        }
        
        updatedCount++;
        
        // Show progress every 50 players
        if (updatedCount % 50 === 0) {
          console.log(`  📈 Updated ${updatedCount} players...`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error updating ${player.fullName}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Stats generation completed!');
    console.log('='.repeat(70));
    console.log(`📊 Total players updated: ${updatedCount}`);
    console.log(`⚠️  Players skipped: ${skippedCount}`);
    console.log('='.repeat(70) + '\n');
    
    // Show position-wise summary
    console.log('📈 POSITION-WISE STATISTICS SUMMARY');
    console.log('='.repeat(70));
    
    for (const [position, data] of Object.entries(positionStats)) {
      if (data.count > 0) {
        const avgRuns = Math.floor(data.totalRuns / data.count);
        const avgWickets = Math.floor(data.totalWickets / data.count);
        
        console.log(`\n${position.toUpperCase().padEnd(20)}`);
        console.log(`  Players: ${data.count}`);
        console.log(`  Avg Runs: ${avgRuns.toLocaleString()}`);
        console.log(`  Avg Wickets: ${avgWickets}`);
        console.log(`  Total Runs: ${data.totalRuns.toLocaleString()}`);
        console.log(`  Total Wickets: ${data.totalWickets.toLocaleString()}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    
    // Show some sample players
    console.log('\n📋 SAMPLE PLAYER STATISTICS');
    console.log('='.repeat(70));
    
    const samplePlayers = players.slice(0, 5);
    for (const player of samplePlayers) {
      console.log(`\n👤 ${player.fullName} (${player.preferredPosition})`);
      console.log(`   Experience: ${player.playingExperience}, Age: ${player.age}`);
      console.log(`   Matches: ${player.statistics.matchesPlayed}`);
      console.log(`   Runs: ${player.statistics.runsScored}`);
      console.log(`   Wickets: ${player.statistics.wicketsTaken}`);
      console.log(`   Catches: ${player.statistics.catches}`);
      if (player.preferredPosition === 'wicket-keeper') {
        console.log(`   Stumpings: ${player.statistics.stumpings}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('💡 TIP: Run checkPlayerDistribution.js to see full statistics');
    console.log('='.repeat(70) + '\n');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error generating stats:', error);
    process.exit(1);
  }
}

// Run the stats generation
generatePlayerStats();
