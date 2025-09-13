// routes/teacher-api.js - API routes for teacher dashboard
const express = require('express');
const { authenticate, requireRole, canAccessStudent } = require('../middleware/auth-middleware');
const { User } = require('../models/User');
const router = express.Router();

// Get teacher's assigned students with wellbeing overview
router.get('/my-students', 
    authenticate, 
    requireRole(['teacher', 'admin']), 
    async (req, res) => {
        try {
            const teacher = req.user;
            
            // Get all student IDs teacher can access
            const studentIds = teacher.classPermissions
                .flatMap(permission => permission.studentIds);
                
            // Get students with basic wellbeing data
            const students = await User.find({
                _id: { $in: studentIds },
                role: 'student'
            }).select('username email studentData lastLogin')
            .populate('performanceScores'); // Assuming you'll create this reference
            
            // Format response for dashboard
            const studentSummaries = students.map(student => {
                // Get latest wellbeing scores from localStorage equivalent or database
                const performanceData = getStudentperformanceData(student._id); // You'll need to implement this
                
                return {
                    id: student._id,
                    name: student.username,
                    yearLevel: student.studentData?.yearLevel,
                    className: student.studentData?.schoolClass,
                    lastActive: student.lastLogin,
                    performanceStatus: calculateperformanceStatus(performanceData),
                    overallScore: performanceData?.scores?.overall || 0,
                    trends: calculateTrends(performanceData),
                    alerts: checkForAlerts(performanceData)
                };
            });
            
            res.json({ students: studentSummaries });
            
        } catch (error) {
            console.error('Error fetching teacher students:', error);
            res.status(500).json({ message: 'Error fetching student data.' });
        }
    }
);

// Get detailed student wellbeing data
router.get('/student/:studentId/wellbeing', 
    authenticate, 
    requireRole(['teacher', 'admin']),
    canAccessStudent,
    async (req, res) => {
        try {
            const { studentId } = req.params;
            
            // Get student privacy settings
            const student = await User.findById(studentId).select('studentData.privacySettings');
            const privacySettings = student?.studentData?.privacySettings;
            
            // Get student performance data based on privacy settings
            const performanceData = getStudentperformanceData(studentId);
            
            // Filter data based on privacy settings
            const filteredData = {
                overallStatus: calculateperformanceStatus(performanceData),
                lastUpdated: performanceData?.lastUpdated
            };
            
            if (privacySettings?.shareperformanceScores) {
                filteredData.scores = performanceData?.scores;
                filteredData.trends = calculateTrends(performanceData);
            }
            
            if (privacySettings?.shareActivityData) {
                filteredData.recentActivities = performanceData?.activities?.slice(-10);
                filteredData.streaks = performanceData?.streaks;
            }
            
            if (privacySettings?.shareAssessmentResults) {
                filteredData.assessmentResults = getRecentAssessments(studentId);
            }
            
            res.json({ performanceData: filteredData });
            
        } catch (error) {
            console.error('Error fetching student wellbeing:', error);
            res.status(500).json({ message: 'Error fetching student wellbeing data.' });
        }
    }
);

// Get class-wide analytics
router.get('/class-analytics', 
    authenticate, 
    requireRole(['teacher', 'admin']), 
    async (req, res) => {
        try {
            const teacher = req.user;
            const { classId, yearLevel } = req.query;
            
            // Find relevant class permissions
            let relevantPermissions = teacher.classPermissions;
            
            if (classId || yearLevel) {
                relevantPermissions = teacher.classPermissions.filter(permission => {
                    return (!classId || permission.className === classId) &&
                           (!yearLevel || permission.yearLevel === parseInt(yearLevel));
                });
            }
            
            const allStudentIds = relevantPermissions.flatMap(p => p.studentIds);
            
            // Calculate class-wide statistics
            const classAnalytics = await calculateClassAnalytics(allStudentIds);
            
            res.json({ analytics: classAnalytics });
            
        } catch (error) {
            console.error('Error fetching class analytics:', error);
            res.status(500).json({ message: 'Error fetching class analytics.' });
        }
    }
);

// Submit intervention note for student
router.post('/student/:studentId/intervention', 
    authenticate, 
    requireRole(['teacher', 'admin']),
    canAccessStudent,
    async (req, res) => {
        try {
            const { studentId } = req.params;
            const { note, type, followUpDate } = req.body;
            
            // Save intervention record
            const intervention = {
                studentId,
                teacherId: req.user._id,
                note,
                type, // 'check-in', 'referral', 'parent-contact', etc.
                followUpDate,
                createdAt: new Date()
            };
            
            // You'll need to create an Intervention model
            await saveIntervention(intervention);
            
            res.json({ message: 'Intervention recorded successfully.' });
            
        } catch (error) {
            console.error('Error recording intervention:', error);
            res.status(500).json({ message: 'Error recording intervention.' });
        }
    }
);

// Helper functions (you'll need to implement these based on your data structure)
function getStudentperformanceData(studentId) {
    // Implementation depends on how you're storing performance data
    // Could be from database, or from a separate collection
    // This might interface with your existing localStorage-based system
    return {}; // Placeholder
}

function calculateperformanceStatus(performanceData) {
    if (!performanceData?.scores) return 'unknown';
    
    const overall = performanceData.scores.overall;
    if (overall >= 80) return 'excellent';
    if (overall >= 60) return 'good';
    if (overall >= 40) return 'concerning';
    return 'needs_attention';
}

function calculateTrends(performanceData) {
    // Calculate trends over time
    return {
        physical: 'stable',
        mental: 'improving',
        nutrition: 'declining',
        lifeSkills: 'improving'
    };
}

function checkForAlerts(performanceData) {
    const alerts = [];
    
    if (performanceData?.scores?.mental < 30) {
        alerts.push({
            type: 'mental_health',
            severity: 'high',
            message: 'Low Focus & Resilience score detected'
        });
    }
    
    // Check for declining trends
    const daysSinceLastActivity = getDaysSinceLastActivity(performanceData);
    if (daysSinceLastActivity > 7) {
        alerts.push({
            type: 'engagement',
            severity: 'medium',
            message: 'Student hasn\'t engaged with platform in over a week'
        });
    }
    
    // Check assessment responses for concerning patterns
    if (performanceData?.recentAssessments) {
        const concerningResponses = performanceData.recentAssessments.filter(
            assessment => assessment.flagged || assessment.score < 20
        );
        if (concerningResponses.length > 0) {
            alerts.push({
                type: 'assessment_concern',
                severity: 'high',
                message: 'Concerning responses detected in recent assessments'
            });
        }
    }
    
    return alerts;
}

function calculateClassAnalytics(studentIds) {
    // This would calculate aggregate statistics for the class
    return {
        totalStudents: studentIds.length,
        activeStudents: 0, // Calculate from last activity
        averageperformanceScore: 0,
        trendsOverview: {
            improving: 0,
            stable: 0,
            declining: 0
        },
        alertSummary: {
            high: 0,
            medium: 0,
            low: 0
        },
        engagementMetrics: {
            dailyActiveUsers: 0,
            weeklyActiveUsers: 0,
            completedAssessments: 0
        }
    };
}

function getDaysSinceLastActivity(performanceData) {
    if (!performanceData?.lastActive) return 999;
    
    const lastActive = new Date(performanceData.lastActive);
    const now = new Date();
    return Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
}

function getRecentAssessments(studentId) {
    // Get recent assessment results for the student
    // This would interface with your assessment storage system
    return [];
}

async function saveIntervention(intervention) {
    // Save intervention to database
    // You might want to create an Intervention model for this
    console.log('Saving intervention:', intervention);
}

module.exports = router;