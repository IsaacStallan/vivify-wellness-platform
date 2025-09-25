// backend/routes/users.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware for authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Helper function to find user (same as in server.js)
async function findUser(identifier) {
    return await User.findOne({
        $or: [
            { _id: require('mongoose').Types.ObjectId.isValid(identifier) ? identifier : null },
            { username: identifier },
            { email: identifier }
        ]
    });
}

// PUT /api/users/update-score - Update user's overall score
router.put('/update-score', async (req, res) => {
    try {
        const { pointsToAdd, activityType, metadata = {}, username } = req.body;
        
        // For now, use username since your auth might not be fully set up
        const userIdentifier = username || req.user?.username || req.user?.id;
        
        if (!userIdentifier) {
            return res.status(400).json({ error: 'Username required' });
        }
        
        if (!pointsToAdd || pointsToAdd <= 0) {
            return res.status(400).json({ error: 'Valid pointsToAdd required' });
        }
        
        // Find user
        let user = await findUser(userIdentifier);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Add points to overall score
        const oldScore = user.overallScore || 0;
        const newScore = oldScore + pointsToAdd;
        
        // Update user document
        const updateData = {
            overallScore: newScore,
            level: Math.floor(newScore / 500) + 1,
            lastActive: new Date()
        };
        
        // Update activity-specific stats based on type
        if (activityType.includes('focus') || activityType.includes('brain')) {
            updateData.mentalScore = (user.mentalScore || 0) + pointsToAdd;
        } else if (activityType.includes('challenge')) {
            // Add to existing challengeStats if it exists
            if (user.challengeStats) {
                updateData['challengeStats.completed'] = (user.challengeStats.completed || 0) + (activityType === 'challenge_complete' ? 1 : 0);
            }
        }
        
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            updateData, 
            { new: true, runValidators: true }
        );
        
        console.log(`Updated ${user.username}: ${oldScore} -> ${newScore} (+${pointsToAdd} from ${activityType})`);
        
        res.json({
            success: true,
            oldScore,
            newScore,
            pointsAdded: pointsToAdd,
            activityType,
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                overallScore: updatedUser.overallScore,
                level: updatedUser.level
            }
        });
        
    } catch (error) {
        console.error('Error updating user score:', error);
        res.status(500).json({ error: 'Failed to update score' });
    }
});

// GET /api/users - Get all users for leaderboard (what your frontend is calling)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({})
            .select('username school overallScore fitnessScore mentalScore nutritionScore lifeSkillsScore habitPoints challengeStats level isAnonymous lastActive')
            .sort({ overallScore: -1 });
            
        res.json(users);
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/users/update-habit-points - Update user's habit points
router.post('/update-habit-points', async (req, res) => {
    try {
        const { username, pointsToAdd, habitId } = req.body;
        
        if (!username || !pointsToAdd) {
            return res.status(400).json({ error: 'Username and pointsToAdd required' });
        }
        
        // Find and update user
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { 
                $inc: { 
                    habitPoints: pointsToAdd,
                    overallScore: pointsToAdd
                }
            },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log(`Added ${pointsToAdd} habit points to ${username}`);
        
        res.json({
            success: true,
            habitPoints: updatedUser.habitPoints,
            overallScore: updatedUser.overallScore
        });
        
    } catch (error) {
        console.error('Error updating habit points:', error);
        res.status(500).json({ error: 'Failed to update habit points' });
    }
});

// GET /api/users/leaderboard - Get current leaderboard (cleaner version)
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find({})
            .select('username school overallScore level challengeStats lastActive')
            .sort({ overallScore: -1 })
            .limit(50);
            
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            userId: user._id,
            username: user.username,
            school: user.school || 'Knox Grammar',
            overallScore: user.overallScore || 0,
            level: user.level || 1,
            activeChallenges: user.challengeStats?.active || 0,
            completedChallenges: user.challengeStats?.completed || 0,
            lastActive: user.lastActive
        }));
        
        res.json(leaderboard);
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// GET /api/users/profile/:username - Get user profile
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password'); // Don't send password
            
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.get('/challenges/participants', async (req, res) => {
    try {
      console.log('Fetching challenge participant counts...');
      
      // Count users who have joined each challenge
      const participantCounts = {};
      
      // Get all users
      const users = await User.find({});
      
      // Count participants for each challenge
      const challengeIds = [
        'fitness-foundation', 
        'morning-energy', 
        'deep-work', 
        'stress-resilience', 
        'elite-morning', 
        'time-mastery'
      ];
      
      challengeIds.forEach(challengeId => {
        participantCounts[challengeId] = users.filter(user => {
          // Check if user has challenge data and has joined this specific challenge
          const challengeData = user.challengeData && user.challengeData[challengeId];
          return challengeData && challengeData.joined === true;
        }).length;
      });
      
      console.log('Challenge participant counts:', participantCounts);
      res.json(participantCounts);
      
    } catch (error) {
      console.error('Error fetching challenge participants:', error);
      res.status(500).json({ error: 'Failed to fetch participants' });
    }
});

router.put('/challenges/join', async (req, res) => {
    try {
      console.log('=== CHALLENGE JOIN REQUEST ===');
      console.log('Body:', req.body);
      
      const { username, challengeId, challengeData } = req.body;
      
      if (!username || !challengeId || !challengeData) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Use findOneAndUpdate with $set to force the update
      const updatedUser = await User.findOneAndUpdate(
        { username: username },
        { 
          $set: { 
            [`challengeData.${challengeId}`]: challengeData 
          }
        },
        { new: true, upsert: false }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('Updated user challengeData:', updatedUser.challengeData);
      
      res.json({ success: true, message: 'Challenge joined successfully' });
      
    } catch (error) {
      console.error('Error joining challenge:', error);
      res.status(500).json({ error: 'Failed to join challenge' });
    }
});

router.get('/debug/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        res.json({
        username: user.username,
        challengeData: user.challengeData,
        hasData: !!user.challengeData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;