// TEST HELPER ROUTES - FOR DEVELOPMENT ONLY
const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

// POST /api/test/complete-training - Instantly complete training
router.post('/complete-training', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.mountainGameData) {
            user.mountainGameData = {};
        }

        // Set training as complete
        user.mountainGameData.oxygen = 75;
        user.mountainGameData.consecutiveDaysAbove70 = 3;
        user.mountainGameData.trainingComplete = true;
        user.mountainGameData.currentMountain = 'training';

        user.markModified('mountainGameData');
        await user.save();

        res.json({
            success: true,
            message: 'Training completed! Mt. Fuji is now unlocked.',
            mountainData: user.mountainGameData
        });

    } catch (error) {
        console.error('Error completing training:', error);
        res.status(500).json({ error: 'Failed to complete training' });
    }
});

// POST /api/test/set-altitude - Set altitude for testing summit
router.post('/set-altitude', async (req, res) => {
    try {
        const { userId, altitude } = req.body;

        if (!userId || altitude === undefined) {
            return res.status(400).json({ error: 'userId and altitude required' });
        }

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.mountainGameData) {
            user.mountainGameData = {};
        }

        user.mountainGameData.altitude = parseInt(altitude);
        user.markModified('mountainGameData');
        await user.save();

        res.json({
            success: true,
            message: `Altitude set to ${altitude}m`,
            mountainData: user.mountainGameData
        });

    } catch (error) {
        console.error('Error setting altitude:', error);
        res.status(500).json({ error: 'Failed to set altitude' });
    }
});

// POST /api/test/reset-user - Reset user's mountain progress
router.post('/reset-user', async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.mountainGameData = {
            oxygen: 0,
            currentMountain: 'training',
            altitude: 0,
            totalElevation: 0,
            currentDay: 0,
            summitsBadges: [],
            customHabits: [],
            lastOxygenUpdate: new Date(),
            trainingComplete: false,
            consecutiveDaysAbove70: 0,
            sicknessShelterDays: 2,
            emergencySwapsAvailable: 1,
            avatarCustomization: {
                skin: 'default',
                gear: []
            }
        };

        user.markModified('mountainGameData');
        await user.save();

        res.json({
            success: true,
            message: 'User progress reset to beginning',
            mountainData: user.mountainGameData
        });

    } catch (error) {
        console.error('Error resetting user:', error);
        res.status(500).json({ error: 'Failed to reset user' });
    }
});

module.exports = router;
