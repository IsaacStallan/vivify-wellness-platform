require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const usersRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000', 
    'https://vivifyeducation.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static('../frontend'));
app.use('/api/users', usersRoutes);

// Build MongoDB URI from env vars
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const User = require('./models/User');
const Card = require('./models/Card'); // NEW

// Add this before your routes in server.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
      res.sendStatus(200);
  } else {
      next();
  }
});

// Routes
const authRoutes = require('./routes/auth');
const fitnessRoutes = require('./routes/fitness');

app.use('/api/auth', authRoutes);
app.use('/api/fitness', fitnessRoutes);

// User API Routes (simplified - move these to routes/User.js later)
app.post('/api/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ success: true, userId: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

async function findUser(identifier) {
  return await User.findOne({
    $or: [
      { _id: mongoose.Types.ObjectId.isValid(identifier) ? identifier : null },
      { username: identifier },
      { email: identifier }
    ]
  });
}

app.get('/api/user/:userId', async (req, res) => {
  try {
    let user = await findUser(req.params.userId);
    
    // If not found and it looks like a generated userId, create a new user
    if (!user && req.params.userId.startsWith('user_')) {
      user = new User({
        username: req.params.userId,
        email: `${req.params.userId}@temp.com`,
        password: 'temppassword',
        school: 'Unknown',
        yearLevel: 'Year 10'
      });
      await user.save();
    }
    
    res.json(user || {});
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cards/generate', async (req, res) => {
  try {
    const { username, habitType, streakLength = 1, verified = false, verificationMethod = 'none' } = req.body;
    
    if (!username || !habitType) {
      return res.status(400).json({ error: 'Username and habitType required' });
    }
    
    const user = await findUser(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user can generate a card (rate limiting)
    if (!user.canGenerateCard()) {
      return res.status(429).json({ error: 'Card generation rate limit reached. Try again later.' });
    }
    
    // Generate the card
    const newCard = await Card.generateFromHabit(user._id, {
      habitType,
      streakLength,
      verified,
      verificationMethod
    });
    
    await newCard.save();
    
    // Update user's card collection stats
    if (!user.cardBattleData) user.cardBattleData = {};
    user.cardBattleData.totalCardsUnlocked = (user.cardBattleData.totalCardsUnlocked || 0) + 1;
    user.cardBattleData.lastCardGenerated = new Date();
    
    // Update rarity count
    if (!user.cardBattleData.cardsByRarity) user.cardBattleData.cardsByRarity = {};
    user.cardBattleData.cardsByRarity[newCard.rarity] = (user.cardBattleData.cardsByRarity[newCard.rarity] || 0) + 1;
    
    await user.save();
    
    res.json({
      success: true,
      card: newCard,
      message: `${newCard.rarity} ${newCard.name} unlocked!`
    });
    
  } catch (error) {
    console.error('Error generating card:', error);
    res.status(500).json({ error: 'Failed to generate card' });
  }
});

// GET /api/cards/:username - Get user's card collection
app.get('/api/cards/:username', async (req, res) => {
  try {
    const { rarity, type, limit = 50 } = req.query;
    
    const user = await findUser(req.params.username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const filter = { userId: user._id };
    if (rarity) filter.rarity = rarity;
    if (type) filter.type = type;
    
    const cards = await Card.find(filter)
      .sort({ rarity: -1, power: -1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      cards,
      total: cards.length,
      battleData: user.cardBattleData || {}
    });
    
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// POST /api/deck/create - Create/update user's battle deck
app.post('/api/deck/create', async (req, res) => {
  try {
    const { username, deckName, cardIds } = req.body;
    
    if (!username || !cardIds || !Array.isArray(cardIds)) {
      return res.status(400).json({ error: 'Username and cardIds array required' });
    }
    
    if (cardIds.length < 5 || cardIds.length > 7) {
      return res.status(400).json({ error: 'Deck must contain 5-7 cards' });
    }
    
    const user = await findUser(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify user owns all cards
    const userCards = await Card.find({ 
      _id: { $in: cardIds }, 
      userId: user._id 
    });
    
    if (userCards.length !== cardIds.length) {
      return res.status(400).json({ error: 'You do not own all selected cards' });
    }
    
    // Calculate total deck cost
    const totalCost = userCards.reduce((sum, card) => sum + card.cost, 0);
    if (totalCost > 15) {
      return res.status(400).json({ error: 'Deck cost too high. Max cost is 15.' });
    }
    
    // Update user's active deck
    if (!user.cardBattleData) user.cardBattleData = {};
    user.cardBattleData.activeDeck = {
      deckName: deckName || 'My Deck',
      cardIds: cardIds,
      lastUpdated: new Date()
    };
    
    // Update card states
    await Card.updateMany({ userId: user._id }, { inActiveDeck: false });
    await Card.updateMany({ _id: { $in: cardIds } }, { inActiveDeck: true });
    
    await user.save();
    
    res.json({
      success: true,
      deck: user.cardBattleData.activeDeck,
      cards: userCards
    });
    
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ error: 'Failed to create deck' });
  }
});

// POST /api/battle/ai - Start AI battle
app.post('/api/battle/ai', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    
    const user = await findUser(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has an active deck
    const activeDeck = user.cardBattleData?.activeDeck;
    if (!activeDeck || !activeDeck.cardIds || activeDeck.cardIds.length < 5) {
      return res.status(400).json({ error: 'You need an active deck with at least 5 cards' });
    }
    
    // Get user's deck cards
    const playerCards = await Card.find({ 
      _id: { $in: activeDeck.cardIds },
      userId: user._id 
    });
    
    if (playerCards.length < 5) {
      return res.status(400).json({ error: 'Invalid deck. Some cards are missing.' });
    }
    
    // Generate AI opponent deck
    const aiCards = generateAICards(playerCards.length);
    
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      battleId,
      playerCards,
      aiCards,
      status: 'ready',
      rounds: [],
      energy: { player: 5, ai: 5 }
    });
    
  } catch (error) {
    console.error('Error starting AI battle:', error);
    res.status(500).json({ error: 'Failed to start battle' });
  }
});

// POST /api/battle/play-round - Play battle round
app.post('/api/battle/play-round', async (req, res) => {
  try {
    const { username, battleId, playerCardId } = req.body;
    
    if (!username || !battleId || !playerCardId) {
      return res.status(400).json({ error: 'Username, battleId, and playerCardId required' });
    }
    
    const user = await findUser(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get player card
    const playerCard = await Card.findOne({ _id: playerCardId, userId: user._id });
    if (!playerCard) {
      return res.status(400).json({ error: 'Invalid card selection' });
    }
    
    // Generate AI card selection
    const aiCard = generateRandomAICard();
    
    // Calculate battle results
    const typeAdvantage = getTypeAdvantage(playerCard.type, aiCard.type);
    let playerPower = playerCard.power * typeAdvantage;
    let aiPower = aiCard.power;
    
    // Apply card effects
    if (playerCard.effect.type === 'power_boost') {
      playerPower += playerCard.effect.value;
    } else if (playerCard.effect.type === 'freeze') {
      aiPower = Math.max(1, aiPower - playerCard.effect.value);
    }
    
    // Determine winner
    let winner = 'tie';
    if (playerPower > aiPower) winner = 'player';
    else if (aiPower > playerPower) winner = 'ai';
    
    // Update card usage
    playerCard.timesUsed += 1;
    playerCard.lastUsed = new Date();
    await playerCard.save();
    
    const roundResult = {
      roundNumber: Date.now(), // Simplified for MVP
      playerCard: {
        id: playerCard._id,
        name: playerCard.name,
        power: Math.round(playerPower),
        type: playerCard.type,
        effect: playerCard.effect
      },
      aiCard: {
        name: aiCard.name,
        power: Math.round(aiPower),
        type: aiCard.type
      },
      winner,
      battleComplete: false
    };
    
    res.json({
      success: true,
      round: roundResult
    });
    
  } catch (error) {
    console.error('Error playing round:', error);
    res.status(500).json({ error: 'Failed to play round' });
  }
});

// POST /api/battle/complete - Complete battle and award rewards
app.post('/api/battle/complete', async (req, res) => {
  try {
    const { username, battleId, playerWon, roundsWon, totalRounds } = req.body;
    
    const user = await findUser(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate rewards
    const baseXP = 25;
    const baseTrophies = playerWon ? 15 : -5;
    
    let xpGained = baseXP;
    let trophiesGained = baseTrophies;
    
    // Bonus for winning
    if (playerWon) {
      xpGained += 25;
      trophiesGained += 10;
    }
    
    // Bonus for streaks
    const currentStreak = user.cardBattleData?.winStreak || 0;
    if (playerWon && currentStreak >= 3) {
      xpGained += 15;
      trophiesGained += 5;
    }
    
    // Update user battle stats
    await user.updateBattleStats(playerWon, trophiesGained, xpGained);
    
    res.json({
      success: true,
      battleResult: {
        won: playerWon,
        xpGained,
        trophiesGained,
        newBattleLevel: user.cardBattleData.battleLevel,
        newTrophyCount: user.cardBattleData.battleTrophies,
        winStreak: user.cardBattleData.winStreak
      }
    });
    
  } catch (error) {
    console.error('Error completing battle:', error);
    res.status(500).json({ error: 'Failed to complete battle' });
  }
});

// GET /api/battle/leaderboard - Get battle leaderboard
app.get('/api/battle/leaderboard', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const leaderboard = await User.getBattleLeaderboard(limit);
    
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      school: user.school,
      yearLevel: user.yearLevel,
      battleTrophies: user.cardBattleData?.battleTrophies || 0,
      battleLevel: user.cardBattleData?.battleLevel || 1,
      winRate: Math.round(((user.cardBattleData?.battlesWon || 0) / Math.max(1, user.cardBattleData?.totalBattles || 1)) * 100),
      totalBattles: user.cardBattleData?.totalBattles || 0,
      winStreak: user.cardBattleData?.winStreak || 0
    }));
    
    res.json({
      success: true,
      leaderboard: formattedLeaderboard
    });
    
  } catch (error) {
    console.error('Error fetching battle leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch battle leaderboard' });
  }
});

app.put('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(req.params.userId) ? req.params.userId : null },
          { username: req.params.userId }
        ]
      },
      req.body,
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add the missing progress endpoint
app.post('/api/user/progress', async (req, res) => {
  try {
    const { userId, challengeId, progress, username, habitType } = req.body;
    
    let user = await findUser(userId || username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update challenge progress (keep existing logic)
    if (!user.userChallenges) user.userChallenges = {};
    if (!user.userChallenges[challengeId]) {
      user.userChallenges[challengeId] = {
        joined: true,
        startDate: new Date().toISOString(),
        completedDays: 0,
        dailyProgress: 0,
        completed: false
      };
    }

    if (progress.action === 'join') {
      user.userChallenges[challengeId].joined = true;
    } else if (progress.action === 'daily_progress') {
      user.userChallenges[challengeId].dailyProgress = progress.dailyProgress;
    } else if (progress.action === 'progress') {
      user.userChallenges[challengeId].completedDays = progress.completedDays;
    } else if (progress.action === 'complete') {
      user.userChallenges[challengeId].completed = true;
      user.userChallenges[challengeId].completedDays = progress.completedDays;
    }

    // NEW: Generate card when habit/challenge completed
    if (progress.action === 'complete' || progress.action === 'progress') {
      try {
        const streakLength = progress.completedDays || user.currentStreak || 1;
        const cardHabitType = habitType || mapChallengeToHabitType(challengeId);
        
        if (cardHabitType && user.canGenerateCard()) {
          const newCard = await Card.generateFromHabit(user._id, {
            habitType: cardHabitType,
            streakLength,
            verified: progress.verified || false,
            verificationMethod: progress.verificationMethod || 'none'
          });
          
          await newCard.save();
          
          // Update user card stats
          if (!user.cardBattleData) user.cardBattleData = {};
          user.cardBattleData.totalCardsUnlocked = (user.cardBattleData.totalCardsUnlocked || 0) + 1;
          user.cardBattleData.lastCardGenerated = new Date();
          
          if (!user.cardBattleData.cardsByRarity) user.cardBattleData.cardsByRarity = {};
          user.cardBattleData.cardsByRarity[newCard.rarity] = (user.cardBattleData.cardsByRarity[newCard.rarity] || 0) + 1;
          
          console.log(`🎴 Generated ${newCard.rarity} card "${newCard.name}" for ${user.username}`);
        }
      } catch (cardError) {
        console.error('Card generation failed:', cardError);
        // Continue with normal flow even if card generation fails
      }
    }

    // Recalculate scores (keep existing logic)
    const challengePoints = Object.values(user.userChallenges).reduce((total, challenge) => {
      if (challenge.completed) return total + 500;
      return total;
    }, 0);

    user.challengeStats = {
      active: Object.values(user.userChallenges).filter(c => c.joined && !c.completed).length,
      completed: Object.values(user.userChallenges).filter(c => c.completed).length,
      totalPoints: challengePoints
    };

    user.level = Math.floor(challengePoints / 100) + 1;
    user.habitStreak = Math.floor(challengePoints / 50);
    user.fitnessScore = Math.floor(challengePoints * 0.8);
    user.mentalScore = Math.floor(challengePoints * 0.6);
    user.nutritionScore = Math.floor(challengePoints * 0.7);
    user.lifeSkillsScore = Math.floor(challengePoints * 0.5);

    user.overallScore = Math.round(
      challengePoints * 1.0 +
      user.habitStreak * 0.8 +
      user.fitnessScore * 0.6 +
      user.nutritionScore * 0.6 +
      user.mentalScore * 0.7 +
      user.lifeSkillsScore * 0.5 +
      user.level * 50
    );

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Helper functions for card battle system
function generateAICards(count) {
  const types = ['Endurance', 'Focus', 'Calm', 'Discipline'];
  const names = ['Shadow Warrior', 'Crystal Guardian', 'Storm Caller', 'Iron Will', 'Flame Spirit', 'Wind Walker'];
  
  return Array.from({ length: count }, () => ({
    name: names[Math.floor(Math.random() * names.length)],
    type: types[Math.floor(Math.random() * types.length)],
    power: Math.floor(Math.random() * 30) + 10,
    cost: Math.floor(Math.random() * 3) + 1,
    rarity: 'common',
    effect: { type: 'none', value: 0 }
  }));
}

function generateRandomAICard() {
  const cards = generateAICards(1);
  return cards[0];
}

function getTypeAdvantage(attacker, defender) {
  const advantages = {
    'Endurance': 'Calm',
    'Calm': 'Focus', 
    'Focus': 'Discipline',
    'Discipline': 'Endurance'
  };
  
  return advantages[attacker] === defender ? 1.2 : 1.0;
}

function mapChallengeToHabitType(challengeId) {
  const challengeMap = {
    'fitness-foundation': 'fitness',
    'morning-energy': 'fitness',
    'deep-work': 'study',
    'stress-resilience': 'mental',
    'elite-morning': 'life_skills',
    'time-mastery': 'study'
  };
  
  return challengeMap[challengeId] || 'study';
}

// Leaderboard API Routes
app.get('/api/leaderboard/overall', async (req, res) => {
  try {
    const users = await User.find({})
      .select('username school overallScore level challengeStats habitStreak fitnessScore nutritionScore mentalScore lifeSkillsScore')
      .sort({ overallScore: -1 })
      .limit(50);
    
    // Transform data to match frontend expectations
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      overallScore: user.overallScore || 0,
      level: user.level || 1,
      activeChallenges: user.challengeStats?.active || 0,
      completedChallenges: user.challengeStats?.completed || 0,
      totalPoints: user.challengeStats?.totalPoints || 0
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching overall leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch overall leaderboard' });
  }
});

app.get('/api/leaderboard/challenges', async (req, res) => {
  try {
    const users = await User.find({ 'challengeStats.totalPoints': { $gt: 0 } })
      .select('username userChallenges challengeStats')
      .sort({ 'challengeStats.totalPoints': -1 })
      .limit(50);

    const challengeData = [];
    users.forEach(user => {
      if (user.userChallenges) {
        Object.entries(user.userChallenges).forEach(([challengeId, challenge]) => {
          if (challenge.joined) {
            challengeData.push({
              userId: user._id,
              displayName: user.username,
              challengeId,
              progress: challenge.completed ? 100 : Math.round((challenge.completedDays || 0) / 30 * 100),
              isCompleted: challenge.completed,
              completedDays: challenge.completedDays || 0
            });
          }
        });
      }
    });

    res.json(challengeData);
  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch challenge leaderboard' });
  }
});

app.get('/api/leaderboard/physical', async (req, res) => {
  try {
    const users = await User.find({ fitnessScore: { $gt: 0 } })
      .select('username school fitnessScore level')
      .sort({ fitnessScore: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      score: user.fitnessScore,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch physical leaderboard' });
  }
});

app.get('/api/leaderboard/mental', async (req, res) => {
  try {
    const users = await User.find({ mentalScore: { $gt: 0 } })
      .select('username school mentalScore level')
      .sort({ mentalScore: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      score: user.mentalScore,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mental leaderboard' });
  }
});

app.get('/api/leaderboard/habits', async (req, res) => {
  try {
    const users = await User.find({ habitStreak: { $gt: 0 } })
      .select('username school habitStreak level')
      .sort({ habitStreak: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      score: user.habitStreak,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits leaderboard' });
  }
});

app.get('/api/leaderboard/weekly', async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const users = await User.find({ updatedAt: { $gte: weekAgo } })
      .select('username school overallScore level updatedAt')
      .sort({ overallScore: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      overallScore: user.overallScore,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

app.get('/api/leaderboard/monthly', async (req, res) => {
  try {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const users = await User.find({ updatedAt: { $gte: monthAgo } })
      .select('username school overallScore level updatedAt')
      .sort({ overallScore: -1 })
      .limit(20);
    
    const transformedUsers = users.map(user => ({
      userId: user._id,
      displayName: user.username,
      school: user.school || '',
      overallScore: user.overallScore,
      level: user.level || 1
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly leaderboard' });
  }
});

// Add this new endpoint to your server.js
app.post('/api/user/habits', async (req, res) => {
  try {
    const { userId, habitsData } = req.body;
    
    const user = await findUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update habits data
    if (!user.habitsData) user.habitsData = {};
    user.habitsData = { ...user.habitsData, ...habitsData };

    // Calculate habit points and streaks
    const habitStats = calculateHabitStats(user.habitsData);
    
    // Update scores
    user.habitPoints = habitStats.totalPoints;
    user.longestStreak = habitStats.longestStreak;
    user.currentStreak = habitStats.currentStreak;

    // Recalculate overall score
    await recalculateUserScore(user);
    await user.save();

    res.json({ success: true, habitStats });
  } catch (error) {
    console.error('Error updating habits:', error);
    res.status(500).json({ error: 'Failed to update habits' });
  }
});

// Add this route somewhere after your existing routes (probably after the auth routes)
// Look for other app.get() or app.post() routes and add it near them

app.get('/api/users', async (req, res) => {
  try {
      const users = await User.find({})
          .select('username school overallScore level challengeStats fitnessScore mentalScore habitStreak')
          .lean();
      
      console.log(`Found ${users.length} users for leaderboard`);
      res.json(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add helper functions
function calculateHabitStats(habitsData) {
  let totalPoints = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let consecutiveDays = 0;

  const dates = Object.keys(habitsData || {}).sort();
  let lastDate = null;

  for (const date of dates) {
    const dayData = habitsData[date];
    if (!dayData) continue;

    const completedHabits = Object.values(dayData).filter(habit => habit.completed).length;
    totalPoints += completedHabits * 10; // 10 points per completed habit

    if (completedHabits > 0) {
      if (lastDate && isConsecutiveDay(lastDate, date)) {
        consecutiveDays++;
      } else {
        consecutiveDays = 1;
      }
      longestStreak = Math.max(longestStreak, consecutiveDays);
      lastDate = date;
    } else {
      consecutiveDays = 0;
    }
  }

  const today = new Date().toISOString().split('T')[0];
  if (lastDate === today) {
    currentStreak = consecutiveDays;
  }

  const streakBonus = Math.floor(currentStreak / 7) * 50;
  totalPoints += streakBonus;

  return { totalPoints, currentStreak, longestStreak, streakBonus };
}

function isConsecutiveDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

async function recalculateUserScore(user) {
  const challengePoints = user.challengeStats?.totalPoints || 0;
  const habitPoints = user.habitPoints || 0;
  const streakBonus = Math.floor((user.currentStreak || 0) / 7) * 50;

  user.level = Math.floor((challengePoints + habitPoints) / 100) + 1;
  user.fitnessScore = Math.floor((challengePoints + habitPoints) * 0.8);
  user.mentalScore = Math.floor((challengePoints + habitPoints) * 0.6);
  user.nutritionScore = Math.floor((challengePoints + habitPoints) * 0.7);
  user.lifeSkillsScore = Math.floor((challengePoints + habitPoints) * 0.5);

  user.overallScore = Math.round(
    challengePoints * 1.0 +
    habitPoints * 1.2 +
    streakBonus +
    user.level * 50
  );
}

// Achievement system
function calculateAchievements(user) {
  const achievements = [];
  const challengeStats = user.challengeStats || {};
  const currentStreak = user.currentStreak || 0;
  const longestStreak = user.longestStreak || 0;
  const totalPoints = user.overallScore || 0;

  // Challenge achievements
  if (challengeStats.completed >= 1) achievements.push('first_challenge');
  if (challengeStats.completed >= 5) achievements.push('challenge_veteran');
  if (challengeStats.completed >= 10) achievements.push('challenge_master');

  // Streak achievements
  if (currentStreak >= 7) achievements.push('week_warrior');
  if (currentStreak >= 30) achievements.push('month_master');
  if (longestStreak >= 100) achievements.push('century_streak');

  // Point achievements
  if (totalPoints >= 500) achievements.push('rising_star');
  if (totalPoints >= 1000) achievements.push('high_achiever');
  if (totalPoints >= 2500) achievements.push('elite_performer');

  // Habit-specific achievements
  const habitPoints = user.habitPoints || 0;
  if (habitPoints >= 300) achievements.push('habit_builder');
  if (habitPoints >= 1000) achievements.push('habit_master');

  return achievements;
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎮 Vivify Card Battle Server running on port ${PORT}`);
  console.log(`🃏 Card system: ACTIVE`);
  console.log(`⚔️ Battle system: ACTIVE`);
  console.log(`🏆 Leaderboards: ACTIVE`);
});