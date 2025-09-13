const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/auth/signup - Register new user
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, school, yearLevel } = req.body;
        
        console.log('Signup attempt:', { username, email, school, yearLevel });
        
        // Validate required fields
        if (!username || !email || !password || !school || !yearLevel) {
            return res.status(400).json({ 
                error: 'All fields are required: username, email, password, school, yearLevel' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password, // Will be hashed by the pre-save hook
            school,
            yearLevel,
            role: 'student'
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '7d' }
        );

        console.log('User created successfully:', user.username);

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

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            error: 'Failed to create account',
            details: error.message 
        });
    }
});

// POST /api/auth/login - Login user
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
                fitnessMetrics: user.fitnessMetrics
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