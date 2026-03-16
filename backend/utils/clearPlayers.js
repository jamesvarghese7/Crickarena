// Clear all players from the system
// WARNING: This will delete all player data and their Firebase accounts
// Use with caution - primarily for testing and development

import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { firebaseAdmin } from '../config/firebaseAdmin.js';
import User from '../models/User.js';
import Player from '../models/Player.js';
import mongoose from 'mongoose';
import readline from 'readline';

// Create readline interface for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function clearPlayers() {
  try {
    console.log('⚠️  PLAYER DATA CLEANUP UTILITY');
    console.log('='.repeat(70));
    console.log('This will DELETE:');
    console.log('  - All player profiles from MongoDB');
    console.log('  - All player user accounts from MongoDB');
    console.log('  - All player Firebase authentication accounts');
    console.log('='.repeat(70) + '\n');
    
    const answer = await askQuestion('Are you ABSOLUTELY sure? Type "DELETE ALL PLAYERS" to confirm: ');
    
    if (answer !== 'DELETE ALL PLAYERS') {
      console.log('\n❌ Deletion cancelled. No changes made.');
      rl.close();
      process.exit(0);
    }
    
    console.log('\n🔗 Connecting to MongoDB...');
    await connectDB(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all players
    const players = await Player.find({}).populate('user');
    console.log(`📊 Found ${players.length} players to delete\n`);
    
    if (players.length === 0) {
      console.log('✅ No players to delete. Database is already clean.');
      rl.close();
      mongoose.connection.close();
      process.exit(0);
    }
    
    let deletedCount = 0;
    let firebaseDeletedCount = 0;
    let userDeletedCount = 0;
    
    console.log('🗑️  Starting deletion process...\n');
    
    for (const player of players) {
      try {
        // Delete from Firebase
        if (player.userUid) {
          try {
            await firebaseAdmin.auth().deleteUser(player.userUid);
            firebaseDeletedCount++;
            console.log(`  ✅ Deleted Firebase account: ${player.email || player.userUid}`);
          } catch (fbError) {
            if (fbError.code === 'auth/user-not-found') {
              console.log(`  ⚠️  Firebase account not found: ${player.email || player.userUid}`);
            } else {
              console.log(`  ❌ Error deleting Firebase account: ${player.email || player.userUid} - ${fbError.message}`);
            }
          }
        }
        
        // Delete User from MongoDB
        if (player.user) {
          await User.findByIdAndDelete(player.user._id);
          userDeletedCount++;
        }
        
        // Delete Player from MongoDB
        await Player.findByIdAndDelete(player._id);
        deletedCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.log(`  ❌ Error deleting player ${player.fullName}: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Cleanup completed!');
    console.log(`📊 Statistics:`);
    console.log(`   Players deleted: ${deletedCount}`);
    console.log(`   Users deleted: ${userDeletedCount}`);
    console.log(`   Firebase accounts deleted: ${firebaseDeletedCount}`);
    console.log('='.repeat(70) + '\n');
    
    // Also remove players from clubs
    console.log('🧹 Clearing player references from clubs...');
    const Club = (await import('../models/Club.js')).default;
    const updateResult = await Club.updateMany(
      {},
      { $set: { players: [] } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} clubs\n`);
    
    rl.close();
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    rl.close();
    process.exit(1);
  }
}

clearPlayers();
