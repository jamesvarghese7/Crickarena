import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  homeClub: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  awayClub: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  date: Date,
  time: String,
  venue: String,
  result: {
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
    summary: String
  }
}, { timestamps: true });

export default mongoose.model('Match', matchSchema);