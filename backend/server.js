require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Build MongoDB URI from env vars
const uri = `mongodb+srv://${encodeURIComponent(process.env.MONGODB_USER)}:${encodeURIComponent(process.env.MONGODB_PASS)}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DB}?retryWrites=true&w=majority&authSource=admin`;

// Connect to MongoDB
mongoose.connect(uri, { dbName: 'vivify' })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const User = require('./models/User');

// Routes
const authRoutes = require('./routes/auth');
const fitnessRoutes = require('./routes/fitness');

app.use('/api/auth', authRoutes);
app.use('/api/fitness', fitnessRoutes);

// User API Routes (simplified - move these to routes/User.js later)
app.post('/api/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ success: true, userId: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ 
      $or: [
        { _id: req.params.userId },
        { username: req.params.userId }
      ]
    });
    res.json(user || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { 
        $or: [
          { _id: req.params.userId },
          { username: req.params.userId }
        ]
      },
      req.body,
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add the missing progress endpoint
app.post('/api/user/progress', async (req, res) => {
  try {
    const { userId, challengeId, progress } = req.body;
    
    const user = await User.findOne({ 
      $or: [
        { _id: userId },
        { username: userId }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update challenge progress
    if (!user.userChallenges) user.userChallenges = {};
    if (!user.userChallenges[challengeId]) {
      user.userChallenges[challengeId] = {
        joined: true,
        startDate: new Date().toISOString(),
        completedDays: 0,
        dailyProgress: 0,
        completed: false
      };
    }

    // Update based on progress type
    if (progress.action === 'join') {
      user.userChallenges[challengeId].joined = true;
    } else if (progress.action === 'daily_progress') {
      user.userChallenges[challengeId].dailyProgress = progress.dailyProgress;
    } else if (progress.action === 'progress') {
      user.userChallenges[challengeId].completedDays = progress.completedDays;
    } else if (progress.action === 'complete') {
      user.userChallenges[challengeId].completed = true;
      user.userChallenges[challengeId].completedDays = progress.completedDays;
    }

    // Recalculate scores
    const challengePoints = Object.values(user.userChallenges).reduce((total, challenge) => {
      if (challenge.completed) return total + 500;
      return total;
    }, 0);

    user.challengeStats = {
      active: Object.values(user.userChallenges).filter(c => c.joined && !c.completed).length,
      completed: Object.values(user.userChallenges).filter(c => c.completed).length,
      totalPoints: challengePoints
    };

    user.level = Math.floor(challengePoints / 100) + 1;
    user.habitStreak = Math.floor(challengePoints / 50);
    user.fitnessScore = Math.floor(challengePoints * 0.8);
    user.mentalScore = Math.floor(challengePoints * 0.6);
    user.nutritionScore = Math.floor(challengePoints * 0.7);
    user.lifeSkillsScore = Math.floor(challengePoints * 0.5);

    user.overallScore = Math.round(
      challengePoints * 1.0 +
      user.habitStreak * 0.8 +
      user.fitnessScore * 0.6 +
      user.nutritionScore * 0.6 +
      user.mentalScore * 0.7 +
      user.lifeSkillsScore * 0.5 +
      user.level * 50
    );

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Leaderboard API Routes
app.get('/api/leaderboard/overall', async (req, res) => {
  try {
    const users = await User.find({})
      .select('username school overallScore level challengeStats habitStreak fitnessScore nutritionScore mentalScore lifeSkillsScore')
      .sort({ overallScore: -1 })
      .limit(50);
    
    // Transform data to match frontend expectations
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      overallScore: user.overallScore || 0,
      level: user.level || 1,
      activeChallenges: user.challengeStats?.active || 0,
      completedChallenges: user.challengeStats?.completed || 0,
      totalPoints: user.challengeStats?.totalPoints || 0
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching overall leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch overall leaderboard' });
  }
});

app.get('/api/leaderboard/challenges', async (req, res) => {
  try {
    const users = await User.find({ 'challengeStats.totalPoints': { $gt: 0 } })
      .select('username userChallenges challengeStats')
      .sort({ 'challengeStats.totalPoints': -1 })
      .limit(50);

    const challengeData = [];
    users.forEach(user => {
      if (user.userChallenges) {
        Object.entries(user.userChallenges).forEach(([challengeId, challenge]) => {
          if (challenge.joined) {
            challengeData.push({
              userId: user._id,
              displayName: user.username,
              challengeId,
              progress: challenge.completed ? 100 : Math.round((challenge.completedDays || 0) / 30 * 100),
              isCompleted: challenge.completed,
              completedDays: challenge.completedDays || 0
            });
          }
        });
      }
    });

    res.json(challengeData);
  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch challenge leaderboard' });
  }
});

app.get('/api/leaderboard/physical', async (req, res) => {
  try {
    const users = await User.find({ fitnessScore: { $gt: 0 } })
      .select('username school fitnessScore level')
      .sort({ fitnessScore: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      score: user.fitnessScore,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch physical leaderboard' });
  }
});

app.get('/api/leaderboard/mental', async (req, res) => {
  try {
    const users = await User.find({ mentalScore: { $gt: 0 } })
      .select('username school mentalScore level')
      .sort({ mentalScore: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      score: user.mentalScore,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mental leaderboard' });
  }
});

app.get('/api/leaderboard/habits', async (req, res) => {
  try {
    const users = await User.find({ habitStreak: { $gt: 0 } })
      .select('username school habitStreak level')
      .sort({ habitStreak: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      score: user.habitStreak,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits leaderboard' });
  }
});

app.get('/api/leaderboard/weekly', async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const users = await User.find({ updatedAt: { $gte: weekAgo } })
      .select('username school overallScore level updatedAt')
      .sort({ overallScore: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      overallScore: user.overallScore,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

app.get('/api/leaderboard/monthly', async (req, res) => {
  try {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const users = await User.find({ updatedAt: { $gte: monthAgo } })
      .select('username school overallScore level updatedAt')
      .sort({ overallScore: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      overallScore: user.overallScore,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly leaderboard' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});