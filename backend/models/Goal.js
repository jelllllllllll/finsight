// backend/models/Goal.js
import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },   // ✅ start from 0
  deadline: { type: Date },
  status: { type: String, default: 'In Progress' } // ✅ start as In Progress
});

export default mongoose.model('Goal', goalSchema);
