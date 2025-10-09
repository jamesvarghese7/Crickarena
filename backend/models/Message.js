import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
  senderModel: { type: String, enum: ['Player', 'Coach'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
  senderModel: { type: String, enum: ['Player', 'Coach'], required: true },
  recipients: [{
    recipient: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipients.recipientModel', required: true },
    recipientModel: { type: String, enum: ['Player', 'Coach'], required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date }
  }],
  subject: { type: String, required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['general', 'training', 'performance', 'match', 'announcement'],
    default: 'general'
  },
  timestamp: { type: Date, default: Date.now },
  replies: [replySchema],
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for better query performance
messageSchema.index({ sender: 1, senderModel: 1 });
messageSchema.index({ 'recipients.recipient': 1, 'recipients.recipientModel': 1 });
messageSchema.index({ timestamp: -1 });
messageSchema.index({ type: 1 });

export default mongoose.model('Message', messageSchema);