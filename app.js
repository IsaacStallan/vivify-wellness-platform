require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs');
const User = require('./models/User');


const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting Vivify server...');
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set ✓' : 'Missing ✗',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set ✓' : 'Missing ✗'
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: ['https://vivify.au', 'https://www.vivify.au', 'https://vivifyeducation.netlify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// ROUTES REGISTERED IMMEDIATELY (before database connection)

// Health check
app.get('/health', (req, res) => {
  console.log('Health check accessed');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Vivify Student Wellness Platform',
    school: 'Knox Grammar School',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({
    message: 'Vivify Student Wellness Platform API',
    school: 'Knox Grammar School',
    timestamp: new Date().toISOString(),
    endpoints: ['/health', '/auth/signup', '/auth/login']
  });
});

// Signup route (directly in main file for now)
// Replace your current auth routes in app.js with these production-ready versions:

// Production signup route - saves to MongoDB
app.post('/auth/signup', async (req, res) => {
  try {
    console.log('=== PRODUCTION SIGNUP ===');
    console.log('Request body:', req.body);
    
    const { username, email, password, role, yearLevel, school, schoolCode, staffId, department } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
      return res.status(400).json({ message: 'Username already taken.' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user with all data
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: true, // Auto-verify for Knox
      role: role || 'student',
      school: school || 'Knox Grammar School',
      yearLevel: role === 'student' ? yearLevel : undefined,
      schoolCode: schoolCode || 'KNOX2024',
      staffId: staffId || undefined,
      department: department || undefined
    });
    
    await newUser.save();
    console.log('User created in database:', newUser.username, 'Role:', newUser.role);
    
    // Create JWT token
    const token = jwt.sign({ 
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }, process.env.JWT_SECRET || 'knox-vivify-secret', { 
      expiresIn: '24h' 
    });
    
    // Role-based redirect
    const getRedirectUrl = (role) => {
      switch(role) {
        case 'teacher': return 'teacher-dashboard.html';
        case 'admin': return 'admin-dashboard.html';
        case 'student':
        default: return 'wellness-baseline-assessment.html';
      }
    };
    
    return res.status(201).json({
      message: 'User registered successfully!',
      token: token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        school: newUser.school,
        yearLevel: newUser.yearLevel,
        department: newUser.department
      },
      redirectTo: getRedirectUrl(newUser.role),
      autoLogin: true
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
});

// Production login route - verifies against MongoDB
app.post('/auth/login', async (req, res) => {
  try {
    console.log('=== PRODUCTION LOGIN ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    
    // Find user in database
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    
    // Verify password against database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Role-based redirect
    const getRedirectUrl = (role) => {
      switch(role) {
        case 'teacher': return 'teacher-dashboard.html';
        case 'admin': return 'admin-dashboard.html';
        case 'student':
        default: return 'wellness-baseline-assessment.html';
      }
    };
    
    // Create JWT token
    const token = jwt.sign({ 
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }, process.env.JWT_SECRET || 'knox-vivify-secret', { 
      expiresIn: '24h' 
    });
    
    console.log(`Production login successful: ${user.username} (${user.role})`);
    
    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        school: user.school,
        yearLevel: user.yearLevel,
        department: user.department,
        lastLogin: user.lastLogin
      },
      redirectTo: getRedirectUrl(user.role),
      success: true
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
});

// Add API endpoint for teacher classes
app.get('/api/teacher/classes', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'knox-vivify-secret');
    const teacher = await User.findById(decoded.id);
    
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Teacher access required' });
    }
    
    res.json({ 
      classes: teacher.classes || [],
      teacherId: teacher._id,
      teacherName: teacher.username
    });
    
  } catch (error) {
    console.error('Teacher classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this to your app.js
app.post('/api/student/join-class', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'knox-vivify-secret');
    const student = await User.findById(decoded.id);
    
    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Student access required' });
    }
    
    const { classCode } = req.body;
    
    // Find teacher with this class code
    const teacher = await User.findOne({ 
      'classes.code': classCode.toUpperCase(),
      'classes.active': true 
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Invalid class code' });
    }
    
    const classToJoin = teacher.classes.find(c => c.code === classCode.toUpperCase());
    
    // Add student to class
    if (!classToJoin.students.includes(student._id.toString())) {
      classToJoin.students.push(student._id.toString());
      await teacher.save();
    }
    
    res.json({ 
      success: true, 
      className: classToJoin.name,
      teacher: teacher.username
    });
    
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add API endpoint to create classes
app.post('/api/teacher/create-class', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'knox-vivify-secret');
    const teacher = await User.findById(decoded.id);
    
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Teacher access required' });
    }
    
    const { name, subject, yearLevel } = req.body;
    
    // Generate class code
    const generateClassCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    const classCode = generateClassCode();
    
    const newClass = {
      id: Date.now().toString(),
      code: classCode,
      name,
      subject,
      yearLevel,
      students: [],
      createdAt: new Date(),
      active: true
    };
    
    if (!teacher.classes) teacher.classes = [];
    teacher.classes.push(newClass);
    
    await teacher.save();
    
    console.log('Class created in database:', newClass.name, 'Code:', classCode);
    
    res.json({ 
      success: true, 
      class: newClass,
      message: 'Class created successfully' 
    });
    
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Token verification endpoint for dashboard authentication
app.post('/auth/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ isValid: false, message: 'No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'knox-vivify-secret');
    
    // Find the actual user to ensure they still exist
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ isValid: false, message: 'User not found.' });
    }
    
    res.status(200).json({ 
      isValid: true, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        school: user.school,
        yearLevel: user.yearLevel
      }
    });
  } catch (error) {
    res.status(401).json({ isValid: false, message: 'Invalid token.' });
  }
});

// Database connection (happens after routes are registered)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      console.log('🏫 Database ready for Knox Grammar School');
      
      // TODO: Add full database functionality here later
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      console.log('⚠️ Running without database - basic functionality only');
    });
} else {
  console.log('⚠️ No MONGODB_URI found');
}

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.url,
    method: req.method,
    availableRoutes: ['/', '/health', '/auth/signup', '/auth/login']
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Vivify server running on port', PORT);
  console.log('🔗 Health check: http://localhost:' + PORT + '/health');
  console.log('📝 Signup: http://localhost:' + PORT + '/auth/signup');
  console.log('✅ Routes registered and ready');
});

module.exports = app;