require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('Starting Vivify server...');
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set ✓' : 'Missing ✗',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set ✓' : 'Missing ✗',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set ✓' : 'Missing ✗'
});

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS setup
app.use(cors({
  origin: ['https://vivify.au', 'https://www.vivify.au', 'https://vivifyeducation.netlify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Static file serving
app.use(express.static(__dirname));
app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// =============================================================================
// UTILITY ROUTES (favicon, service worker, etc.)
// =============================================================================

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.get('/sw.js', (req, res) => {
    res.status(404).json({ message: 'Service worker not implemented yet' });
});

// =============================================================================
// HTML PAGE ROUTES (Frontend)
// =============================================================================

app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/nutrition', (req, res) => {
    res.sendFile(path.join(__dirname, 'nutrition.html'));
});

app.get('/fitness', (req, res) => {
    res.sendFile(path.join(__dirname, 'fitness.html'));
});

app.get('/mental-health', (req, res) => {
    res.sendFile(path.join(__dirname, 'focus-resilience.html'));
});

app.get('/life-lessons', (req, res) => {
    res.sendFile(path.join(__dirname, 'life-mastery.html'));
});

// =============================================================================
// API ROUTES
// =============================================================================

// Health check API
app.get('/api/health', (req, res) => {
  console.log('API Health check accessed');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Vivify Student Performance Platform',
    school: 'Knox Grammar School',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    ai: process.env.OPENAI_API_KEY ? 'enabled' : 'disabled'
  });
});

// Legacy health check (for backward compatibility)
app.get('/health', (req, res) => {
  console.log('Legacy health check accessed');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Vivify Student Performance Platform',
    school: 'Knox Grammar School',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    ai: process.env.OPENAI_API_KEY ? 'enabled' : 'disabled'
  });
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Vivify Student Performance Platform API',
    school: 'Knox Grammar School',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/health', '/auth/signup', '/auth/login', '/api/ai/coach', '/api/ai/transform-belief']
  });
});

// =============================================================================
// AI INTEGRATION ROUTES
// =============================================================================

// AI Chat Coach endpoint
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    console.log('AI Coach request:', message.substring(0, 50) + '...');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are MindsetAI, a supportive growth mindset coach for ambitious students aged 13-18. Your role is to:

1. Help students reframe challenges as opportunities
2. Transform fixed mindset thinking into growth mindset thinking  
3. Provide practical, actionable advice
4. Be encouraging but realistic
5. Use emojis occasionally but not excessively
6. Keep responses concise (2-4 sentences max)
7. Focus on effort, learning, and progress over ability or talent

Always respond in a warm, supportive tone that builds confidence while promoting growth thinking.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content.trim();
    console.log('AI Coach response generated successfully');

    res.json({ 
      response: response
    });

  } catch (error) {
    console.error('AI Coach error:', error);
    res.status(500).json({ 
      error: 'AI service temporarily unavailable. Please try again later.' 
    });
  }
});

// AI Belief Transformer endpoint
app.post('/api/ai/transform-belief', async (req, res) => {
  try {
    const { belief } = req.body;
    
    if (!belief) {
      return res.status(400).json({ error: 'Belief is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    console.log('AI Belief Transform request:', belief.substring(0, 50) + '...');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a belief transformation specialist. Transform the user's limiting belief into a powerful growth mindset statement. 

Format your response as HTML with this structure:
<div style="background: rgba(39, 174, 96, 0.1); border-left: 4px solid #27ae60; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
    <strong>🌱 Growth Mindset Version:</strong><br>
    "[Transformed belief here - make it empowering and action-oriented]"
</div>

<div style="background: rgba(243, 156, 18, 0.1); border-left: 4px solid #f39c12; padding: 1rem; border-radius: 8px;">
    <strong>💡 Key Mindset Shifts:</strong><br>
    • [3-4 specific mindset shifts used in the transformation]
</div>

Keep the transformation positive, realistic, and focused on growth potential.`
        },
        {
          role: "user",
          content: belief
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const transformation = completion.choices[0].message.content.trim();
    console.log('AI Belief Transform response generated successfully');

    res.json({ 
      transformation: transformation
    });

  } catch (error) {
    console.error('Belief Transform error:', error);
    res.status(500).json({ 
      error: 'AI transformation temporarily unavailable. Please try again later.' 
    });
  }
});

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// Production signup route
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
    
    // Create new user
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: true,
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
        default: return 'performance-baseline-assessment.html';
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

// Production login route
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
    
    // Verify password
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
        default: return 'performance-baseline-assessment.html';
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

// Token verification
app.post('/auth/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ isValid: false, message: 'No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'knox-vivify-secret');
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

// =============================================================================
// USER API ROUTES
// =============================================================================

// Get user info
app.get('/api/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'knox-vivify-secret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        school: user.school,
        yearLevel: user.yearLevel,
        department: user.department
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

class VivifyDataManager {
  constructor() {
    this.baseURL = 'https://vivify-backend.onrender.com/api';
    this.username = localStorage.getItem('username');
  }
  
  // Load all user data on login
  async loadUserData() {
    try {
      const response = await fetch(`${this.baseURL}/user/${this.username}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Store in localStorage for offline access
      localStorage.setItem('userHabits', JSON.stringify(data.habits));
      localStorage.setItem('userChallenges', JSON.stringify(data.challenges));
      localStorage.setItem('userPoints', data.totalPoints);
      localStorage.setItem('userStreak', data.currentStreak);
      localStorage.setItem('userCards', JSON.stringify(data.cards));
      localStorage.setItem('battleStats', JSON.stringify(data.battleStats));
      
      return data;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  }
  
  // Update habit progress
  async updateHabit(habitType, value) {
    try {
      const response = await fetch(`${this.baseURL}/habits/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          habitType: habitType,
          value: value
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update localStorage
        localStorage.setItem('userHabits', JSON.stringify(result.habits));
        localStorage.setItem('userPoints', result.totalPoints);
        
        // If new card unlocked, show animation
        if (result.newCard) {
          this.showCardUnlockAnimation(result.newCard);
          const cards = JSON.parse(localStorage.getItem('userCards') || '[]');
          cards.push(result.newCard);
          localStorage.setItem('userCards', JSON.stringify(cards));
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to update habit:', error);
      return null;
    }
  }
  
  // Update challenge progress
  async updateChallenge(challengeId, progress) {
    try {
      const response = await fetch(`${this.baseURL}/challenges/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          challengeId: challengeId,
          progress: progress
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update localStorage
        const challenges = JSON.parse(localStorage.getItem('userChallenges') || '[]');
        const index = challenges.findIndex(c => c.id === challengeId);
        if (index >= 0) {
          challenges[index] = result.challenge;
        } else {
          challenges.push(result.challenge);
        }
        localStorage.setItem('userChallenges', JSON.stringify(challenges));
        localStorage.setItem('userPoints', result.totalPoints);
        
        // If new card unlocked
        if (result.newCard) {
          this.showCardUnlockAnimation(result.newCard);
          const cards = JSON.parse(localStorage.getItem('userCards') || '[]');
          cards.push(result.newCard);
          localStorage.setItem('userCards', JSON.stringify(cards));
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to update challenge:', error);
      return null;
    }
  }
  
  // Card unlock animation
  showCardUnlockAnimation(card) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; color: white;">
        <h2 style="font-size: 2em; margin-bottom: 20px; animation: bounce 0.5s;">
          🎉 New Card Unlocked! 🎉
        </h2>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px; border-radius: 15px; animation: slideUp 0.5s;">
          <h3>${card.name}</h3>
          <p>Rarity: ${card.rarity}</p>
          <p>Attack: ${card.attack} | Defense: ${card.defense}</p>
          <p style="font-style: italic;">${card.special}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="margin-top: 20px; padding: 10px 30px; font-size: 1.2em;
                       background: white; border: none; border-radius: 25px;
                       cursor: pointer;">Awesome!</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }
}

// Initialize on page load
const dataManager = new VivifyDataManager();

// Load data when user logs in or refreshes page
if (localStorage.getItem('username')) {
  dataManager.loadUserData().then(data => {
    console.log('User data loaded:', data);
    // Update UI with loaded data
    updateDashboardUI(data);
  });
}

// Example: Update habit when slider changes
function onHabitSliderChange(habitType, value) {
  dataManager.updateHabit(habitType, value);
}

// Example: Update challenge progress
function onChallengeProgress(challengeId, progress) {
  dataManager.updateChallenge(challengeId, progress);
}

// =======================
// 4. ADD TO LOGIN SUCCESS
// =======================
async function onLoginSuccess(username) {
  localStorage.setItem('username', username);
  
  const dataManager = new VivifyDataManager();
  const userData = await dataManager.loadUserData();
  
  if (userData) {
    // Redirect to dashboard with data loaded
    window.location.href = 'dashboard.html';
  }
}

// =============================================================================
// CLASS MANAGEMENT API ROUTES
// =============================================================================

// Teacher routes
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

// Student routes
app.get('/api/student/classes', async (req, res) => {
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
    
    console.log(`Loading classes for student: ${student.username} (ID: ${student._id})`);
    
    const teachers = await User.find({ 
      role: 'teacher',
      'classes.students': student._id.toString()
    });
    
    const studentClasses = [];
    
    teachers.forEach(teacher => {
      if (teacher.classes && teacher.classes.length > 0) {
        teacher.classes.forEach(cls => {
          if (cls.students && cls.students.includes(student._id.toString()) && cls.active) {
            studentClasses.push({
              id: cls.id,
              name: cls.name,
              subject: cls.subject,
              yearLevel: cls.yearLevel,
              code: cls.code,
              teacherName: teacher.username,
              teacherId: teacher._id,
              studentCount: cls.students.length,
              joinedAt: cls.joinedAt || cls.createdAt
            });
          }
        });
      }
    });
    
    console.log(`Found ${studentClasses.length} classes for student ${student.username}`);
    
    res.json({ 
      success: true,
      classes: studentClasses,
      studentId: student._id,
      studentName: student.username
    });
    
  } catch (error) {
    console.error('Get student classes error:', error);
    res.status(500).json({ 
      message: 'Server error while loading classes',
      error: error.message 
    });
  }
});

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
    
    if (!classCode || classCode.length !== 6) {
      return res.status(400).json({ message: 'Valid 6-character class code required' });
    }
    
    console.log(`Student ${student.username} attempting to join class: ${classCode}`);
    
    const teacher = await User.findOne({ 
      'classes.code': classCode.toUpperCase(),
      'classes.active': true 
    });
    
    if (!teacher) {
      console.log(`No teacher found with class code: ${classCode}`);
      return res.status(404).json({ message: 'Invalid class code. Please check with your teacher.' });
    }
    
    const classToJoin = teacher.classes.find(c => c.code === classCode.toUpperCase());
    
    if (!classToJoin) {
      return res.status(404).json({ message: 'Class not found or inactive' });
    }
    
    if (!classToJoin.students) {
      classToJoin.students = [];
    }
    
    const studentIdStr = student._id.toString();
    if (classToJoin.students.includes(studentIdStr)) {
      return res.status(400).json({ message: 'You are already enrolled in this class' });
    }
    
    classToJoin.students.push(studentIdStr);
    classToJoin.updatedAt = new Date();
    
    await teacher.save();
    
    console.log(`Student ${student.username} successfully joined class ${classToJoin.name} (${classCode})`);
    console.log(`Class now has ${classToJoin.students.length} students`);
    
    res.json({ 
      success: true, 
      className: classToJoin.name,
      teacher: teacher.username,
      classId: classToJoin.id,
      studentCount: classToJoin.students.length,
      message: `Successfully joined ${classToJoin.name}`
    });
    
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ 
      message: 'Server error occurred. Please try again.',
      error: error.message 
    });
  }
});

// =============================================================================
// DEBUG ROUTES
// =============================================================================

app.get('/api/debug/classes', async (req, res) => {
  try {
    const allUsers = await User.find({}).select('username role classes');
    const teachers = allUsers.filter(u => u.role === 'teacher');
    
    let totalClasses = 0;
    const classInfo = teachers.map(teacher => {
      const classCount = teacher.classes ? teacher.classes.length : 0;
      totalClasses += classCount;
      
      return {
        teacherName: teacher.username,
        teacherId: teacher._id,
        classCount: classCount,
        classes: teacher.classes || []
      };
    });
    
    res.json({
      totalTeachers: teachers.length,
      totalClasses: totalClasses,
      classInfo: classInfo,
      allUsers: allUsers.map(u => ({ id: u._id, username: u.username, role: u.role }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      console.log('🏫 Database ready for Knox Grammar School');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      console.log('⚠️ Running without database - basic functionality only');
    });
} else {
  console.log('⚠️ No MONGODB_URI found');
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.url,
    method: req.method,
    availableRoutes: ['/', '/health', '/auth/signup', '/auth/login', '/api/ai/coach', '/api/ai/transform-belief']
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

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Vivify server running on port', PORT);
  console.log('🔗 Health check: http://localhost:' + PORT + '/health');
  console.log('📝 Signup: http://localhost:' + PORT + '/auth/signup');
  console.log('🤖 AI Coach: http://localhost:' + PORT + '/api/ai/coach');
  console.log('✅ Routes registered and ready');
});

module.exports = app;