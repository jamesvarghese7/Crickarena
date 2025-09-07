import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  decisionAt: { type: Date },
  reason: { type: String, default: '' }
}, { _id: true });

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  rules: { type: String, default: '' },
  district: { type: String, default: '' },
  location: { type: String, default: '' },
  venues: [{ type: String }],
  bannerUrl: { type: String, default: '' },
  format: { type: String, enum: ['league', 'knockout', 'league+playoff', 'round-robin'], default: 'league' },
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
  registrations: [registrationSchema]
}, { timestamps: true });

export default mongoose.model('Tournament', tournamentSchema);