const express = require('express');
const router = express.Router();
const User = require('../models/User');
const HabitLog = require('../models/HabitLog');
const BasecampPost = require('../models/BasecampPost');
const {
    MOUNTAINS,
    getMountain,
    getNextMountain,
    canUnlockMountain,
    calculateAltitudeGain,
    calculateOxygenChange,
    calculateOxygenDrain
} = require('../config/mountains');
const {
    CORE_HABITS,
    CUSTOM_HABIT_TEMPLATES,
    getHabitsByCategory,
    getCategories,
    getHabit,
    validateCustomHabits
} = require('../config/habits');

// Helper function to find user
async function findUser(identifier) {
    const mongoose = require('mongoose');
    return await User.findOne({
        $or: [
            { _id: mongoose.Types.ObjectId.isValid(identifier) ? identifier : null },
            { username: identifier },
            { email: identifier }
        ]
    });
}

// ============================================
// HABIT ENDPOINTS
// ============================================

// GET /api/mountain/habits/templates - Get all habit templates
router.get('/habits/templates', async (req, res) => {
    try {
        const { category } = req.query;

        if (category) {
            const habits = getHabitsByCategory(category);
            return res.json({
                success: true,
                category,
                habits
            });
        }

        res.json({
            success: true,
            coreHabits: CORE_HABITS,
            customHabits: CUSTOM_HABIT_TEMPLATES,
            categories: getCategories()
        });
    } catch (error) {
        console.error('Error fetching habit templates:', error);
        res.status(500).json({ error: 'Failed to fetch habit templates' });
    }
});

// POST /api/mountain/habits/select - Select custom habits
router.post('/habits/select', async (req, res) => {
    try {
        const { userId, customHabits } = req.body;

        if (!userId || !customHabits) {
            return res.status(400).json({ error: 'userId and customHabits required' });
        }

        const validation = validateCustomHabits(customHabits);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is at basecamp or can make emergency swap
        if (!user.mountainGameData) {
            user.mountainGameData = {};
        }

        const canChange = user.mountainGameData.currentMountain === 'training' ||
                         user.mountainGameData.emergencySwapsAvailable > 0;

        if (!canChange) {
            return res.status(403).json({
                error: 'Can only change habits at basecamp or with emergency swap'
            });
        }

        user.mountainGameData.customHabits = customHabits;

        // Use emergency swap if not in training
        if (user.mountainGameData.currentMountain !== 'training' &&
            user.mountainGameData.emergencySwapsAvailable > 0) {
            user.mountainGameData.emergencySwapsAvailable -= 1;
        }

        user.markModified('mountainGameData');
        await user.save();

        res.json({
            success: true,
            customHabits: user.mountainGameData.customHabits,
            emergencySwapsRemaining: user.mountainGameData.emergencySwapsAvailable
        });
    } catch (error) {
        console.error('Error selecting habits:', error);
        res.status(500).json({ error: 'Failed to select habits' });
    }
});

// POST /api/mountain/habits/log - Log daily habits
router.post('/habits/log', async (req, res) => {
    try {
        const { userId, habits, habitDetails } = req.body;

        if (!userId || !habits) {
            return res.status(400).json({ error: 'userId and habits required' });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.mountainGameData) {
            user.mountainGameData = {};
        }

        const mountainData = user.mountainGameData;
        const currentMountain = getMountain(mountainData.currentMountain || 'training');

        // Calculate oxygen gained from completed habits
        let oxygenGained = 0;
        let habitsCompletedCount = 0;

        // Core habits
        if (habits.hydration) { oxygenGained += 15; habitsCompletedCount++; }
        if (habits.sleep) { oxygenGained += 20; habitsCompletedCount++; }
        if (habits.movement) { oxygenGained += 15; habitsCompletedCount++; }
        if (habits.focus) { oxygenGained += 20; habitsCompletedCount++; }

        // Custom habits
        if (habits.custom1) { oxygenGained += 10; habitsCompletedCount++; }
        if (habits.custom2) { oxygenGained += 10; habitsCompletedCount++; }
        if (habits.custom3) { oxygenGained += 10; habitsCompletedCount++; }

        // Apply oxygen drain for the mountain
        const oxygenDrain = calculateOxygenDrain(mountainData.currentMountain);
        const netOxygenChange = oxygenGained - oxygenDrain;

        // Update oxygen (capped at 100, min 0)
        const previousOxygen = mountainData.oxygen || 0;
        mountainData.oxygen = Math.max(0, Math.min(100, previousOxygen + netOxygenChange));

        // Calculate altitude gain (only if oxygen >= 30%)
        let altitudeGained = 0;
        if (mountainData.oxygen >= 30 && mountainData.currentMountain !== 'training') {
            altitudeGained = calculateAltitudeGain(mountainData.currentMountain, habitsCompletedCount);
            mountainData.altitude += altitudeGained;
            mountainData.totalElevation += altitudeGained;
        }

        // Track consecutive days above 70% (for training)
        if (mountainData.oxygen >= 70) {
            mountainData.consecutiveDaysAbove70 = (mountainData.consecutiveDaysAbove70 || 0) + 1;
        } else {
            mountainData.consecutiveDaysAbove70 = 0;
        }

        // Check if training is complete
        if (mountainData.currentMountain === 'training' && mountainData.consecutiveDaysAbove70 >= 3) {
            mountainData.trainingComplete = true;
        }

        // Check if summit reached
        let summitReached = false;
        if (currentMountain && mountainData.altitude >= currentMountain.elevation) {
            summitReached = true;
            if (!mountainData.summitsBadges.includes(currentMountain.id)) {
                mountainData.summitsBadges.push(currentMountain.id);
            }

            // Add gear rewards
            if (currentMountain.rewards && currentMountain.rewards.gear) {
                if (!mountainData.avatarCustomization) {
                    mountainData.avatarCustomization = { gear: [] };
                }
                currentMountain.rewards.gear.forEach(item => {
                    if (!mountainData.avatarCustomization.gear.includes(item)) {
                        mountainData.avatarCustomization.gear.push(item);
                    }
                });
            }
        }

        // Check if fell back (oxygen < 30%)
        let fellBack = false;
        if (mountainData.oxygen < 30 && mountainData.altitude > 0) {
            fellBack = true;
            // Fall back to nearest basecamp or base
            const basecamps = currentMountain.basecampLocations || [];
            let fallbackAltitude = 0;

            for (const camp of basecamps.reverse()) {
                if (camp.altitude < mountainData.altitude) {
                    fallbackAltitude = camp.altitude;
                    break;
                }
            }

            const altitudeLost = mountainData.altitude - fallbackAltitude;
            mountainData.altitude = fallbackAltitude;
        }

        mountainData.lastHabitLog = new Date();
        mountainData.lastOxygenUpdate = new Date();
        mountainData.currentDay = (mountainData.currentDay || 0) + 1;

        // Create habit log
        const habitLog = new HabitLog({
            userId: user._id,
            date: new Date(),
            habits,
            habitDetails: habitDetails || {},
            oxygenChange: netOxygenChange,
            altitudeChange: altitudeGained,
            mountainAtLog: mountainData.currentMountain
        });

        await habitLog.save();

        user.markModified('mountainGameData');
        await user.save();

        res.json({
            success: true,
            oxygen: mountainData.oxygen,
            oxygenChange: netOxygenChange,
            oxygenGained,
            oxygenDrain,
            altitude: mountainData.altitude,
            altitudeGained,
            habitsCompleted: habitsCompletedCount,
            totalHabits: 7,
            summitReached,
            fellBack,
            consecutiveDaysAbove70: mountainData.consecutiveDaysAbove70,
            trainingComplete: mountainData.trainingComplete,
            currentMountain: currentMountain
        });
    } catch (error) {
        console.error('Error logging habits:', error);
        res.status(500).json({ error: 'Failed to log habits' });
    }
});

// GET /api/mountain/habits/history - Get habit history
router.get('/habits/history', async (req, res) => {
    try {
        const { userId, limit = 30 } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const logs = await HabitLog.find({ userId: user._id })
            .sort({ date: -1 })
            .limit(parseInt(limit));

        const streak = await HabitLog.getUserStreak(user._id);
        const weeklyStats = await HabitLog.getWeeklyStats(user._id);

        res.json({
            success: true,
            logs,
            streak,
            weeklyStats
        });
    } catch (error) {
        console.error('Error fetching habit history:', error);
        res.status(500).json({ error: 'Failed to fetch habit history' });
    }
});

// ============================================
// MOUNTAIN PROGRESS ENDPOINTS
// ============================================

// GET /api/mountain/progress - Get user's current mountain progress
router.get('/progress', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.mountainGameData) {
            user.mountainGameData = {
                currentMountain: 'training',
                oxygen: 0,
                altitude: 0,
                totalElevation: 0
            };
        }

        const mountainData = user.mountainGameData;
        const currentMountain = getMountain(mountainData.currentMountain);
        const nextMountain = getNextMountain(mountainData.currentMountain);
        const canUnlockNext = nextMountain ? canUnlockMountain(nextMountain.id, mountainData) : false;

        res.json({
            success: true,
            mountainData,
            currentMountain,
            nextMountain: canUnlockNext ? nextMountain : null,
            progress: currentMountain ? {
                percentage: (mountainData.altitude / currentMountain.elevation) * 100,
                metersToGo: currentMountain.elevation - mountainData.altitude
            } : null
        });
    } catch (error) {
        console.error('Error fetching mountain progress:', error);
        res.status(500).json({ error: 'Failed to fetch mountain progress' });
    }
});

// POST /api/mountain/start - Start a new mountain
router.post('/start', async (req, res) => {
    try {
        const { userId, mountainId } = req.body;

        if (!userId || !mountainId) {
            return res.status(400).json({ error: 'userId and mountainId required' });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.mountainGameData) {
            user.mountainGameData = {};
        }

        const mountain = getMountain(mountainId);
        if (!mountain) {
            return res.status(404).json({ error: 'Mountain not found' });
        }

        // Check if user can unlock this mountain
        if (!canUnlockMountain(mountainId, user.mountainGameData)) {
            return res.status(403).json({ error: 'Mountain not unlocked yet' });
        }

        // Reset for new mountain
        user.mountainGameData.currentMountain = mountainId;
        user.mountainGameData.altitude = 0;
        user.mountainGameData.currentDay = 0;
        user.mountainGameData.emergencySwapsAvailable = 1; // Reset emergency swap

        user.markModified('mountainGameData');
        await user.save();

        res.json({
            success: true,
            message: `Started climbing ${mountain.name}!`,
            mountain,
            mountainData: user.mountainGameData
        });
    } catch (error) {
        console.error('Error starting mountain:', error);
        res.status(500).json({ error: 'Failed to start mountain' });
    }
});

// GET /api/mountain/all - Get all mountains info
router.get('/all', async (req, res) => {
    try {
        res.json({
            success: true,
            mountains: MOUNTAINS
        });
    } catch (error) {
        console.error('Error fetching mountains:', error);
        res.status(500).json({ error: 'Failed to fetch mountains' });
    }
});

// ============================================
// BASECAMP ENDPOINTS
// ============================================

// GET /api/mountain/basecamp/posts - Get basecamp posts
router.get('/basecamp/posts', async (req, res) => {
    try {
        const { mountain, basecampName, limit = 50 } = req.query;

        if (!mountain || !basecampName) {
            return res.status(400).json({ error: 'mountain and basecampName required' });
        }

        const posts = await BasecampPost.getBasecampPosts(mountain, basecampName, parseInt(limit));

        res.json({
            success: true,
            posts,
            total: posts.length
        });
    } catch (error) {
        console.error('Error fetching basecamp posts:', error);
        res.status(500).json({ error: 'Failed to fetch basecamp posts' });
    }
});

// POST /api/mountain/basecamp/post - Create basecamp post
router.post('/basecamp/post', async (req, res) => {
    try {
        const { userId, mountain, basecampName, content } = req.body;

        if (!userId || !mountain || !basecampName || !content) {
            return res.status(400).json({ error: 'userId, mountain, basecampName, and content required' });
        }

        if (content.length > 500) {
            return res.status(400).json({ error: 'Content must be 500 characters or less' });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const post = new BasecampPost({
            mountain,
            basecampName,
            userId: user._id,
            username: user.username,
            content
        });

        await post.save();

        res.json({
            success: true,
            post,
            message: post.moderationStatus === 'auto-blocked' ?
                'Post flagged for moderation' : 'Post created successfully'
        });
    } catch (error) {
        console.error('Error creating basecamp post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// POST /api/mountain/basecamp/upvote - Upvote a post
router.post('/basecamp/upvote', async (req, res) => {
    try {
        const { userId, postId } = req.body;

        if (!userId || !postId) {
            return res.status(400).json({ error: 'userId and postId required' });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const post = await BasecampPost.findOne({ postId });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const upvoted = await post.upvote(user._id);

        res.json({
            success: true,
            upvoted,
            sherpaPoints: post.sherpaPoints
        });
    } catch (error) {
        console.error('Error upvoting post:', error);
        res.status(500).json({ error: 'Failed to upvote post' });
    }
});

// POST /api/mountain/basecamp/flag - Flag a post
router.post('/basecamp/flag', async (req, res) => {
    try {
        const { userId, postId, reason } = req.body;

        if (!userId || !postId) {
            return res.status(400).json({ error: 'userId and postId required' });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const post = await BasecampPost.findOne({ postId });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const flagged = await post.flag(user._id, reason);

        res.json({
            success: true,
            flagged,
            message: 'Post has been flagged for review'
        });
    } catch (error) {
        console.error('Error flagging post:', error);
        res.status(500).json({ error: 'Failed to flag post' });
    }
});

// ============================================
// LEADERBOARD ENDPOINTS
// ============================================

// GET /api/mountain/leaderboard/weekly - Get weekly leaderboard
router.get('/leaderboard/weekly', async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const users = await User.find({
            'mountainGameData.lastHabitLog': { $gte: weekAgo }
        })
        .select('username school yearLevel mountainGameData')
        .sort({ 'mountainGameData.totalElevation': -1 })
        .limit(parseInt(limit));

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            school: user.school,
            yearLevel: user.yearLevel,
            totalElevation: user.mountainGameData?.totalElevation || 0,
            currentMountain: user.mountainGameData?.currentMountain || 'training',
            oxygen: user.mountainGameData?.oxygen || 0
        }));

        res.json({
            success: true,
            leaderboard,
            period: 'weekly'
        });
    } catch (error) {
        console.error('Error fetching weekly leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
    }
});

// GET /api/mountain/leaderboard/mountain - Get leaderboard for specific mountain
router.get('/leaderboard/mountain', async (req, res) => {
    try {
        const { mountain, limit = 50 } = req.query;

        if (!mountain) {
            return res.status(400).json({ error: 'mountain parameter required' });
        }

        const users = await User.find({
            'mountainGameData.currentMountain': mountain
        })
        .select('username school yearLevel mountainGameData')
        .sort({ 'mountainGameData.altitude': -1 })
        .limit(parseInt(limit));

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            school: user.school,
            yearLevel: user.yearLevel,
            altitude: user.mountainGameData?.altitude || 0,
            oxygen: user.mountainGameData?.oxygen || 0,
            currentDay: user.mountainGameData?.currentDay || 0
        }));

        res.json({
            success: true,
            leaderboard,
            mountain
        });
    } catch (error) {
        console.error('Error fetching mountain leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch mountain leaderboard' });
    }
});

// GET /api/mountain/leaderboard/total - Get all-time total elevation leaderboard
router.get('/leaderboard/total', async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const users = await User.find({
            'mountainGameData.totalElevation': { $gt: 0 }
        })
        .select('username school yearLevel mountainGameData')
        .sort({ 'mountainGameData.totalElevation': -1 })
        .limit(parseInt(limit));

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            school: user.school,
            yearLevel: user.yearLevel,
            totalElevation: user.mountainGameData?.totalElevation || 0,
            summitsCompleted: user.mountainGameData?.summitsBadges?.length || 0,
            currentMountain: user.mountainGameData?.currentMountain || 'training'
        }));

        res.json({
            success: true,
            leaderboard,
            period: 'all-time'
        });
    } catch (error) {
        console.error('Error fetching total elevation leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch total elevation leaderboard' });
    }
});

module.exports = router;
