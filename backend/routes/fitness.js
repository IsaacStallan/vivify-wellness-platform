// routes/fitness.js
const express = require('express');
const router = express.Router();
const Workout = require('../models/workout');
const User = require('../models/User');
const { startOfWeek, calcStreak, calcAvgPerWeek, scoreFromMetrics } = require('../lib/fitness');
const mongoose = require('mongoose');

// ---- POST /api/fitness/workouts ----
// body: { userId, workoutType, points?, reps?, durationMin? }
router.post('/workouts', async (req, res) => {
  try {
    const { userId, workoutType='general', points, reps, durationMin } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ error: 'invalid userId' });

    // simple points defaults (mirrors your frontend)
    const defaultPoints = { cardio: 25, strength: 30, sports: 20, pushups: 50, general: 20 };
    const p = (typeof points === 'number') ? points : (defaultPoints[workoutType] ?? 20);

    await Workout.create({
      userId, workoutType, points: p, reps, durationMin, category: 'physical'
    });

    const me = await computeUserMetrics(userId);
    const rank = await computeRank(userId, me.fitnessScore);

    return res.json({ ok: true, metrics: me, rank });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

// ---- GET /api/fitness/leaderboard?limit=50 ----
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);

    // aggregate per user
    const agg = await Workout.aggregate([
      { $match: { category: 'physical' } },
      { $group: {
          _id: '$userId',
          totalWorkouts: { $sum: 1 },
          totalXP: { $sum: '$points' },
          lastWorkout: { $max: '$timestamp' },
          firstWorkout: { $min: '$timestamp' },
          timestamps: { $push: '$timestamp' },
          thisWeek: { $sum: { $cond: [{ $gte: ['$timestamp', startOfWeek()] }, 1, 0] } }
      }},
    ]);

    // compute scores & join user profiles
    const users = await User.find({ _id: { $in: agg.map(a => a._id) } })
      .select('displayName school yearLevel')
      .lean();

    const byId = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    const rows = agg.map(a => {
      const streak = calcStreak(a.timestamps);
      const avgPerWeek = calcAvgPerWeek(a.firstWorkout, a.totalWorkouts);
      const fitnessScore = scoreFromMetrics({ thisWeek: a.thisWeek, streak, avgPerWeek });
      const u = byId[a._id.toString()];
      return {
        userId: a._id,
        profile: {
          name: u?.displayName || 'Student',
          school: u?.school || '—',
          yearLevel: u?.yearLevel || null,
          avatar: (u?.displayName || 'ST').split(' ').map(s=>s[0]).join('').toUpperCase().slice(0,2)
        },
        fitnessMetrics: {
          totalWorkouts: a.totalWorkouts,
          thisWeekWorkouts: a.thisWeek,
          fitnessStreak: streak,
          totalFitnessXP: a.totalXP,
          avgWorkoutsPerWeek: avgPerWeek,
          fitnessScore,
          lastWorkout: a.lastWorkout
        }
      };
    })
    .sort((x,y) => y.fitnessMetrics.fitnessScore - x.fitnessMetrics.fitnessScore)
    .slice(0, limit)
    .map((r, i) => ({ ...r, rank: i+1 }));

    res.json({ leaderboard: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

// ---- GET /api/fitness/me?userId=... ----
router.get('/me', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ error: 'invalid userId' });
    const metrics = await computeUserMetrics(userId);
    const rank = await computeRank(userId, metrics.fitnessScore);
    res.json({ metrics, rank });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

// ---- (Optional) incremental push-up logging ----
router.post('/challenge/pushups', async (req, res) => {
  try {
    const { userId, reps } = req.body;
    if (!userId || !reps) return res.status(400).json({ error: 'userId & reps required' });

    // store as a pushups workout only when day total reaches 50
    // (or directly award points every time if you prefer)
    await Workout.create({
      userId, workoutType: 'pushups', reps, points: Math.min(50, reps), category: 'physical'
    });

    const me = await computeUserMetrics(userId);
    const rank = await computeRank(userId, me.fitnessScore);
    res.json({ ok: true, metrics: me, rank });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

// ----- helpers -----
async function computeUserMetrics(userId) {
  const weekStart = startOfWeek();
  const docs = await Workout.find({ userId }).select('timestamp points').lean();

  const totalWorkouts = docs.length;
  const thisWeekWorkouts = docs.filter(d => d.timestamp >= weekStart).length;
  const fitnessStreak = calcStreak(docs.map(d => d.timestamp));
  const totalFitnessXP = docs.reduce((s,d)=>s+(d.points||0),0);
  const first = docs.length ? docs.map(d=>d.timestamp).reduce((a,b)=>a<b?a:b) : null;
  const avgPerWeek = calcAvgPerWeek(first, totalWorkouts);
  const fitnessScore = scoreFromMetrics({ thisWeek: thisWeekWorkouts, streak: fitnessStreak, avgPerWeek });

  return {
    totalWorkouts, thisWeekWorkouts, fitnessStreak,
    totalFitnessXP, avgWorkoutsPerWeek: avgPerWeek,
    fitnessScore,
    lastWorkout: docs.length ? docs.reduce((a,b)=>a.timestamp>b.timestamp?a:b).timestamp : null
  };
}

async function computeRank(userId, myScore) {
  // estimate rank by counting how many users have a strictly higher score
  const agg = await Workout.aggregate([
    { $match: { category: 'physical' } },
    { $group: { _id: '$userId', timestamps: { $push: '$timestamp' }, firstWorkout: { $min: '$timestamp' } } }
  ]);

  let higher = 0;
  for (const a of agg) {
    const streak = calcStreak(a.timestamps);
    const week = a.timestamps.filter(t => t >= startOfWeek()).length;
    const avg = calcAvgPerWeek(a.firstWorkout, a.timestamps.length);
    const s = scoreFromMetrics({ thisWeek: week, streak, avgPerWeek: avg });
    if (s > myScore) higher++;
  }
  return higher + 1;
}

module.exports = router;
