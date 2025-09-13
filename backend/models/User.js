// backend/models/User.js
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['login', 'assessment', 'workout', 'meditation', 'nutrition', 'goal', 'other'],
    required: true
  },
  category: String,
  description: String,
  points: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const FitnessActivitySchema = new mongoose.Schema({
  workoutType: { type: String, enum: ['cardio', 'strength', 'sports', 'general'], default: 'general' },
  points: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const FitnessStatsSchema = new mongoose.Schema({
  totalWorkouts: { type: Number, default: 0 },
  thisWeekWorkouts: { type: Number, default: 0 },
  fitnessStreak: { type: Number, default: 0 },
  totalFitnessXP: { type: Number, default: 0 },
  avgWorkoutsPerWeek: { type: Number, default: 0 },
  fitnessScore: { type: Number, default: 0 },
  lastWorkout: Date
}, { _id: false });

const BaselineSchema = new mongoose.Schema({
  scores: {
    physical: { type: Number, min: 0, max: 100 },
    mental: { type: Number, min: 0, max: 100 },
    nutrition: { type: Number, min: 0, max: 100 },
    lifeSkills: { type: Number, min: 0, max: 100 },
    overall: { type: Number, min: 0, max: 100 }
  },
  responses: [{
    question: String,
    category: String,
    value: Number,
    answer: String
  }],
  completedAt: Date,
  version: { type: String, default: '1.0' }
}, { _id: false });

const ClassSchema = new mongoose.Schema({
  id: String,
  code: String,
  name: String,
  subject: String,
  yearLevel: String,
  students: [String],
  createdAt: Date,
  active: { type: Boolean, default: true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,

  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'school_admin', 'counselor'],
    default: 'student'
  },

  // NEW: education fields
  educationLevel: { type: String, enum: ['school', 'university'], default: 'school' },
  school: { type: String, default: 'Knox Grammar School' },
  yearLevel: { type: String, enum: ['7', '8', '9', '10', '11', '12', ''] },
  university: {
    name: String,
    degree: String,
    year: String // e.g. '1', '2', '3', 'Honours', 'Postgrad'
  },

  lastLogin: Date,

  performanceBaseline: BaselineSchema,

  enrolledClasses: [String],
  classes: [ClassSchema],

  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },

  // General activity feed
  activities: [ActivitySchema],

  // NEW: fitness-specific tracking
  fitness: {
    activities: [FitnessActivitySchema],
    stats: FitnessStatsSchema
  }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      return ret;
    }
  }
});

/* --------- Helpers --------- */

function startOfThisWeek() {
  const d = new Date();
  d.setHours(0,0,0,0);
  // set to Sunday start; change to Monday by adjusting (d.getDay() || 7)
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function calcStreak(activities) {
  if (!activities?.length) return 0;
  const days = new Set(
    activities.map(a => {
      const t = new Date(a.timestamp);
      t.setHours(0,0,0,0);
      return t.getTime();
    })
  );
  let streak = 0;
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < 60; i++) {
    const day = new Date(today.getTime() - i*86400000).getTime();
    if (days.has(day)) streak++;
    else if (streak > 0) break;
  }
  return streak;
}

function avgPerWeek(activities) {
  if (!activities?.length) return 0;
  const oldest = new Date(activities[activities.length - 1].timestamp);
  const weeks = Math.max(1, (Date.now() - oldest.getTime()) / (7*86400000));
  return Math.round((activities.length / weeks) * 10) / 10;
}

// Compute composite score as per your frontend logic
function computeFitnessScore(thisWeek, streak, avgWk) {
  const weeklyScore = Math.min(40, (thisWeek / 4) * 40);
  const streakScore = Math.min(35, streak * 2.5);
  const consistency = Math.min(25, (avgWk / 4) * 25);
  return Math.round(weeklyScore + streakScore + consistency);
}

/* --------- Instance methods --------- */

// Keep your existing method (typo fixed to calculateOverallPerformanceScore)
UserSchema.methods.calculateOverallPerformanceScore = function () {
  const s = this.performanceBaseline?.scores;
  if (!s) return 0;
  const haveAll = ['physical', 'mental', 'nutrition', 'lifeSkills'].every(k => s[k] !== undefined);
  return haveAll ? Math.round((s.physical + s.mental + s.nutrition + s.lifeSkills) / 4) : 0;
};

UserSchema.methods.addActivity = function(type, category, description, points = 0) {
  this.activities.push({ type, category, description, points, timestamp: new Date() });
  if (this.activities.length > 200) this.activities = this.activities.slice(-200);
  return this.save();
};

// NEW: Add a fitness workout and refresh cached stats
UserSchema.methods.addWorkout = async function(workoutType = 'general', points = 0, minutes = 0) {
  if (!this.fitness) this.fitness = {};
  if (!Array.isArray(this.fitness.activities)) this.fitness.activities = [];
  this.fitness.activities.unshift({ workoutType, points, minutes, timestamp: new Date() });
  if (this.fitness.activities.length > 500) {
    this.fitness.activities = this.fitness.activities.slice(0, 500);
  }
  await this.recalcFitnessStats();
  return this.save();
};

// Recompute leaderboard-friendly stats
UserSchema.methods.recalcFitnessStats = function() {
  const acts = this.fitness?.activities || [];
  const weekStart = startOfThisWeek();
  const thisWeek = acts.filter(a => new Date(a.timestamp) >= weekStart).length;
  const streak = calcStreak(acts);
  const totalXP = acts.reduce((sum, a) => sum + (a.points || 0), 0);
  const avgWk = avgPerWeek(acts);
  const score = computeFitnessScore(thisWeek, streak, avgWk);

  this.fitness.stats = {
    totalWorkouts: acts.length,
    thisWeekWorkouts: thisWeek,
    fitnessStreak: streak,
    totalFitnessXP: totalXP,
    avgWorkoutsPerWeek: avgWk,
    fitnessScore: score,
    lastWorkout: acts[0]?.timestamp
  };
};

/* --------- Indexes --------- */
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
