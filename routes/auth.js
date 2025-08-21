const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const validator = require('validator');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

// Helper to create JWT token
const createToken = (payload, expiresIn = '1d') => {
    return jwt.sign(
        payload, 
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn }
    );
};

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Middleware to serve static files
router.use(express.static(path.join(__dirname, '../public')));

// Serve static pages
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Signup route
router.post('/signup', async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // Validate inputs
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Email validation
        email = validator.normalizeEmail(email);
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email address.' });
        }

        // Password validation
        if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters, include an uppercase letter, and a number.' 
            });
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
            emailVerified: false,
            verificationToken: crypto.randomBytes(32).toString('hex')
        });

        await newUser.save();

        // Create verification token
        const verificationToken = createToken(
            { id: newUser._id, token: newUser.verificationToken },
            '7d'
        );

        // Generate verification URL
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const verificationUrl = `${baseUrl}/auth/verify-email/${verificationToken}`;

        // Send verification email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Vivify Account',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #f39c12;">Welcome to Vivify!</h2>
                    <p>Hi ${username},</p>
                    <p>Thanks for signing up! Please verify your email to access all features of our student wellness platform.</p>
                    <a href="${verificationUrl}" style="display: inline-block; background-color: #f39c12; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>${verificationUrl}</p>
                    <p>This link will expire in 7 days.</p>
                    <p>Best regards,<br>The Vivify Team</p>
                </div>
            `
        });

        return res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Email verification route
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user
        const user = await User.findOne({ 
            _id: decoded.id,
            verificationToken: decoded.token
        });

        if (!user) {
            return res.redirect('/login?error=invalid-verification');
        }

        // Mark email as verified
        user.emailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Redirect to login page with success message
        res.redirect('/login?message=verified');
    } catch (error) {
        console.error('Email verification error:', error);
        res.redirect('/login?error=verification-failed');
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

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in.' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Create and send JWT token
        const token = createToken({ 
            id: user._id,
            username: user.username,
            email: user.email
        });

        // Return success response
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            redirectTo: '/dashboard.html'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Password reset request route
router.post('/reset-password-request', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // For security reasons, we don't indicate if the email exists
        if (!user) {
            return res.status(200).json({ 
                message: 'If your email exists in our system, you will receive password reset instructions.' 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour
        
        // Save token to user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetTokenExpiry;
        await user.save();
        
        // Generate reset URL
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const resetUrl = `${baseUrl}/auth/reset-password/${resetToken}`;
        
        // Send reset email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Vivify Password',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #f39c12;">Reset Your Password</h2>
                    <p>Hello,</p>
                    <p>You requested a password reset for your Vivify account. Click the button below to set a new password:</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #f39c12; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>${resetUrl}</p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this reset, please ignore this email or contact support.</p>
                    <p>Best regards,<br>The Vivify Team</p>
                </div>
            `
        });

        return res.status(200).json({ 
            message: 'If your email exists in our system, you will receive password reset instructions.' 
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Reset password page
router.get('/reset-password/:token', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reset-password.html'));
});

// Reset password processing
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        // Validate password
        if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters, include an uppercase letter, and a number.' 
            });
        }
        
        // Find user by reset token and check expiry
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }
        
        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();
        
        // Return success response
        res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login.html');
});

// Protected route example
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user (excluding password)
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Return user data
        res.status(200).json({ user });
    } catch (error) {
        console.error('User profile error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Token verification endpoint - used by frontend to check if token is valid
router.post('/verify-token', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ isValid: false, message: 'No token provided.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Return validation result
        res.status(200).json({ 
            isValid: true, 
            userId: decoded.id,
            username: decoded.username
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(403).json({ isValid: false, message: 'Invalid or expired token.' });
    }
});

module.exports = router;
