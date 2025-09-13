// models/Workout.js
const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  category: { type: String, default: 'physical' },      // keep compatible with your frontend
  workoutType: { type: String, enum: ['cardio','strength','sports','general','pushups'] },
  durationMin: Number,                                   // optional
  reps: Number,                                          // e.g., push-ups
  points: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

// helpful compound index for leaderboard queries
WorkoutSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Workout', WorkoutSchema);
