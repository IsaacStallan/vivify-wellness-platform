const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');

const router = express.Router();

const getRedirectUrl = (userRole) => {
    switch(userRole) {
        case 'admin':
            return 'admin-dashboard.html';
        case 'teacher':
            return 'teacher-dashboard.html';
        case 'student':
        default:
            return 'wellness-baseline-assessment.html';
    }
};

// Helper to create JWT token
const createToken = (payload, expiresIn = '8h') => {
    return jwt.sign(
        payload, 
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn }
    );
};

// Add this as a temporary test route in your auth.js file
// Put this BEFORE your existing signup route

router.post('/test', (req, res) => {
    console.log('Test route hit successfully!');
    console.log('Request body:', req.body);
    res.json({ 
        success: true, 
        message: 'Auth routes are working!',
        body: req.body 
    });
});

// Also add this simple signup test that doesn't require database
router.post('/signup-test', async (req, res) => {
    try {
        console.log('Signup test route hit');
        console.log('Request body:', req.body);
        
        const { username, email, password, role } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Skip database for now - just return success
        res.status(201).json({
            message: 'Test signup successful!',
            user: { username, email, role: role || 'student' },
            test: true
        });
        
    } catch (error) {
        console.error('Test signup error:', error);
        res.status(500).json({ message: 'Test signup failed: ' + error.message });
    }
});

// Signup route - REPLACE YOUR CURRENT SIGNUP ROUTE WITH THIS
router.post('/signup', async (req, res) => {
    try {
        // Add middleware debug logging
        console.log('Request received at /auth/signup');
        console.log('req.body exists:', !!req.body);
        console.log('req.body type:', typeof req.body);
        console.log('Raw request body:', req.body);
        
        // Check if body exists and is an object
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'Invalid request body.' });
        }
        
        // Explicitly declare variables to avoid hoisting issues
        const username = req.body.username || '';
        const userEmail = req.body.email || '';
        const password = req.body.password || '';
        const role = req.body.role || 'student';
        const yearLevel = req.body.yearLevel;
        const schoolCode = req.body.schoolCode;
        
        console.log('Extracted variables:', { username, userEmail, role, yearLevel, schoolCode });

        // Basic validation
        if (!username || !userEmail || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters.' });
        }

        // Email validation
        const email = validator.normalizeEmail(userEmail);
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email address.' });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already in use.' });
            }
            return res.status(400).json({ message: 'Username already taken.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            emailVerified: true,
            role: role || 'student',
            school: 'Knox Grammar School',
            yearLevel: role === 'student' ? yearLevel : undefined
        });

        await newUser.save();
        console.log('User created successfully:', newUser.username, 'Role:', newUser.role);

        // Auto-login for development
        const token = createToken({ 
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        });

        return res.status(201).json({
            message: 'User registered successfully!',
            token: token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                school: 'Knox Grammar School'
            },
            autoLogin: true
        });
    } catch (error) {
        console.error('Signup error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Server error: ' + error.message
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Skip email verification check for development
        // if (!user.emailVerified) {
        //     return res.status(401).json({ message: 'Please verify your email before logging in.' });
        // }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create JWT token
        const token = createToken({ 
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role || 'student'
        });

        console.log('Login successful for:', user.username);

        // Role-based redirect logic
        const getRedirectUrl = (userRole) => {
            switch(userRole) {
                case 'admin':
                    return 'admin-dashboard.html';
                case 'teacher':
                    return 'Dashboard.html';
                case 'student':
                default:
                    return 'wellness-baseline-assessment.html';
            }
        };

        // Return success response
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role || 'student',
                school: user.school || 'Knox Grammar School',
                yearLevel: user.yearLevel,
                emailVerified: user.emailVerified
            },
            redirectTo: getRedirectUrl(user.role || 'student')  // Role-based redirect
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Get user profile
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided.' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.status(200).json({ user });
    } catch (error) {
        console.error('User profile error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Token verification
router.post('/verify-token', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ isValid: false, message: 'No token provided.' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        res.status(200).json({ 
            isValid: true, 
            userId: decoded.id,
            username: decoded.username
        });
    } catch (error) {
        res.status(403).json({ isValid: false, message: 'Invalid or expired token.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router;