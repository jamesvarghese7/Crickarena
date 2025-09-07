import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: { type: String },
  district: { type: String },
  role: { type: String, enum: ['admin', 'clubManager', 'public'], default: 'public' },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);