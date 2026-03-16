// Check player distribution across clubs
// Shows statistics about team composition, experience levels, and more

import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Club from '../models/Club.js';
import Player from '../models/Player.js';
import mongoose from 'mongoose';

async function checkPlayerDistribution() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all clubs and players
    const clubs = await Club.find({ status: 'approved' }).lean();
    const allPlayers = await Player.find({ currentClub: { $exists: true } }).populate('currentClub').lean();
    
    console.log('📊 OVERALL STATISTICS');
    console.log('='.repeat(70));
    console.log(`Total Clubs: ${clubs.length}`);
    console.log(`Total Players: ${allPlayers.length}`);
    console.log(`Average Players per Club: ${(allPlayers.length / clubs.length).toFixed(1)}`);
    console.log('='.repeat(70) + '\n');
    
    // Position distribution (overall)
    const positionStats = allPlayers.reduce((acc, p) => {
      acc[p.preferredPosition] = (acc[p.preferredPosition] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🏏 OVERALL POSITION DISTRIBUTION');
    console.log('='.repeat(70));
    Object.entries(positionStats).forEach(([position, count]) => {
      const percentage = ((count / allPlayers.length) * 100).toFixed(1);
      console.log(`${position.padEnd(20)} : ${count.toString().padStart(4)} (${percentage}%)`);
    });
    console.log('='.repeat(70) + '\n');
    
    // Experience distribution (overall)
    const experienceStats = allPlayers.reduce((acc, p) => {
      acc[p.playingExperience] = (acc[p.playingExperience] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 OVERALL EXPERIENCE DISTRIBUTION');
    console.log('='.repeat(70));
    Object.entries(experienceStats).forEach(([exp, count]) => {
      const percentage = ((count / allPlayers.length) * 100).toFixed(1);
      console.log(`${exp.padEnd(20)} : ${count.toString().padStart(4)} (${percentage}%)`);
    });
    console.log('='.repeat(70) + '\n');
    
    // Age distribution
    const ageGroups = {
      '18-22': 0,
      '23-27': 0,
      '28-32': 0,
      '33-35': 0
    };
    
    allPlayers.forEach(p => {
      if (p.age <= 22) ageGroups['18-22']++;
      else if (p.age <= 27) ageGroups['23-27']++;
      else if (p.age <= 32) ageGroups['28-32']++;
      else ageGroups['33-35']++;
    });
    
    console.log('👥 AGE DISTRIBUTION');
    console.log('='.repeat(70));
    Object.entries(ageGroups).forEach(([range, count]) => {
      const percentage = ((count / allPlayers.length) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(percentage / 2));
      console.log(`${range.padEnd(10)} : ${count.toString().padStart(4)} (${percentage.toString().padStart(5)}%) ${bar}`);
    });
    console.log('='.repeat(70) + '\n');
    
    // Statistics summary
    const totalMatches = allPlayers.reduce((sum, p) => sum + (p.statistics?.matchesPlayed || 0), 0);
    const totalRuns = allPlayers.reduce((sum, p) => sum + (p.statistics?.runsScored || 0), 0);
    const totalWickets = allPlayers.reduce((sum, p) => sum + (p.statistics?.wicketsTaken || 0), 0);
    const totalCatches = allPlayers.reduce((sum, p) => sum + (p.statistics?.catches || 0), 0);
    const totalStumpings = allPlayers.reduce((sum, p) => sum + (p.statistics?.stumpings || 0), 0);
    
    const playersWithStats = allPlayers.filter(p => p.statistics?.matchesPlayed > 0).length;
    
    if (playersWithStats > 0) {
      console.log('📊 CAREER STATISTICS SUMMARY');
      console.log('='.repeat(70));
      console.log(`Players with stats: ${playersWithStats} / ${allPlayers.length}`);
      console.log(`Total Matches:      ${totalMatches.toLocaleString()}`);
      console.log(`Total Runs:         ${totalRuns.toLocaleString()}`);
      console.log(`Total Wickets:      ${totalWickets.toLocaleString()}`);
      console.log(`Total Catches:      ${totalCatches.toLocaleString()}`);
      console.log(`Total Stumpings:    ${totalStumpings.toLocaleString()}`);
      console.log(`\nAverages per player:`);
      console.log(`  Matches:  ${Math.floor(totalMatches / playersWithStats)}`);
      console.log(`  Runs:     ${Math.floor(totalRuns / playersWithStats).toLocaleString()}`);
      console.log(`  Wickets:  ${Math.floor(totalWickets / playersWithStats)}`);
      console.log(`  Catches:  ${Math.floor(totalCatches / playersWithStats)}`);
      console.log('='.repeat(70) + '\n');
    }
    
    // Detailed club-wise breakdown
    console.log('🏏 CLUB-WISE BREAKDOWN');
    console.log('='.repeat(70));
    
    for (const club of clubs) {
      const clubPlayers = allPlayers.filter(p => 
        p.currentClub && p.currentClub._id.toString() === club._id.toString()
      );
      
      if (clubPlayers.length === 0) {
        console.log(`\n❌ ${club.clubName || club.name} (${club.district})`);
        console.log(`   No players assigned yet`);
        continue;
      }
      
      console.log(`\n✅ ${club.clubName || club.name} (${club.district})`);
      console.log(`   Total Players: ${clubPlayers.length}`);
      
      // Position breakdown
      const clubPositions = clubPlayers.reduce((acc, p) => {
        acc[p.preferredPosition] = (acc[p.preferredPosition] || 0) + 1;
        return acc;
      }, {});
      
      console.log(`   Composition:`);
      Object.entries(clubPositions).forEach(([pos, count]) => {
        console.log(`      ${pos.padEnd(18)}: ${count}`);
      });
      
      // Age range
      const ages = clubPlayers.map(p => p.age).sort((a, b) => a - b);
      const avgAge = (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1);
      console.log(`   Age range: ${ages[0]} - ${ages[ages.length - 1]} (avg: ${avgAge})`);
      
      // Experience breakdown
      const clubExp = clubPlayers.reduce((acc, p) => {
        acc[p.playingExperience] = (acc[p.playingExperience] || 0) + 1;
        return acc;
      }, {});
      
      console.log(`   Experience:`);
      Object.entries(clubExp).forEach(([exp, count]) => {
        console.log(`      ${exp.padEnd(18)}: ${count}`);
      });
      
      // Club statistics (if available)
      const clubStats = {
        matches: clubPlayers.reduce((sum, p) => sum + (p.statistics?.matchesPlayed || 0), 0),
        runs: clubPlayers.reduce((sum, p) => sum + (p.statistics?.runsScored || 0), 0),
        wickets: clubPlayers.reduce((sum, p) => sum + (p.statistics?.wicketsTaken || 0), 0),
        catches: clubPlayers.reduce((sum, p) => sum + (p.statistics?.catches || 0), 0),
        stumpings: clubPlayers.reduce((sum, p) => sum + (p.statistics?.stumpings || 0), 0)
      };
      
      if (clubStats.matches > 0) {
        console.log(`   Career Stats (Total):`);
        console.log(`      Matches:  ${clubStats.matches.toLocaleString()}`);
        console.log(`      Runs:     ${clubStats.runs.toLocaleString()}`);
        console.log(`      Wickets:  ${clubStats.wickets.toLocaleString()}`);
        console.log(`      Catches:  ${clubStats.catches.toLocaleString()}`);
        if (clubStats.stumpings > 0) {
          console.log(`      Stumpings: ${clubStats.stumpings.toLocaleString()}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Distribution check completed!');
    console.log('='.repeat(70) + '\n');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error checking distribution:', error);
    process.exit(1);
  }
}

checkPlayerDistribution();
