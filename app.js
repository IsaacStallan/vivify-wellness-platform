require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 

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
app.post('/auth/signup', async (req, res) => {
  try {
    console.log('=== SIGNUP ENDPOINT HIT ===');
    console.log('Request body:', req.body);
    console.log('Origin:', req.get('origin'));
    
    const { username, email, password, role, yearLevel, school } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    
    // For testing - return success without database operations
    console.log('Signup successful for:', username);
    
    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        username,
        email,
        role: role || 'student',
        school: school || 'Knox Grammar School',
        yearLevel: role === 'student' ? yearLevel : undefined
      },
      success: true,
      test: true // Indicates this is test mode
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
});

// Login route (add this after your signup route)
// Replace your current login route with this updated version:

app.post('/auth/login', async (req, res) => {
  try {
    console.log('=== LOGIN ENDPOINT HIT ===');
    console.log('Request body:', req.body);
    console.log('Origin:', req.get('origin'));
    
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    
    console.log('Login attempt for:', email);
    
    // Determine role based on email domain or specific emails for demo
    let userRole = 'student';
    let username = email.split('@')[0];
    
    // Demo teacher accounts - you can customize these for your Knox demo
    const teacherEmails = [
      'teacher@knox.nsw.edu.au',
      'teacher@gmail.com',
      'knox.teacher@gmail.com',
      'demo.teacher@gmail.com'
    ];
    
    const adminEmails = [
      'admin@knox.nsw.edu.au',
      'admin@gmail.com',
      'knox.admin@gmail.com'
    ];
    
    if (teacherEmails.includes(email.toLowerCase())) {
      userRole = 'teacher';
      username = 'Knox Teacher';
    } else if (adminEmails.includes(email.toLowerCase())) {
      userRole = 'admin';
      username = 'Knox Admin';
    }
    
    // Role-based redirect function
    const getRedirectUrl = (role) => {
      switch(role) {
        case 'teacher':
          return 'teacher-dashboard.html';
        case 'admin':
          return 'admin-dashboard.html';
        case 'student':
        default:
          return 'wellness-baseline-assessment.html';
      }
    };
    
    // Create token with role information
    const token = jwt.sign(
      { 
        email, 
        id: 'test-' + Date.now(),
        role: userRole,
        username: username
      }, 
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
    
    console.log(`Login successful for: ${username} (Role: ${userRole})`);
    
    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        id: 'test-' + Date.now(),
        email: email,
        username: username,
        role: userRole,
        school: 'Knox Grammar School',
        yearLevel: userRole === 'student' ? '10' : undefined
      },
      redirectTo: getRedirectUrl(userRole),
      success: true,
      test: true
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
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