import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  decisionAt: { type: Date },
  reason: { type: String, default: '' },
  // Payment tracking for entry fees
  paymentStatus: { type: String, enum: ['pending', 'paid', 'not_required'], default: 'not_required' },
  paymentAmount: { type: Number, default: 0 }
}, { _id: true });

// Enhanced standings schema with detailed NRR tracking
const standingSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  group: { type: String, default: '' },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  drawn: { type: Number, default: 0 },
  noResult: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  nrr: { type: Number, default: 0 },
  // NRR calculation components for accurate recalculation
  runsScored: { type: Number, default: 0 },
  runsConceded: { type: Number, default: 0 },
  oversFaced: { type: Number, default: 0 },    // Stored as decimal (e.g., 19.3 = 19.5)
  oversBowled: { type: Number, default: 0 },   // Stored as decimal
  // Bonus points (if enabled)
  bonusPoints: { type: Number, default: 0 }
}, { _id: false });

// Qualification rules configuration
const qualificationRulesSchema = new mongoose.Schema({
  pointsPerWin: { type: Number, default: 2 },
  pointsPerTie: { type: Number, default: 1 },
  pointsPerNoResult: { type: Number, default: 1 },
  pointsPerLoss: { type: Number, default: 0 },
  bonusPointEnabled: { type: Boolean, default: false },
  bonusPointThreshold: { type: Number, default: 0 } // E.g., win by 100+ runs or 8+ wickets
}, { _id: false });

// Powerplay overs configuration
const powerplaySchema = new mongoose.Schema({
  mandatory: {
    start: { type: Number, default: 1 },
    end: { type: Number, default: 6 }
  },
  middle: {
    start: { type: Number, default: 7 },
    end: { type: Number, default: 15 }
  },
  death: {
    start: { type: Number, default: 16 },
    end: { type: Number, default: 20 }
  }
}, { _id: false });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }]
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  rules: { type: String, default: '' },
  district: { type: String, default: '' },
  location: { type: String, default: '' },
  venues: [{ type: String }],
  // Optional enhanced venue configuration with per-venue slot times
  venueSlots: [{
    name: { type: String, required: true },
    slotTimes: [{ type: String }]
  }],
  // Global match time slots (e.g., ['09:00', '14:00', '18:00'])
  matchTimeSlots: [{ type: String }],
  // Allow parallel matches only when necessary
  allowParallelMatches: { type: Boolean, default: false },
  // Maximum parallel matches at same time (default 1 = no parallel)
  maxParallelMatches: { type: Number, default: 1, min: 1 },
  bannerUrl: { type: String, default: '' },
  format: { type: String, enum: ['league', 'knockout', 'league+playoff', 'round-robin', 'groups+knockouts', 'super-league', 'groups+super8'], default: 'league' },
  matchFormat: { type: String, enum: ['T20', 'T10', 'ODI', 'Test', 'Custom'], default: 'T20' },
  oversLimit: { type: Number, default: 20, min: 1, max: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  // Legacy date field for backward compatibility
  date: { type: Date },
  status: { type: String, enum: ['open', 'upcoming', 'ongoing', 'completed', 'cancelled'], default: 'open' },
  maxTeams: { type: Number, default: 16 },
  registrationDeadline: { type: Date },
  entryFee: { type: Number, default: 0 },
  prizePool: { type: Number, default: 0 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }], // legacy simple list
  registrations: [registrationSchema],
  fixturesGenerated: { type: Boolean, default: false },
  // Lock registration after fixture generation; remains locked even if fixtures are deleted
  registrationLocked: { type: Boolean, default: false },
  // Standings and grouping (for league/round-robin/league+playoff)
  groups: [groupSchema],
  standings: [standingSchema],
  // Scheduling constraints and preferences
  restDaysMin: { type: Number, default: 1 },
  doubleRoundRobin: { type: Boolean, default: false },
  numGroups: { type: Number, default: 2, min: 2, max: 8 },
  qualifyPerGroup: { type: Number, default: 2, min: 1, max: 4 },
  teamBlackouts: { type: Map, of: [String], default: undefined }, // clubId -> [YYYY-MM-DD]
  venueBlackouts: { type: Map, of: [String], default: undefined }, // venueName -> [YYYY-MM-DD]
  reserveDays: [{ type: Date }],

  // === Cricket-Specific Rules ===
  // Qualification rules for points calculation
  qualificationRules: qualificationRulesSchema,

  // Tie-breaker hierarchy (ICC standard: points -> nrr -> head-to-head -> wins -> lot)
  tieBreakers: [{
    type: String,
    enum: ['points', 'nrr', 'head-to-head', 'wins', 'most-boundaries', 'bowler-strike-rate', 'lot'],
    default: ['points', 'nrr', 'head-to-head', 'wins', 'lot']
  }],

  // Powerplay overs configuration
  powerplayConfig: powerplaySchema,

  // DLS (Duckworth-Lewis-Stern) for rain-affected matches
  dlsEnabled: { type: Boolean, default: true },

  // Super Over for tied matches
  superOverEnabled: { type: Boolean, default: true },

  // Match rules
  matchRules: {
    maxOversPerBowler: { type: Number }, // Calculated from overs limit if not set
    freeHitOnNoBall: { type: Boolean, default: true },
    wideRunsPenalty: { type: Number, default: 1 },
    noBallRunsPenalty: { type: Number, default: 1 },
    powerPlayFieldingRestriction: { type: Number, default: 2 } // Max fielders outside 30-yard circle
  },

  // Playoff configuration for super-league format
  playoffConfig: {
    topTeamsQualify: { type: Number, default: 4 },
    hasQualifier1: { type: Boolean, default: true },
    hasEliminator: { type: Boolean, default: true },
    hasQualifier2: { type: Boolean, default: true }
  },

  // Super 8/Super 6 configuration
  superRoundConfig: {
    teamsQualifyPerGroup: { type: Number, default: 2 },
    carryForwardPoints: { type: Boolean, default: true },
    superGroupCount: { type: Number, default: 2 }
  }
}, { timestamps: true });

export default mongoose.model('Tournament', tournamentSchema);