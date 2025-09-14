// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path to your User model

// GET /api/leaderboard/overall
router.get('/overall', async (req, res) => {
  try {
    const users = await User.find({})
      .select('userId displayName school overallScore level challengeStats habitStreak fitnessScore nutritionScore mentalScore lifeSkillsScore')
      .sort({ overallScore: -1 })
      .limit(50);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching overall leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch overall leaderboard' });
  }
});

// GET /api/leaderboard/challenges
router.get('/challenges', async (req, res) => {
  try {
    // Get users with challenge data
    const users = await User.find({ 'challengeStats.totalPoints': { $gt: 0 } })
      .select('userId displayName userChallenges challengeStats')
      .sort({ 'challengeStats.totalPoints': -1 })
      .limit(50);

    // Transform into challenge-specific format
    const challengeData = [];
    users.forEach(user => {
      if (user.userChallenges) {
        Object.entries(user.userChallenges).forEach(([challengeId, challenge]) => {
          if (challenge.joined) {
            challengeData.push({
              userId: user.userId,
              displayName: user.displayName,
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

// GET /api/leaderboard/physical
router.get('/physical', async (req, res) => {
  try {
    const users = await User.find({ fitnessScore: { $gt: 0 } })
      .select('userId displayName school fitnessScore level')
      .sort({ fitnessScore: -1 })
      .limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching physical leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch physical leaderboard' });
  }
});

// GET /api/leaderboard/mental
router.get('/mental', async (req, res) => {
  try {
    const users = await User.find({ mentalScore: { $gt: 0 } })
      .select('userId displayName school mentalScore level')
      .sort({ mentalScore: -1 })
      .limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching mental leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch mental leaderboard' });
  }
});

// GET /api/leaderboard/habits
router.get('/habits', async (req, res) => {
  try {
    const users = await User.find({ habitStreak: { $gt: 0 } })
      .select('userId displayName school habitStreak level')
      .sort({ habitStreak: -1 })
      .limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching habits leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch habits leaderboard' });
  }
});

// GET /api/leaderboard/weekly
router.get('/weekly', async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // For now, use overall score but you could track weekly points separately
    const users = await User.find({ updatedAt: { $gte: weekAgo } })
      .select('userId displayName school overallScore level updatedAt')
      .sort({ overallScore: -1 })
      .limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching weekly leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

// GET /api/leaderboard/monthly
router.get('/monthly', async (req, res) => {
  try {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const users = await User.find({ updatedAt: { $gte: monthAgo } })
      .select('userId displayName school overallScore level updatedAt')
      .sort({ overallScore: -1 })
      .limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching monthly leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch monthly leaderboard' });
  }
});

// POST /api/user/progress
router.post('/progress', async (req, res) => {
  try {
    const { userId, challengeId, progress } = req.body;

    // Find and update the user
    const user = await User.findOne({ userId });
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

    // Recalculate user scores
    const challengePoints = Object.values(user.userChallenges).reduce((total, challenge) => {
      if (challenge.completed) return total + 500; // Base challenge points
      return total;
    }, 0);

    user.challengeStats = {
      active: Object.values(user.userChallenges).filter(c => c.joined && !c.completed).length,
      completed: Object.values(user.userChallenges).filter(c => c.completed).length,
      totalPoints: challengePoints
    };

    // Update derived scores
    user.level = Math.floor(challengePoints / 100) + 1;
    user.habitStreak = Math.floor(challengePoints / 50);
    user.fitnessScore = Math.floor(challengePoints * 0.8);
    user.mentalScore = Math.floor(challengePoints * 0.6);
    user.nutritionScore = Math.floor(challengePoints * 0.7);
    user.lifeSkillsScore = Math.floor(challengePoints * 0.5);

    // Calculate overall score
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

module.exports = router;