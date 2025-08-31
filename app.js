require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting Vivify server...');
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set ✓' : 'Missing ✗',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set ✓' : 'Missing ✗'
});

// Basic middleware first
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: ['https://vivify.au', 'https://www.vivify.au', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Health check route (before database connection)
app.get('/health', (req, res) => {
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

// Add this after your health check route
app.post('/auth/signup', async (req, res) => {
  try {
    console.log('Signup attempt:', req.body);
    
    const { username, email, password, role } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    // For now, return success without database save (for testing)
    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        username,
        email,
        role: role || 'student',
        school: 'Knox Grammar School'
      },
      success: true
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Simple test route for debugging
app.post('/auth/signup', (req, res) => {
  console.log('Signup endpoint hit!');
  console.log('Request body:', req.body);
  res.json({
    success: true,
    message: 'Basic signup endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// Database connection with proper error handling
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      
      // Only import and register routes AFTER database connection
      try {
        const authRoutes = require('./routes/auth');
        const User = require('./models/User');
        
        // Now register the full auth routes
        app.use('/auth', authRoutes);
        
        console.log('🏫 Full Vivify app ready for Knox Grammar School');
      } catch (importError) {
        console.error('❌ Error importing routes/models:', importError);
      }
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      console.log('⚠️ Running in basic mode without database functionality');
    });
} else {
  console.log('⚠️ No MONGODB_URI found, running in basic mode');
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.url);
  res.status(404).json({ message: 'Endpoint not found: ' + req.url });
});

// Update graceful shutdown to use modern syntax
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  await mongoose.connection.close();
  console.log('📦 MongoDB connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Vivify server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;