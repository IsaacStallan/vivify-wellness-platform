// backend/routes/users.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

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

// FIXED date filtering logic in backend/routes/users.js
// Replace the existing GET /api/users route with this corrected version

router.get('/', async (req, res) => {
    try {
      const { timeframe = 'weekly' } = req.query;
      
      const users = await User.find({}).lean();
      
      // Filter and calculate time-based scores for each user
      // FIXED: Consistent calculation logic for backend/routes/users.js
        // Replace the entire calculation section in your GET /api/users route

        const processedUsers = users.map(user => {
            let timeBasedHabitPoints = 0;
            let timeBasedChallengePoints = 0;
            
            // ALWAYS use activity log for consistent calculations
            if (user.activity && Array.isArray(user.activity)) {
            
            // For timeframe filtering, set the date boundary
            let startDate = null;
            const now = new Date();
            
            if (timeframe === 'weekly') {
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
            } else if (timeframe === 'monthly') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            }
            // For 'alltime', startDate stays null = include everything
            
            console.log(`=== ${user.username} - ${timeframe.toUpperCase()} CALCULATION ===`);
            console.log(`Date filter: ${startDate ? startDate.toISOString() : 'No filter (all-time)'}`);
            
            user.activity.forEach(activity => {
                if (!activity || !activity.timestamp) return;
                
                const activityDate = new Date(activity.timestamp);
                
                // Apply date filter for weekly/monthly, skip filter for all-time
                const includeActivity = !startDate || (activityDate >= startDate && activityDate <= now);
                
                if (includeActivity) {
                const points = activity.points || 0;
                
                if (activity.type === 'habit_completed') {
                    timeBasedHabitPoints += points;
                } else if (['challenge_completed', 'challenge_joined', 'challenge_daily'].includes(activity.type)) {
                    timeBasedChallengePoints += points;
                }
                
                console.log(`✓ Including: ${activity.type} on ${activityDate.toISOString().split('T')[0]} (+${points})`);
                } else {
                console.log(`✗ Excluding: ${activity.type} on ${activityDate.toISOString().split('T')[0]} (outside ${timeframe})`);
                }
            });
            }
            
            // FALLBACK: Use stored fields for all-time when activity log is empty for that type
            if (timeframe === 'alltime') {
                if (timeBasedHabitPoints === 0 && user.habitPoints > 0) {
                    console.log(`Using stored habitPoints (${user.habitPoints}) for ${user.username}`);
                    timeBasedHabitPoints = user.habitPoints;
                }
                
                if (timeBasedChallengePoints === 0 && user.challengeStats?.totalPoints > 0) {
                    console.log(`Using stored challengeStats.totalPoints (${user.challengeStats.totalPoints}) for ${user.username}`);
                    timeBasedChallengePoints = user.challengeStats.totalPoints;
                }
            console.log(`No activities found for ${user.username}, using stored fields as fallback`);
            
            // Use stored habit points
            timeBasedHabitPoints = user.habitPoints || 0;
            
            // Use stored challenge points  
            timeBasedChallengePoints = user.challengeStats?.totalPoints || 0;
            
            // If still zero but overallScore exists, calculate from overallScore
            if (timeBasedHabitPoints === 0 && user.overallScore > 0) {
                const assessmentScore = (user.fitnessScore || 0) + 
                                    (user.mentalScore || 0) + 
                                    (user.nutritionScore || 0) + 
                                    (user.lifeSkillsScore || 0);
                const remainingPoints = Math.max(0, user.overallScore - assessmentScore);
                
                // Split remaining points between habits and challenges
                // Assume 70% habits, 30% challenges if we have no other data
                timeBasedHabitPoints = Math.floor(remainingPoints * 0.7);
                timeBasedChallengePoints = remainingPoints - timeBasedHabitPoints;
            }
            }
            
            console.log(`Final ${timeframe} points for ${user.username}: Habits=${timeBasedHabitPoints}, Challenges=${timeBasedChallengePoints}`);
            
            // Assessment scores are always current state (not time-based)
            const assessmentScore = (user.fitnessScore || 0) + 
                                (user.mentalScore || 0) + 
                                (user.nutritionScore || 0) + 
                                (user.lifeSkillsScore || 0);
            
            const totalScore = assessmentScore + timeBasedHabitPoints + timeBasedChallengePoints;
            
            return {
            id: user._id,
            username: user.username,
            displayName: user.displayName || user.username,
            school: user.school || 'Knox Grammar',
            score: totalScore,
            scoreBreakdown: {
                assessment: assessmentScore,
                habits: timeBasedHabitPoints,
                challenges: timeBasedChallengePoints
            }
            };
        });
      
      // Sort by score and add rankings
      processedUsers.sort((a, b) => b.score - a.score);
      
      console.log(`=== FINAL LEADERBOARD FOR ${timeframe.toUpperCase()} ===`);
      processedUsers.slice(0, 5).forEach((user, index) => {
        console.log(`#${index + 1}: ${user.username} - ${user.score} points (A:${user.scoreBreakdown.assessment}, H:${user.scoreBreakdown.habits}, C:${user.scoreBreakdown.challenges})`);
      });
      
      res.json({
        users: processedUsers,
        timeframe,
        total: processedUsers.length
      });
      
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/users/sync-assessment - Sync existing assessment data
router.post('/sync-assessment', async (req, res) => {
    try {
      const { username, fitnessScore, mentalScore, nutritionScore, lifeSkillsScore, hasCompletedAssessment, lastAssessmentDate } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Only sync if user doesn't already have assessment data
      if (!user.hasCompletedAssessment || user.fitnessScore === 0) {
        console.log(`Syncing assessment data for user: ${username}`);
        
        user.fitnessScore = fitnessScore || 0;
        user.mentalScore = mentalScore || 0;
        user.nutritionScore = nutritionScore || 0;
        user.lifeSkillsScore = lifeSkillsScore || 0;
        user.hasCompletedAssessment = true;
        user.lastAssessmentDate = new Date(lastAssessmentDate || Date.now());
        
        // Calculate new overall score
        const assessmentTotal = (fitnessScore || 0) + (mentalScore || 0) + (nutritionScore || 0) + (lifeSkillsScore || 0);
        user.overallScore = assessmentTotal + (user.habitPoints || 0) + (user.challengeStats?.totalPoints || 0);
        
        await user.save();
        
        console.log(`Assessment synced for ${username}:`, {
          fitness: user.fitnessScore,
          mental: user.mentalScore,
          nutrition: user.nutritionScore,
          lifeSkills: user.lifeSkillsScore,
          overallScore: user.overallScore
        });
        
        res.json({ 
          message: 'Assessment data synced successfully',
          scores: {
            fitness: user.fitnessScore,
            mental: user.mentalScore,
            nutrition: user.nutritionScore,
            lifeSkills: user.lifeSkillsScore
          },
          overallScore: user.overallScore
        });
      } else {
        res.json({ message: 'User already has assessment data' });
      }
      
    } catch (error) {
      console.error('Error syncing assessment:', error);
      res.status(500).json({ error: 'Failed to sync assessment data' });
    }
});

// FIXED: Replace the update-habit-points route in backend/routes/users.js
// This route needs to route points to the correct field based on activity type

router.post('/update-habit-points', async (req, res) => {
    try {
        const { username, pointsToAdd, habitId, activityType, timestamp } = req.body;
        
        if (!username || !pointsToAdd) {
            return res.status(400).json({ error: 'Username and pointsToAdd required' });
        }
        
        // Create activity entry for time-based filtering
        const activityEntry = {
            type: activityType || 'habit_completed',
            habitId: habitId,
            points: pointsToAdd,
            timestamp: timestamp || new Date().toISOString()
        };
        
        // FIXED: Route points to correct field based on activity type
        let updateFields = {
            $push: {
                activity: {
                    $each: [activityEntry],
                    $slice: -100  // Keep only last 100 activities
                }
            },
            $set: {
                lastActive: new Date()
            }
        };
        
        // Route points based on activity type
        if (['challenge_joined', 'challenge_daily', 'challenge_completed'].includes(activityType)) {
            // CHALLENGE ACTIVITIES: Add to challengeStats.totalPoints
            updateFields.$inc = {
                'challengeStats.totalPoints': pointsToAdd,
                overallScore: pointsToAdd
            };
            console.log(`Adding ${pointsToAdd} CHALLENGE points for ${username} (${activityType})`);
        } else {
            // HABIT ACTIVITIES: Add to habitPoints
            updateFields.$inc = {
                habitPoints: pointsToAdd,
                overallScore: pointsToAdd
            };
            console.log(`Adding ${pointsToAdd} HABIT points for ${username} (${activityType})`);
        }
        
        // Find and update user
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            updateFields,
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const responseData = {
            success: true,
            activityType: activityType,
            pointsAdded: pointsToAdd,
            overallScore: updatedUser.overallScore,
            activityLogged: true
        };
        
        // Add type-specific data to response
        if (['challenge_joined', 'challenge_daily', 'challenge_completed'].includes(activityType)) {
            responseData.challengePoints = updatedUser.challengeStats?.totalPoints || 0;
        } else {
            responseData.habitPoints = updatedUser.habitPoints || 0;
        }
        
        console.log(`Updated ${username}: Total=${updatedUser.overallScore}, Habits=${updatedUser.habitPoints}, Challenges=${updatedUser.challengeStats?.totalPoints || 0}`);
        
        res.json(responseData);
        
    } catch (error) {
        console.error('Error updating user points:', error);
        res.status(500).json({ error: 'Failed to update points' });
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

// PUT /api/users/profile - Update user profile information
router.put('/profile', async (req, res) => {
    try {
        const { username, updates } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }
        
        // Validate and sanitize updates
        const allowedUpdates = {
            displayName: updates.displayName,
            email: updates.email,
            yearLevel: updates.yearLevel,
            location: updates.location,
            school: updates.school,
            bio: updates.bio
        };
        
        // Remove undefined values
        Object.keys(allowedUpdates).forEach(key => 
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );
        
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log(`Profile updated for ${username}:`, allowedUpdates);
        
        res.json({
            success: true,
            user: {
                username: updatedUser.username,
                displayName: updatedUser.displayName,
                email: updatedUser.email,
                yearLevel: updatedUser.yearLevel,
                location: updatedUser.location,
                school: updatedUser.school
            }
        });
        
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', async (req, res) => {
    try {
        const { username, preferences } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }
        
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $set: { preferences: preferences } },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log(`Preferences updated for ${username}`);
        
        res.json({
            success: true,
            preferences: updatedUser.preferences
        });
        
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// POST /api/users/achievements/unlock - Unlock an achievement permanently
router.post('/achievements/unlock', async (req, res) => {
    try {
        const { username, achievementId } = req.body;
        
        if (!username || !achievementId) {
            return res.status(400).json({ error: 'Username and achievementId required' });
        }
        
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if achievement already unlocked
        const existingAchievements = user.achievements || [];
        const alreadyUnlocked = existingAchievements.some(a => a.id === achievementId);
        
        if (alreadyUnlocked) {
            return res.json({ success: true, message: 'Achievement already unlocked' });
        }
        
        // Add achievement
        const achievement = {
            id: achievementId,
            unlockedAt: new Date()
        };
        
        await User.findOneAndUpdate(
            { username: username },
            { $push: { achievements: achievement } },
            { new: true }
        );
        
        console.log(`Achievement unlocked for ${username}: ${achievementId}`);
        
        res.json({
            success: true,
            achievement: achievement
        });
        
    } catch (error) {
        console.error('Error unlocking achievement:', error);
        res.status(500).json({ error: 'Failed to unlock achievement' });
    }
});

// GET /api/users/profile/:username - Get full profile data
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password');
            
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            username: user.username,
            displayName: user.displayName || user.username,
            email: user.email,
            yearLevel: user.yearLevel,
            location: user.location,
            school: user.school,
            preferences: user.preferences || {},
            achievements: user.achievements || [],
            createdAt: user.createdAt
        });
        
    } catch (error) {
        console.error('Error fetching profile:', error);
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

// GET /api/users/export-emails - Export user emails for manual sending
router.get('/export-emails', async (req, res) => {
    try {
      const { adminKey } = req.query;
      
      if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const users = await User.find({ 
        email: { $exists: true, $ne: '' } 
      }).select('username email school createdAt');
      
      const emailList = users.map(user => ({
        username: user.username,
        email: user.email,
        school: user.school || 'Knox Grammar',
        signupDate: user.createdAt ? user.createdAt.toISOString().split('T')[0] : 'Unknown'
      }));
      
      res.json({
        totalUsers: users.length,
        emails: emailList.map(u => u.email),
        fullData: emailList
      });
      
    } catch (error) {
      console.error('Error exporting emails:', error);
      res.status(500).json({ error: 'Failed to export emails' });
    }
});

// POST /api/users/clear-habit-data - Clear user's habit completion data (FIXED VERSION)
router.post('/clear-habit-data', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }
        
        // Clear the correct fields based on your MongoDB structure
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { 
                $unset: {
                    habitsData: "",        // This is where your data actually is
                    activity: ""
                },
                $set: {
                    habitPoints: 0,
                    currentStreak: 0,
                    habitStreak: 0
                }
            },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log(`Cleared habitsData field for ${username}`);
        res.json({ success: true, message: 'Habit data cleared from database' });
        
    } catch (error) {
        console.error('Error clearing habit data:', error);
        res.status(500).json({ error: 'Failed to clear habit data' });
    }
});

module.exports = router;