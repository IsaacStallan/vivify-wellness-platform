// Add this auth management script to ALL your pages
// Put this at the TOP of your JavaScript, before any other auth checks

class AuthManager {
    static AUTH_TOKEN_KEY = 'authToken';
    static USER_LOGGED_IN_KEY = 'userLoggedIn';
    static USER_PROFILE_KEY = 'userProfile';
    static USERNAME_KEY = 'username';

    // Check if user is authenticated
    static isAuthenticated() {
        const authToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
        const userLoggedIn = localStorage.getItem(this.USER_LOGGED_IN_KEY);
        const userProfile = localStorage.getItem(this.USER_PROFILE_KEY);
        
        console.log('Auth Check:', {
            hasAuthToken: !!authToken,
            userLoggedIn: userLoggedIn,
            hasUserProfile: !!userProfile
        });
        
        // User is authenticated if they have either an auth token OR userLoggedIn is true
        return !!(authToken || userLoggedIn === 'true') && !!userProfile;
    }

    // Set authentication state
    static setAuthenticated(userData) {
        localStorage.setItem(this.AUTH_TOKEN_KEY, userData.token || 'temp_token');
        localStorage.setItem(this.USER_LOGGED_IN_KEY, 'true');
        localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(userData.profile || userData));
        localStorage.setItem(this.USERNAME_KEY, userData.username || userData.name);
        
        console.log('Auth Set:', userData);
    }

    // Clear authentication state
    static clearAuthentication() {
        localStorage.removeItem(this.AUTH_TOKEN_KEY);
        localStorage.removeItem(this.USER_LOGGED_IN_KEY);
        localStorage.removeItem(this.USER_PROFILE_KEY);
        localStorage.removeItem(this.USERNAME_KEY);
        
        console.log('Auth Cleared');
    }

    // Get current user data
    static getCurrentUser() {
        if (!this.isAuthenticated()) return null;
        
        try {
            return JSON.parse(localStorage.getItem(this.USER_PROFILE_KEY));
        } catch (error) {
            console.error('Error parsing user profile:', error);
            return null;
        }
    }

    // Update UI based on auth state
    static updateUIForAuthState() {
        const isLoggedIn = this.isAuthenticated();
        
        console.log('Updating UI for auth state:', isLoggedIn);
        
        // Login/Signup links
        const loginLink = document.getElementById('loginLink') || document.getElementById('login-link');
        const signupLink = document.getElementById('signupLink') || document.getElementById('signup-link');
        
        if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'inline';
        if (signupLink) signupLink.style.display = isLoggedIn ? 'none' : 'inline';
        
        // Dashboard/Profile/Logout links
        const dashboardLink = document.getElementById('dashboardLink') || document.getElementById('dashboard-link');
        const profileLink = document.getElementById('profileLink') || document.getElementById('profile-link');
        const logoutLink = document.getElementById('logoutLink') || document.getElementById('logout-link');
        
        if (dashboardLink) {
            dashboardLink.style.display = isLoggedIn ? 'inline' : 'none';
            dashboardLink.classList.toggle('hidden', !isLoggedIn);
        }
        if (profileLink) {
            profileLink.style.display = isLoggedIn ? 'inline' : 'none';
            profileLink.classList.toggle('hidden', !isLoggedIn);
        }
        if (logoutLink) {
            logoutLink.style.display = isLoggedIn ? 'inline' : 'none';
            logoutLink.classList.toggle('hidden', !isLoggedIn);
        }
        
        // Update hero sections if they exist
        const heroSection = document.getElementById('hero-section');
        const welcomeSection = document.getElementById('welcome-section');
        const ctaSection = document.getElementById('cta-section');
        
        if (heroSection && welcomeSection) {
            if (isLoggedIn) {
                heroSection.classList.add('hidden');
                welcomeSection.classList.remove('hidden');
                if (ctaSection) ctaSection.style.display = 'none';
            } else {
                heroSection.classList.remove('hidden');
                welcomeSection.classList.add('hidden');
                if (ctaSection) ctaSection.style.display = 'block';
            }
        }
        
        return isLoggedIn;
    }

    // Set up logout functionality
    static setupLogoutHandler() {
        const logoutLink = document.getElementById('logoutLink') || document.getElementById('logout-link');
        
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    AuthManager.clearAuthentication();
                    window.location.href = 'index.html';
                }
            });
        }
    }
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, checking auth state...');
    
    // Wait a bit for all scripts to load
    setTimeout(() => {
        const isLoggedIn = AuthManager.updateUIForAuthState();
        AuthManager.setupLogoutHandler();
        
        console.log('Auth initialization complete. Logged in:', isLoggedIn);
    }, 100);
});

// Replace your existing auth checks with this:
// REMOVE these lines from your existing scripts:
// const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
// const authToken = localStorage.getItem('authToken');
// 
// REPLACE with:
// const isLoggedIn = AuthManager.isAuthenticated();

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
            return 'performance-baseline-assessment.html';
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
                    return 'performance-baseline-assessment.html';
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