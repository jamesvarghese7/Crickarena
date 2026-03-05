import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './models/Match.js';

dotenv.config();

async function testMatchData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all matches
    const matches = await Match.find().sort({ createdAt: -1 }).limit(5);
    
    console.log('\n📊 Recent Matches:');
    console.log('==================');
    
    for (const match of matches) {
      console.log(`\nMatch ID: ${match._id}`);
      console.log(`Status: ${match.status}`);
      console.log(`Innings count: ${match.innings?.length || 0}`);
      
      if (match.innings && match.innings.length > 0) {
        match.innings.forEach((innings, idx) => {
          console.log(`\nInnings ${idx + 1}:`);
          console.log(`  - Runs: ${innings.runs || 0}`);
          console.log(`  - Wickets: ${innings.wickets || 0}`);
          console.log(`  - Balls: ${innings.balls || 0}`);
          console.log(`  - Overs: ${innings.oversString || 'N/A'}`);
          console.log(`  - Batting card entries: ${innings.battingCard?.length || 0}`);
          console.log(`  - Bowling card entries: ${innings.bowlingCard?.length || 0}`);
          console.log(`  - Overs data: ${innings.overs?.length || 0} overs`);
        });
      } else {
        console.log('  ⚠️ No innings data');
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMatchData();
