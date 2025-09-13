require('dotenv').config();               // ✅ Load .env ONCE at the very top

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend')); // Serve your frontend files

const fitnessRoutes = require('./routes/fitness');

// And then use the routes:
app.use('/api/fitness', fitnessRoutes);

// In server.js, add this:
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Build MongoDB URI from env vars
const uri =
  `mongodb+srv://${encodeURIComponent(process.env.MONGODB_USER)}:` +
  `${encodeURIComponent(process.env.MONGODB_PASS)}@${process.env.MONGODB_HOST}/` +
  `${process.env.MONGODB_DB}?retryWrites=true&w=majority&authSource=admin`;

mongoose.connect(process.env.MONGODB_URI, { dbName: 'vivify' });

app.use('/api/fitness', fitnessRoutes);
  
app.listen(process.env.PORT || 3000, () => console.log('API up'));


// Connect to MongoDB
(async () => {
  try {
    if (!uri.startsWith('mongodb')) throw new Error('MongoDB URI build failed');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
})();

const User = require('./models/User');

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  email: { type: String, unique: true },
  displayName: String,
  school: String,
  yearLevel: String,
  userChallenges: { type: Object, default: {} },
  challengeStats: { 
    type: Object, 
    default: { active: 0, completed: 0, totalPoints: 0 } 
  },
  overallScore: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  habitStreak: { type: Number, default: 0 },
  fitnessScore: { type: Number, default: 0 },
  nutritionScore: { type: Number, default: 0 },
  mentalScore: { type: Number, default: 0 },
  lifeSkillsScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// API Routes
app.post('/api/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ success: true, userId: user.userId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    res.json(user || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ overallScore: -1 })
      .limit(50)
      .select('displayName school overallScore level challengeStats');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
