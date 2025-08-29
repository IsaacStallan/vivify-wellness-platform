require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const jwt = require('jsonwebtoken');
const path = require('path');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com", 
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://images.unsplash.com",
        "https://images.pexels.com",
        "https://cdnjs.cloudflare.com"
      ],
      connectSrc: [
        "'self'", 
        "https://fonts.googleapis.com", 
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://images.unsplash.com",
        "https://images.pexels.com"
      ],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrcAttr: ["'unsafe-inline'"],
      scriptSrcElem: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdnjs.cloudflare.com"
      ],
      styleSrcElem: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://cdnjs.cloudflare.com"
      ]
    },
  },
}));

// CORS configuration for Knox Grammar
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://vivify.knoxgrammar.nsw.edu.au', 'http://localhost:3000']
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for school environment
  message: { error: 'Too many requests. Please wait a moment before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Stricter for auth endpoints
  skipSuccessfulRequests: true,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes before trying again.' }
});

// Apply rate limiting
app.use(generalLimiter);
app.use('/auth/login', authLimiter);
app.use('/auth/signup', authLimiter);

// Static files from current directory
app.use(express.static(__dirname, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vivify-knox')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('🏫 Vivify ready for Knox Grammar School');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Please check MongoDB connection and try again');
    process.exit(1);
  });

// Session store using MongoDB
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/vivify-knox',
  collectionName: 'sessions',
  ttl: 24 * 60 * 60 // 24 hours
});

// Session middleware with MongoDB store
app.use(session({
    secret: process.env.SESSION_SECRET || 'knox-grammar-vivify-secret-2025',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours for school day
    },
    name: 'vivify.session.id'
  }));

// JWT helper functions
const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'knox-vivify-secret', { 
    expiresIn: process.env.NODE_ENV === 'production' ? '8h' : '1h' // School day length
  });
};

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'knox-vivify-secret', (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Session expired. Please log in again.' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Authentication routes
app.use('/auth', authRoutes);

// Main routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes for Knox Grammar

// Get user profile data
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -verificationToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role || 'student',
        school: user.school || 'Knox Grammar School',
        yearLevel: user.yearLevel,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const { yearLevel, school } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        yearLevel, 
        school: school || 'Knox Grammar School',
        lastLogin: new Date()
      },
      { new: true, select: '-password' }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Wellness data endpoints
app.post('/api/wellness/baseline', verifyToken, async (req, res) => {
  try {
    const { scores, responses } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Store baseline assessment
    user.wellnessBaseline = {
      scores,
      responses,
      completedAt: new Date(),
      version: '1.0'
    };
    
    await user.save();
    
    res.json({ 
      message: 'Baseline assessment saved successfully',
      scores 
    });
  } catch (error) {
    console.error('Baseline save error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/wellness/data', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wellnessBaseline username email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      wellnessData: user.wellnessBaseline || null,
      username: user.username 
    });
  } catch (error) {
    console.error('Wellness data fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Class Management API for Knox Grammar Teachers
app.post('/api/classes/create', verifyToken, async (req, res) => {
  try {
    const { name, subject, yearLevel } = req.body;
    
    const teacher = await User.findById(req.user.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create classes' });
    }
    
    // Generate unique class code
    const generateClassCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    const classCode = generateClassCode();
    
    // Store class data in teacher's record for now
    if (!teacher.classes) teacher.classes = [];
    
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
    
    teacher.classes.push(newClass);
    await teacher.save();
    
    res.json({ success: true, class: newClass });
    
  } catch (error) {
    console.error('Class creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/classes/join', verifyToken, async (req, res) => {
  try {
    const { classCode } = req.body;
    
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find the class by code across all teachers
    const teacher = await User.findOne({ 
      'classes.code': classCode.toUpperCase(),
      'classes.active': true 
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Invalid class code' });
    }
    
    const classToJoin = teacher.classes.find(c => c.code === classCode.toUpperCase());
    
    if (!classToJoin.students.includes(req.user.id)) {
      classToJoin.students.push(req.user.id);
      await teacher.save();
      
      // Update student record
      if (!student.enrolledClasses) student.enrolledClasses = [];
      if (!student.enrolledClasses.includes(classToJoin.id)) {
        student.enrolledClasses.push(classToJoin.id);
        await student.save();
      }
    }
    
    res.json({ 
      success: true, 
      className: classToJoin.name,
      teacher: teacher.username
    });
    
  } catch (error) {
    console.error('Class join error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/classes/student', verifyToken, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const teachersWithClasses = await User.find({ 
      'classes.students': req.user.id 
    }).select('username classes');
    
    const studentClasses = [];
    teachersWithClasses.forEach(teacher => {
      teacher.classes.forEach(cls => {
        if (cls.students.includes(req.user.id)) {
          studentClasses.push({
            ...cls.toObject(),
            teacherName: teacher.username
          });
        }
      });
    });
    
    res.json({ classes: studentClasses });
    
  } catch (error) {
    console.error('Student classes fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher dashboard endpoint
app.get('/api/teacher/dashboard', verifyToken, async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Teacher access required' });
    }
    
    const classes = teacher.classes || [];
    const studentIds = [...new Set(classes.flatMap(c => c.students))];
    
    const students = await User.find({
      _id: { $in: studentIds }
    }).select('username email wellnessBaseline lastLogin createdAt');
    
    const dashboardData = {
      teacher: {
        name: teacher.username,
        email: teacher.email
      },
      classes: classes.length,
      totalStudents: studentIds.length,
      students: students.map(student => ({
        id: student._id,
        username: student.username,
        email: student.email,
        wellnessScore: student.wellnessBaseline?.scores?.overall || 0,
        lastActive: student.lastLogin || student.createdAt
      }))
    };
    
    res.json(dashboardData);
    
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check for Knox Grammar IT monitoring
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Vivify Student Wellness Platform',
    school: 'Knox Grammar School',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Serve main pages
app.get('/dashboard', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'Dashboard.html'));
});

app.get('/profile', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

// Knox Grammar specific admin routes
app.get('/admin/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !['admin', 'school_admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const stats = {
      totalUsers: await User.countDocuments(),
      totalStudents: await User.countDocuments({ role: 'student' }),
      totalTeachers: await User.countDocuments({ role: 'teacher' }),
      activeToday: await User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      assessmentsCompleted: await User.countDocuments({
        'wellnessBaseline.scores': { $exists: true }
      })
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student wellness report for teachers/counselors
app.get('/api/student/:studentId/wellness', verifyToken, async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id);
    const student = await User.findById(req.params.studentId);
    
    if (!teacher || !['teacher', 'admin', 'school_admin', 'counselor'].includes(teacher.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if teacher has access to this student (same class)
    const hasAccess = teacher.classes?.some(cls => 
      cls.students.includes(req.params.studentId)
    ) || ['admin', 'school_admin', 'counselor'].includes(teacher.role);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'No access to this student' });
    }
    
    res.json({
      student: {
        id: student._id,
        username: student.username,
        email: student.email
      },
      wellnessData: student.wellnessBaseline || null,
      lastActive: student.lastLogin || student.createdAt
    });
    
  } catch (error) {
    console.error('Student wellness report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Emergency alert system for Knox Grammar counselors
app.post('/api/emergency/alert', verifyToken, async (req, res) => {
  try {
    const { studentId, alertType, message } = req.body;
    
    const reporter = await User.findById(req.user.id);
    if (!reporter || !['teacher', 'admin', 'school_admin'].includes(reporter.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Log the alert (in production, this would trigger email/SMS to counselors)
    console.log(`🚨 WELLNESS ALERT - ${alertType.toUpperCase()}`);
    console.log(`Student: ${student.username} (${student.email})`);
    console.log(`Reporter: ${reporter.username}`);
    console.log(`Message: ${message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // In production, implement proper alert system here
    // await sendEmergencyAlert(student, reporter, alertType, message);
    
    res.json({ 
      success: true, 
      message: 'Alert sent to school counselors',
      alertId: Date.now()
    });
    
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve HTML files
app.get('*.html', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('File serve error:', err);
      res.status(404).send(`
        <html>
          <head><title>Page Not Found - Vivify</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 2rem;">
            <h1>Page Not Found</h1>
            <p>The requested page could not be found.</p>
            <a href="/">Return to Home</a>
          </body>
        </html>
      `);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't expose detailed errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      message: 'An error occurred. Please try again or contact support if the problem persists.' 
    });
  } else {
    res.status(500).json({ 
      message: err.message,
      stack: err.stack
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Graceful shutdown for Knox Grammar deployment
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vivify server running on port ${PORT}`);
  console.log(`🏫 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Access at: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Production mode: Ready for Knox Grammar School');
  }
});

module.exports = app;