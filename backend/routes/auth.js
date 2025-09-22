const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/auth/signup - Register new user (with enhanced debugging)
router.post('/signup', async (req, res) => {
    try {
        console.log('=== SIGNUP REQUEST START ===');
        console.log('Request body:', req.body);
        
        const { username, email, password, school, yearLevel } = req.body;
        
        console.log('Extracted fields:', { username, email, school, yearLevel, hasPassword: !!password });
        
        // Validate required fields
        if (!username || !email || !password || !school || !yearLevel) {
            console.log('❌ Validation failed - missing fields');
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required: username, email, password, school, yearLevel',
                received: { username: !!username, email: !!email, password: !!password, school: !!school, yearLevel: !!yearLevel }
            });
        }

        console.log('✅ Field validation passed');

        // Check if user already exists
        console.log('🔍 Checking for existing user...');
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            console.log('❌ User already exists:', existingUser.email === email ? 'email' : 'username');
            return res.status(400).json({ 
                success: false,
                error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
            });
        }

        console.log('✅ No existing user found');

        // Create new user
        console.log('👤 Creating new user...');
        const user = new User({
            username,
            email,
            password, // Will be hashed by the pre-save hook
            school,
            yearLevel,
            role: 'student'
        });

        console.log('💾 Saving user to database...');
        await user.save();
        console.log('✅ User saved successfully with ID:', user._id);

        // Generate JWT token
        console.log('🔑 Generating JWT token...');
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '7d' }
        );
        console.log('✅ JWT token generated');

        console.log('🎉 User created successfully:', user.username);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                school: user.school,
                yearLevel: user.yearLevel
            }
        });

        console.log('=== SIGNUP REQUEST SUCCESS ===');

    } catch (error) {
        console.log('=== SIGNUP REQUEST ERROR ===');
        console.error('❌ Signup error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({ 
            success: false,
            error: 'Failed to create account',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Replace your existing login route in auth.js with this:
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt for:', email);

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Update login info
        await user.updateLoginInfo();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '7d' }
        );

        console.log('Login successful:', user.username);
        
        // FIXED: Check if user has completed baseline assessment
        const hasCompletedBaseline = user.performanceData?.hasCompletedBaseline || false;
        console.log('Has completed baseline:', hasCompletedBaseline);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                school: user.school,
                yearLevel: user.yearLevel,
                hasCompletedBaseline: hasCompletedBaseline, // ADDED: This is the key field
                performanceData: user.performanceData
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Login failed',
            details: error.message 
        });
    }
});

// GET /api/auth/profile - Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password') // Don't send password
            .populate('fitnessMetrics');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                school: user.school,
                yearLevel: user.yearLevel,
                fitnessMetrics: user.fitnessMetrics,
                profile: user.profile,
                performanceData: user.performanceData
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch profile',
            details: error.message 
        });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        
        // Don't allow updating sensitive fields
        delete updates.password;
        delete updates.email;
        delete updates._id;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            error: 'Failed to update profile',
            details: error.message 
        });
    }
});

// Add this route to your auth.js file if you haven't already:
// POST /api/auth/performance-baseline - Save performance baseline data (FIXED VERSION)
router.post('/performance-baseline', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const performanceData = req.body;
        
        console.log('=== PERFORMANCE BASELINE SAVE ===');
        console.log('User ID:', userId);
        console.log('Raw performance data:', JSON.stringify(performanceData, null, 2));
        console.log('Calculated scores:', performanceData.calculatedScores);
        
        // Extract the actual scores from the request
        const scores = performanceData.calculatedScores || {};
        
        console.log('Extracted scores:', {
            physical: scores.physical,
            mental: scores.mental,
            nutrition: scores.nutrition,
            lifeSkills: scores.lifeSkills,
            overall: scores.overall
        });
        
        // Update user with DIRECT field mapping (matching your MongoDB schema)
        const updateData = {
            // Direct score fields (matching MongoDB structure)
            fitnessScore: scores.physical || 0,
            mentalScore: scores.mental || 0,
            nutritionScore: scores.nutrition || 0,
            lifeSkillsScore: scores.lifeSkills || 0,
            overallScore: scores.overall || 0,
            
            // Baseline completion tracking
            baselineCompleted: true,
            
            // Store the structured performance data for potential future use
            'performanceData.hasCompletedBaseline': true,
            'performanceData.baselineCompletedAt': new Date(),
            'performanceData.physicalFitness': performanceData.physicalFitness,
            'performanceData.academicPerformance': performanceData.academicPerformance,
            'performanceData.mentalWellbeing': performanceData.mentalWellbeing,
            'performanceData.socialSkills': performanceData.socialSkills
        };
        
        console.log('Update data being sent to MongoDB:', updateData);
        
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            console.log('❌ User not found for ID:', userId);
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        console.log('✅ Performance data saved successfully');
        console.log('Updated user scores:', {
            fitnessScore: user.fitnessScore,
            mentalScore: user.mentalScore,
            nutritionScore: user.nutritionScore,
            lifeSkillsScore: user.lifeSkillsScore,
            overallScore: user.overallScore,
            baselineCompleted: user.baselineCompleted
        });

        res.json({
            success: true,
            message: 'Performance baseline saved successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                school: user.school,
                yearLevel: user.yearLevel,
                hasCompletedBaseline: user.performanceData?.hasCompletedBaseline || false,
                baselineCompleted: user.baselineCompleted,
                scores: {
                    fitness: user.fitnessScore,
                    mental: user.mentalScore,
                    nutrition: user.nutritionScore,
                    lifeSkills: user.lifeSkillsScore,
                    overall: user.overallScore
                },
                performanceData: user.performanceData
            }
        });

    } catch (error) {
        console.error('❌ Performance data save error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to save performance data',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

module.exports = router;