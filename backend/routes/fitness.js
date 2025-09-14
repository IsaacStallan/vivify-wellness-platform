const express = require('express');
const router = express.Router();
const Workout = require('../models/workout.js');
const User = require('../models/User');

// POST /api/fitness/workouts - Submit a new workout
router.post('/workouts', async (req, res) => {
    try {
        const { userId, workoutType, reps, points, duration, intensity, equipment } = req.body;
        
        console.log('Received workout submission:', req.body);
        
        // Validate required fields
        if (!userId || !workoutType) {
            return res.status(400).json({ 
                error: 'Missing required fields: userId and workoutType are required' 
            });
        }
        
        // Create new workout entry
        const workout = new Workout({
            userId,
            workoutType,
            reps: reps || 0,
            points: points || 20,
            duration: duration || 0,
            intensity: intensity || 'moderate',
            equipment: equipment || 'none',
            timestamp: new Date(),
            category: 'physical',
            description: `Completed ${workoutType} workout`
        });
        
        await workout.save();
        
        // Update user's fitness metrics
        await updateUserFitnessMetrics(userId);
        
        res.status(201).json({
            success: true,
            workout: workout,
            message: 'Workout logged successfully'
        });
        
    } catch (error) {
        console.error('Error saving workout:', error);
        res.status(500).json({ 
            error: 'Failed to save workout',
            details: error.message 
        });
    }
});

// GET /api/fitness/leaderboard - Get fitness leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        console.log('Fetching fitness leaderboard...');
        
        // Get all students with their fitness data
        const users = await User.find({ role: 'student' }).select('username school yearLevel');
        const leaderboard = [];
        
        for (const user of users) {
            const userWorkouts = await Workout.find({ 
                userId: user._id.toString(),
                category: 'physical'
            }).sort({ timestamp: -1 });
            
            const fitnessMetrics = calculateFitnessMetrics(userWorkouts);
            
            leaderboard.push({
                userId: user._id.toString(),
                username: user.username,
                school: user.school || 'Unknown School',
                yearLevel: user.yearLevel || 'Year 10',
                fitnessScore: fitnessMetrics.fitnessScore,
                totalWorkouts: fitnessMetrics.totalWorkouts,
                thisWeekWorkouts: fitnessMetrics.thisWeekWorkouts,
                streak: fitnessMetrics.streak
            });
        }
        
        // Sort by fitness score (highest first)
        leaderboard.sort((a, b) => (b.fitnessScore || 0) - (a.fitnessScore || 0));
        
        console.log(`Returning leaderboard with ${leaderboard.length} users`);
        
        res.json(leaderboard);
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ 
            error: 'Failed to fetch leaderboard',
            details: error.message 
        });
    }
});

// POST /api/fitness/sync - Sync multiple workouts
router.post('/sync', async (req, res) => {
    try {
        const { workouts } = req.body;
        
        console.log(`Syncing ${workouts?.length || 0} workouts...`);
        
        if (!workouts || !Array.isArray(workouts)) {
            return res.status(400).json({ 
                error: 'Invalid sync data: workouts array required' 
            });
        }
        
        const syncedWorkouts = [];
        
        for (const workoutData of workouts) {
            try {
                const workout = new Workout({
                    userId: workoutData.userId,
                    workoutType: workoutData.workoutType,
                    reps: workoutData.reps || 0,
                    points: workoutData.points || 20,
                    timestamp: new Date(workoutData.timestamp),
                    category: 'physical',
                    description: `Synced ${workoutData.workoutType} workout`
                });
                
                await workout.save();
                syncedWorkouts.push(workout);
                
                // Update user metrics
                await updateUserFitnessMetrics(workoutData.userId);
                
            } catch (error) {
                console.error('Error syncing individual workout:', error);
            }
        }
        
        res.json({
            success: true,
            syncedCount: syncedWorkouts.length,
            totalRequested: workouts.length,
            message: `Successfully synced ${syncedWorkouts.length} workouts`
        });
        
    } catch (error) {
        console.error('Error syncing workouts:', error);
        res.status(500).json({ 
            error: 'Failed to sync workouts',
            details: error.message 
        });
    }
});

// GET /api/fitness/schools - Get list of schools for registration dropdown
router.get('/schools', async (req, res) => {
    try {
        console.log('Fetching schools list...');
        
        // Get distinct schools from existing users
        const schools = await User.distinct('school', { role: 'student' });
        
        // Add some common Australian schools/universities if database is empty
        const defaultSchools = [
            'Knox Grammar School',
            'Sydney Grammar School', 
            'Melbourne Grammar School',
            'Brisbane Grammar School',
            'University of Sydney',
            'University of Melbourne',
            'University of Queensland',
            'Australian National University',
            'UNSW Sydney',
            'Monash University',
            'University of Western Australia',
            'University of Adelaide'
        ];
        
        // Combine and deduplicate
        const allSchools = [...new Set([...schools, ...defaultSchools])].sort();
        
        res.json({
            success: true,
            schools: allSchools,
            count: allSchools.length
        });
        
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).json({ 
            error: 'Failed to fetch schools',
            details: error.message 
        });
    }
});

// GET /api/fitness/stats - Get platform-wide statistics
router.get('/stats', async (req, res) => {
    try {
        console.log('Fetching platform statistics...');
        
        // Get current week start date
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        // Get today start date
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        // Parallel queries for better performance
        const [
            totalStudents,
            activeThisWeek,
            totalWorkoutsThisWeek,
            totalWorkoutsToday,
            totalWorkoutsAllTime,
            activeStreaks,
            topSchools
        ] = await Promise.all([
            // Total registered students
            User.countDocuments({ role: 'student', isActive: true }),
            
            // Students who worked out this week
            Workout.distinct('userId', { 
                timestamp: { $gte: weekStart },
                category: 'physical'
            }).then(userIds => userIds.length),
            
            // Total workouts this week
            Workout.countDocuments({ 
                timestamp: { $gte: weekStart },
                category: 'physical'
            }),
            
            // Total workouts today
            Workout.countDocuments({ 
                timestamp: { $gte: todayStart },
                category: 'physical'
            }),
            
            // Total workouts all time
            Workout.countDocuments({ category: 'physical' }),
            
            // Users with active streaks (worked out in last 2 days)
            User.countDocuments({ 
                'fitnessMetrics.streak': { $gt: 0 },
                'fitnessMetrics.lastWorkout': { 
                    $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) 
                }
            }),
            
            // Top 5 most active schools
            User.aggregate([
                { $match: { role: 'student', isActive: true } },
                { $group: { 
                    _id: '$school', 
                    studentCount: { $sum: 1 },
                    avgFitnessScore: { $avg: '$fitnessMetrics.fitnessScore' }
                }},
                { $sort: { studentCount: -1 } },
                { $limit: 5 }
            ])
        ]);
        
        // Calculate some derived stats
        const participationRate = totalStudents > 0 ? 
            Math.round((activeThisWeek / totalStudents) * 100) : 0;
        
        const avgWorkoutsPerActiveUser = activeThisWeek > 0 ? 
            Math.round((totalWorkoutsThisWeek / activeThisWeek) * 10) / 10 : 0;
        
        const stats = {
            students: {
                total: totalStudents,
                activeThisWeek: activeThisWeek,
                participationRate: participationRate
            },
            workouts: {
                todayTotal: totalWorkoutsToday,
                thisWeekTotal: totalWorkoutsThisWeek,
                allTimeTotal: totalWorkoutsAllTime,
                avgPerActiveUser: avgWorkoutsPerActiveUser
            },
            engagement: {
                activeStreaks: activeStreaks,
                streakParticipationRate: totalStudents > 0 ? 
                    Math.round((activeStreaks / totalStudents) * 100) : 0
            },
            schools: {
                topSchools: topSchools,
                totalSchools: await User.distinct('school').then(schools => schools.length)
            },
            performance: {
                avgFitnessScore: await User.aggregate([
                    { $match: { role: 'student', isActive: true } },
                    { $group: { _id: null, avg: { $avg: '$fitnessMetrics.fitnessScore' } } }
                ]).then(result => result[0] ? Math.round(result[0].avg) : 0)
            }
        };
        
        console.log('Platform stats calculated:', {
            totalStudents,
            activeThisWeek,
            totalWorkoutsToday,
            participationRate
        });
        
        res.json({
            success: true,
            stats: stats,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        res.status(500).json({ 
            error: 'Failed to fetch platform statistics',
            details: error.message 
        });
    }
});

// Helper function to calculate fitness metrics
function calculateFitnessMetrics(workouts) {
    const totalWorkouts = workouts.length;
    
    // Calculate this week's workouts
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekWorkouts = workouts.filter(workout => 
        new Date(workout.timestamp) >= weekStart
    ).length;
    
    // Calculate streak
    const streak = calculateStreak(workouts);
    
    // Calculate average workouts per week
    const avgWorkoutsPerWeek = calculateAvgWorkoutsPerWeek(workouts);
    
    // Calculate fitness score (0-100)
    const weeklyScore = Math.min(40, (thisWeekWorkouts / 4) * 40);
    const streakScore = Math.min(35, streak * 2.5);
    const consistencyScore = Math.min(25, (avgWorkoutsPerWeek / 4) * 25);
    const fitnessScore = Math.round(weeklyScore + streakScore + consistencyScore);
    
    return {
        totalWorkouts,
        thisWeekWorkouts,
        streak,
        fitnessScore,
        avgWorkoutsPerWeek
    };
}

// Helper function to calculate workout streak
function calculateStreak(workouts) {
    if (workouts.length === 0) return 0;
    
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(currentDate.getTime() - (i * 24 * 60 * 60 * 1000));
        const hasWorkout = sortedWorkouts.some(workout => {
            const workoutDate = new Date(workout.timestamp);
            workoutDate.setHours(0, 0, 0, 0);
            return workoutDate.getTime() === checkDate.getTime();
        });
        
        if (hasWorkout) {
            streak++;
        } else if (streak > 0) {
            break;
        }
    }
    
    return streak;
}

// Helper function to calculate average workouts per week
function calculateAvgWorkoutsPerWeek(workouts) {
    if (workouts.length === 0) return 0;
    
    const oldestWorkout = new Date(workouts[workouts.length - 1].timestamp);
    const now = new Date();
    const weeksDiff = Math.max(1, (now - oldestWorkout) / (7 * 24 * 60 * 60 * 1000));
    
    return Math.round((workouts.length / weeksDiff) * 10) / 10;
}

// Helper function to update user fitness metrics
async function updateUserFitnessMetrics(userId) {
    try {
        const userWorkouts = await Workout.find({ 
            userId: userId,
            category: 'physical'
        }).sort({ timestamp: -1 });
        
        const metrics = calculateFitnessMetrics(userWorkouts);
        
        // Update user document with latest metrics
        await User.findByIdAndUpdate(userId, {
            $set: {
                'fitnessMetrics.totalWorkouts': metrics.totalWorkouts,
                'fitnessMetrics.thisWeekWorkouts': metrics.thisWeekWorkouts,
                'fitnessMetrics.streak': metrics.streak,
                'fitnessMetrics.fitnessScore': metrics.fitnessScore,
                'fitnessMetrics.lastUpdated': new Date()
            }
        });
        
    } catch (error) {
        console.error('Error updating user fitness metrics:', error);
    }
}

module.exports = router;