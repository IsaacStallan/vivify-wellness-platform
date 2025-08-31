require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
  origin: ['https://vivify.au', 'https://www.vivify.au', 'http://localhost:3000'],
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

// Test login route
app.post('/auth/login', (req, res) => {
  console.log('Login endpoint hit:', req.body);
  res.json({
    message: 'Login endpoint working',
    test: true
  });
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