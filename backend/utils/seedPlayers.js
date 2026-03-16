// Seed players and assign them to clubs logically
// Distribution strategy:
// - Location-based (players join clubs in their district)
// - Balanced team composition (batsmen, bowlers, all-rounders, wicket-keepers)
// - Mix of experience levels
// - Realistic team sizes (15-20 players per club)

import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { firebaseAdmin } from '../config/firebaseAdmin.js';
import User from '../models/User.js';
import Club from '../models/Club.js';
import Player from '../models/Player.js';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment. Aborting.');
  process.exit(1);
}

// Indian first names and last names for realistic player names
const firstNames = [
  'Aditya', 'Rahul', 'Virat', 'Rohit', 'Suresh', 'Karthik', 'Ajay', 'Vijay', 'Sanjay', 'Rajesh',
  'Arjun', 'Krishna', 'Mahesh', 'Naveen', 'Sachin', 'Ashwin', 'Deepak', 'Harish', 'Kishore', 'Manoj',
  'Nikhil', 'Praveen', 'Ramesh', 'Sunil', 'Varun', 'Ankit', 'Bharat', 'Chetan', 'Dinesh', 'Gaurav'
];

const lastNames = [
  'Kumar', 'Sharma', 'Patel', 'Nair', 'Menon', 'Pillai', 'Krishnan', 'Iyer', 'Reddy', 'Rao',
  'Singh', 'Verma', 'Gupta', 'Joshi', 'Desai', 'Shah', 'Kapoor', 'Malhotra', 'Chopra', 'Bhat',
  'Hegde', 'Shetty', 'Kamath', 'Warrier', 'Panicker', 'Kurup', 'Thampi', 'Varghese', 'Thomas', 'Joseph'
];

// Kerala districts with cities
const keralaLocations = [
  { district: 'Thiruvananthapuram', city: 'Thiruvananthapuram' },
  { district: 'Kollam', city: 'Kollam' },
  { district: 'Kottayam', city: 'Kottayam' },
  { district: 'Ernakulam', city: 'Kochi' },
  { district: 'Thrissur', city: 'Thrissur' },
  { district: 'Palakkad', city: 'Palakkad' },
  { district: 'Kozhikode', city: 'Kozhikode' },
  { district: 'Kannur', city: 'Kannur' }
];

const positions = ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'];
const battingStyles = ['right-handed', 'left-handed'];
const bowlingStyles = [
  'right-arm-fast', 'left-arm-fast', 'right-arm-medium', 'left-arm-medium',
  'right-arm-spin', 'left-arm-spin', 'wicket-keeper', 'none'
];
const experiences = ['beginner', '1-2 years', '3-5 years', '5-10 years', '10+ years'];

// Generate random date of birth (ages 18-35)
function generateDOB() {
  const today = new Date();
  const age = 18 + Math.floor(Math.random() * 18); // 18-35 years
  const dob = new Date(today.getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  return dob;
}

// Generate random phone number
function generatePhone() {
  const prefixes = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86', '85', '84', '83', '82', '81', '80', '79', '78', '77', '76', '75', '74', '73', '72', '71', '70'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const rest = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `+91${prefix}${rest}`;
}

// Generate random Kerala pincode
function generatePincode(district) {
  // Kerala pincodes generally start with 6, 67, 68, or 69
  const baseCode = 670000 + Math.floor(Math.random() * 30000);
  return baseCode.toString();
}

// Get logical bowling style based on position
function getBowlingStyle(position, battingStyle) {
  if (position === 'wicket-keeper' || position === 'batsman') {
    // Batsmen/WKs are usually not primary bowlers
    return Math.random() > 0.7 ? bowlingStyles[Math.floor(Math.random() * 6)] : 'none';
  } else if (position === 'bowler') {
    // Bowlers shouldn't have 'none' or 'wicket-keeper'
    return bowlingStyles[Math.floor(Math.random() * 6)];
  } else { // all-rounder
    // All-rounders have diverse bowling options
    return bowlingStyles[Math.floor(Math.random() * 6)];
  }
}

// Get logical experience based on age
function getExperience(age) {
  if (age <= 20) return experiences[Math.floor(Math.random() * 2)]; // beginner or 1-2 years
  if (age <= 25) return experiences[1 + Math.floor(Math.random() * 2)]; // 1-2 or 3-5 years
  if (age <= 30) return experiences[2 + Math.floor(Math.random() * 2)]; // 3-5 or 5-10 years
  return experiences[3 + Math.floor(Math.random() * 2)]; // 5-10 or 10+ years
}

// Create a player with Firebase auth
async function createPlayer(playerData, index) {
  const auth = firebaseAdmin.auth();
  const email = `player${String(index).padStart(3, '0')}@crickarena.local`;
  const password = `P1@y3r${String(index).padStart(3, '0')}`;
  
  try {
    // Create Firebase user
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
      // Update if exists
      await auth.updateUser(firebaseUser.uid, {
        password,
        displayName: playerData.fullName,
        emailVerified: true
      });
    } catch (err) {
      if (err && err.code === 'auth/user-not-found') {
        firebaseUser = await auth.createUser({
          email,
          password,
          displayName: playerData.fullName,
          emailVerified: true
        });
      } else {
        throw err;
      }
    }
    
    // Create User in MongoDB
    let user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) {
      user = new User({
        firebaseUid: firebaseUser.uid,
        email,
        name: playerData.fullName,
        role: 'player',
        emailVerified: true
      });
      await user.save();
    }
    
    // Check if player already exists
    let player = await Player.findOne({ user: user._id });
    if (player) {
      console.log(`  ⚠️  Player ${playerData.fullName} already exists, skipping...`);
      return player;
    }
    
    // Create Player profile
    player = new Player({
      user: user._id,
      userUid: firebaseUser.uid,
      fullName: playerData.fullName,
      dateOfBirth: playerData.dateOfBirth,
      age: playerData.age,
      gender: 'male',
      phone: playerData.phone,
      email,
      address: playerData.address,
      battingStyle: playerData.battingStyle,
      bowlingStyle: playerData.bowlingStyle,
      preferredPosition: playerData.preferredPosition,
      jerseyNumber: Math.floor(Math.random() * 100),
      playingExperience: playerData.playingExperience,
      profileCompleted: true,
      isActive: true,
      currentClub: playerData.clubId,
      joinedClubAt: new Date()
    });
    
    await player.save();
    console.log(`  ✅ Created player: ${playerData.fullName} (${playerData.preferredPosition})`);
    return player;
    
  } catch (error) {
    console.error(`  ❌ Error creating player ${playerData.fullName}:`, error.message);
    return null;
  }
}

// Generate balanced team composition
function generateTeamComposition(teamSize) {
  const composition = [];
  
  // Calculate distribution
  const batsmenCount = Math.floor(teamSize * 0.30);
  const bowlersCount = Math.floor(teamSize * 0.30);
  const allRoundersCount = Math.floor(teamSize * 0.25);
  const wicketKeepersCount = teamSize - batsmenCount - bowlersCount - allRoundersCount;
  
  // Add positions
  for (let i = 0; i < batsmenCount; i++) composition.push('batsman');
  for (let i = 0; i < bowlersCount; i++) composition.push('bowler');
  for (let i = 0; i < allRoundersCount; i++) composition.push('all-rounder');
  for (let i = 0; i < wicketKeepersCount; i++) composition.push('wicket-keeper');
  
  // Shuffle for variety
  return composition.sort(() => Math.random() - 0.5);
}

async function seedPlayers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Fetch all approved clubs
    const clubs = await Club.find({ status: 'approved' });
    
    if (clubs.length === 0) {
      console.log('❌ No approved clubs found! Please run seedClubManagers.js first.');
      process.exit(1);
    }
    
    console.log(`📋 Found ${clubs.length} approved clubs\n`);
    
    let totalPlayersCreated = 0;
    let playerIndex = 1;
    
    // For each club, create players
    for (const club of clubs) {
      console.log(`\n🏏 Creating players for: ${club.clubName || club.name}`);
      console.log(`   District: ${club.district}, City: ${club.city || 'N/A'}`);
      
      // Random team size between 15-20 players
      const teamSize = 15 + Math.floor(Math.random() * 6);
      const teamComposition = generateTeamComposition(teamSize);
      
      console.log(`   Team size: ${teamSize} players`);
      console.log(`   Composition: ${teamComposition.filter(p => p === 'batsman').length} batsmen, ${teamComposition.filter(p => p === 'bowler').length} bowlers, ${teamComposition.filter(p => p === 'all-rounder').length} all-rounders, ${teamComposition.filter(p => p === 'wicket-keeper').length} wicket-keepers\n`);
      
      // Create players for this club
      for (let i = 0; i < teamSize; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        
        const dob = generateDOB();
        const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));
        const position = teamComposition[i];
        const battingStyle = battingStyles[Math.floor(Math.random() * battingStyles.length)];
        const bowlingStyle = getBowlingStyle(position, battingStyle);
        const experience = getExperience(age);
        
        const playerData = {
          fullName,
          dateOfBirth: dob,
          age,
          phone: generatePhone(),
          address: {
            street: `${Math.floor(Math.random() * 500) + 1} Main Road`,
            city: club.city || club.district,
            district: club.district,
            state: 'Kerala',
            pincode: generatePincode(club.district)
          },
          battingStyle,
          bowlingStyle,
          preferredPosition: position,
          playingExperience: experience,
          clubId: club._id
        };
        
        const player = await createPlayer(playerData, playerIndex);
        if (player) {
          totalPlayersCreated++;
        }
        playerIndex++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Player seeding completed!`);
    console.log(`📊 Total players created: ${totalPlayersCreated}`);
    console.log(`🏏 Average players per club: ${(totalPlayersCreated / clubs.length).toFixed(1)}`);
    console.log('='.repeat(60) + '\n');
    
    console.log('📝 Sample login credentials:');
    console.log('   Email: player001@crickarena.local');
    console.log('   Password: P1@y3r001');
    console.log('   (Pattern continues: player002@crickarena.local / P1@y3r002, etc.)\n');
    
    console.log('📈 NEXT STEP: Generate realistic player statistics');
    console.log('   Run: node utils/generatePlayerStats.js');
    console.log('   This will add career stats (runs, wickets, catches) to all players\n');
    console.log('   (Pattern continues: player002@crickarena.local / P1@y3r002, etc.)\n');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error seeding players:', error);
    process.exit(1);
  }
}

// Run the seeding
seedPlayers();
