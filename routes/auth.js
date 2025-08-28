// auth.js - Enhanced signup and login with roles
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, School } = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth-middleware');

const router = express.Router();

// Enhanced signup with role selection
router.post('/signup', async (req, res) => {
    try {
        let { username, email, password, role = 'student', schoolCode, yearLevel, className } = req.body;

        // Validate inputs
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate role-specific requirements
        if (role === 'student' && (!yearLevel || yearLevel < 7 || yearLevel > 12)) {
            return res.status(400).json({ message: 'Valid year level (7-12) required for students.' });
        }

        if ((role === 'teacher' || role === 'admin') && !schoolCode) {
            return res.status(400).json({ message: 'School code required for teachers and admins.' });
        }

        // Find school if required
        let school = null;
        if (role !== 'student' || schoolCode) {
            school = await School.findOne({ schoolCode });
            if (!school) {
                return res.status(400).json({ message: 'Invalid school code.' });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email: email.toLowerCase() }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user object
        const userData = {
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            schoolId: school?._id
        };

        // Add role-specific data
        if (role === 'student') {
            userData.studentData = {
                yearLevel,
                schoolClass: className
            };
        }

        const user = new User(userData);
        await user.save();

        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.'
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Enhanced login with role-based redirects
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
            .populate('schoolId');
            
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Create token with role information
        const token = jwt.sign({ 
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId?._id
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Role-based redirect
        let redirectTo = '/dashboard.html';
        if (user.role === 'teacher') {
            redirectTo = '/teacher-dashboard.html';
        } else if (user.role === 'admin' || user.role === 'school_admin') {
            redirectTo = '/admin-dashboard.html';
        }

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                school: user.schoolId?.name
            },
            redirectTo
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Get user profile with role-specific data
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('schoolId')
            .select('-password');
            
        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                school: user.schoolId,
                studentData: user.studentData,
                classPermissions: user.classPermissions
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Error fetching profile data.' });
    }
});

// Admin route to assign teacher permissions
router.post('/assign-teacher-permissions', 
    authenticate, 
    requireRole(['admin', 'school_admin']), 
    async (req, res) => {
        try {
            const { teacherId, classPermissions } = req.body;
            
            const teacher = await User.findById(teacherId);
            if (!teacher || teacher.role !== 'teacher') {
                return res.status(400).json({ message: 'Invalid teacher ID.' });
            }
            
            // Verify all students belong to the same school
            const studentIds = classPermissions.flatMap(cp => cp.studentIds);
            const students = await User.find({
                _id: { $in: studentIds },
                schoolId: req.user.schoolId
            });
            
            if (students.length !== studentIds.length) {
                return res.status(400).json({ message: 'Some students not found or not in your school.' });
            }
            
            teacher.classPermissions = classPermissions;
            await teacher.save();
            
            res.json({ message: 'Teacher permissions updated successfully.' });
            
        } catch (error) {
            console.error('Permission assignment error:', error);
            res.status(500).json({ message: 'Error updating teacher permissions.' });
        }
    }
);

module.exports = router;