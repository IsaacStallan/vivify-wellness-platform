// backend/routes/users.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path if needed

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

// PUT /api/users/update-score - Update user's overall score
router.put('/update-score', authenticateToken, async (req, res) => {
    try {
        const { pointsToAdd, activityType, metadata = {} } = req.body;
        const userId = req.user.id; // From auth middleware
        
        if (!pointsToAdd || pointsToAdd <= 0) {
            return res.status(400).json({ error: 'Valid pointsToAdd required' });
        }
        
        // Find user and update score
        const user = await User.findById(userId);
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
        
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
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

// GET /api/users/leaderboard - Get current leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find({ isActive: true })
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
            .select('-password -email'); // Don't send sensitive data
            
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

module.exports = router;