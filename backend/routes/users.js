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

// GET /api/users - Get all users with optional time filtering
router.get('/', async (req, res) => {
    try {
      const { timeframe = 'weekly' } = req.query;
      
      const users = await User.find({}).lean();
      
      // Filter and calculate time-based scores for each user
      const processedUsers = users.map(user => {
        let timeBasedHabitPoints = 0;
        let timeBasedChallengePoints = 0;
        
        // For all-time, use stored totals directly
        if (timeframe === 'alltime') {
          // FIXED: Check multiple sources for habit points
          timeBasedHabitPoints = user.habitPoints || 0;
          
          // If habitPoints is 0 but overallScore exists, use overallScore as fallback
          // (for older users like Freeman who have points in overallScore)
          if (timeBasedHabitPoints === 0 && user.overallScore > 0) {
            // Subtract assessment scores to get habit points
            const assessmentScore = (user.fitnessScore || 0) + 
                                   (user.mentalScore || 0) + 
                                   (user.nutritionScore || 0) + 
                                   (user.lifeSkillsScore || 0);
            const challengePoints = user.challengeStats?.totalPoints || 0;
            timeBasedHabitPoints = Math.max(0, user.overallScore - assessmentScore - challengePoints);
          }
          
          timeBasedChallengePoints = user.challengeStats?.totalPoints || 0;
        } else {
          // For weekly/monthly, calculate from activity log
          const now = new Date();
          let startDate;
          
          switch (timeframe) {
            case 'weekly':
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case 'monthly':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
          }
          
          if (user.activity && Array.isArray(user.activity)) {
            user.activity.forEach(activity => {
              const activityDate = new Date(activity.timestamp);
              if (activityDate >= startDate) {
                if (activity.type === 'habit_completed') {
                  timeBasedHabitPoints += activity.points || 0;
                } else if (activity.type === 'challenge_completed') {
                  timeBasedChallengePoints += activity.points || 0;
                }
              }
            });
          }
        }
        
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

const nodemailer = require('nodemailer');

// Add this route to your existing users.js file
// POST /api/users/send-update-emails (Admin only)
router.post('/send-update-emails', async (req, res) => {
  try {
    const { adminKey } = req.body;
    
    // Simple admin authentication
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Find users with emails (optionally filter by last login)
    const users = await User.find({ 
      email: { $exists: true, $ne: '' }
      // Uncomment below to only email inactive users
      // lastLogin: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days ago
    });
    
    console.log(`Found ${users.length} users to email`);
    
    // Configure nodemailer
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    let emailsSent = 0;
    const errors = [];
    
    for (const user of users) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Vivify App Updates - Sync Your Performance Data',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                .cta-button { background: #f39c12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
                .feature-list { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
                .feature-list li { margin: 10px 0; }
                .username { background: #fff; padding: 10px; border-radius: 4px; font-weight: bold; color: #f39c12; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1 style="margin: 0; font-size: 2rem;">Vivify Performance Hub</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Major Updates & Data Sync Required</p>
              </div>
              
              <div class="content">
                <p>Hi <strong>${user.username}</strong>,</p>
                
                <p>We've been hard at work improving Vivify since you first signed up! The app now has some amazing new features:</p>
                
                <div class="feature-list">
                  <ul>
                    <li><strong>Real-time Leaderboards:</strong> See how you rank against other students and compete for the top spot</li>
                    <li><strong>Enhanced Habit Tracking:</strong> Build streaks, earn XP, and track your daily performance habits</li>
                    <li><strong>Performance Challenges:</strong> Join weekly and monthly challenges to push your limits</li>
                    <li><strong>Better Data Sync:</strong> Your progress now saves across all your devices</li>
                    <li><strong>Gamified Experience:</strong> Earn points, maintain streaks, and unlock achievements</li>
                  </ul>
                </div>
                
                <div style="background: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #856404;">⚠️ Action Required: Sync Your Data</h3>
                  <p style="margin-bottom: 0;">Your assessment results are currently saved locally on your device. We need you to log back in so we can sync them to our improved system and add them to the leaderboard!</p>
                </div>
                
                <p><strong>What you need to do:</strong></p>
                <ol>
                  <li>Click the login button below</li>
                  <li>Sign in with your existing credentials</li>
                  <li>Your assessment data will automatically sync</li>
                  <li>Check out your position on the new leaderboard!</li>
                </ol>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://vivify-app.netlify.app/login" class="cta-button">
                    Login to Vivify →
                  </a>
                </div>
                
                <div class="username">
                  <strong>Your Username:</strong> ${user.username}
                </div>
                
                <p>Once you log back in, you'll see:</p>
                <ul>
                  <li>Your assessment scores properly reflected in your overall performance rating</li>
                  <li>Where you rank among all users</li>
                  <li>New habits to build your daily routine</li>
                  <li>Challenges you can join to compete with others</li>
                </ul>
                
                <p>Questions about the updates or need help logging in? Just reply to this email and we'll help you out.</p>
                
                <p>Thanks for being part of the Vivify community!</p>
                
                <p>Best,<br>
                <strong>The Vivify Team</strong><br>
                <em>Building better habits, one day at a time</em></p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="font-size: 12px; color: #666; text-align: center;">
                  You're receiving this because you have a Vivify account. If you no longer want updates, you can ignore this email.
                </p>
              </div>
            </body>
            </html>
          `
        });
        
        emailsSent++;
        console.log(`✓ Email sent to ${user.username} (${user.email})`);
        
        // Rate limiting to avoid spam filters (1 email every 2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (emailError) {
        errors.push({ user: user.username, email: user.email, error: emailError.message });
        console.error(`✗ Failed to send to ${user.username}:`, emailError.message);
      }
    }
    
    console.log(`\nEmail campaign complete: ${emailsSent}/${users.length} sent successfully`);
    
    res.json({ 
      success: true,
      message: `Email campaign complete: ${emailsSent}/${users.length} emails sent successfully`,
      totalUsers: users.length,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error in bulk email send:', error);
    res.status(500).json({ error: 'Failed to send emails', details: error.message });
  }
});

module.exports = router;