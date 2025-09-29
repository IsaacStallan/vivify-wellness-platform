// models/User.js - Enhanced version with card battle fields
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // AUTHENTICATION FIELDS
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    school: {
        type: String,
        required: true,
        trim: true
    },
    yearLevel: {
        type: String,
        enum: ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Uni'],
        required: true
    },
    role: {
        type: String,
        default: 'student'
    },
    
    // PROFILE FIELDS (enhanced for profile page)
    displayName: { type: String },
    location: { type: String },
    bio: { type: String },
    
    profile: {
        firstName: String,
        lastName: String,
        avatar: String,
        bio: String,
        goals: [String],
        preferences: {
            workoutReminders: { type: Boolean, default: true },
            publicProfile: { type: Boolean, default: true },
            shareProgress: { type: Boolean, default: true }
        }
    },
    
    // USER PREFERENCES (for profile page settings)
    preferences: {
        dailyChallenges: { type: Boolean, default: true },
        progressNotifications: { type: Boolean, default: true },
        communityLeaderboard: { type: Boolean, default: false },
        trainingReminders: { type: Boolean, default: true }
    },
    
    // ACHIEVEMENTS (permanent unlocks)
    achievements: [{
        id: String,
        unlockedAt: Date
    }],
    
    // SCORING FIELDS
    overallScore: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    habitStreak: { type: Number, default: 0 },
    fitnessScore: { type: Number, default: 0 },
    nutritionScore: { type: Number, default: 0 },
    mentalScore: { type: Number, default: 0 },
    lifeSkillsScore: { type: Number, default: 0 },
    habitPoints: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    
    // ACTIVITY TRACKING (for time-based leaderboards)
    activity: [{
        type: {
            type: String,
            required: true,
            enum: ['habit_completed', 'challenge_joined', 'challenge_daily', 'challenge_completed', 'assessment_completed']
        },
        habitId: String,
        challengeId: String,
        points: {
            type: Number,
            required: true,
            min: 0
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    }],

    // HABITS DATA (daily tracking)
    habitsData: {
        sleep: { 
            value: { type: Number, default: 0, min: 0, max: 100 },
            lastUpdated: Date,
            completedToday: { type: Boolean, default: false }
        },
        exercise: { 
            value: { type: Number, default: 0, min: 0, max: 100 },
            lastUpdated: Date,
            completedToday: { type: Boolean, default: false }
        },
        nutrition: { 
            value: { type: Number, default: 0, min: 0, max: 100 },
            lastUpdated: Date,
            completedToday: { type: Boolean, default: false }
        },
        mindfulness: { 
            value: { type: Number, default: 0, min: 0, max: 100 },
            lastUpdated: Date,
            completedToday: { type: Boolean, default: false }
        },
        study: { 
            value: { type: Number, default: 0, min: 0, max: 100 },
            lastUpdated: Date,
            completedToday: { type: Boolean, default: false }
        },
        cardsGenerated: {
            sleep: { type: Boolean, default: false },
            exercise: { type: Boolean, default: false },
            nutrition: { type: Boolean, default: false },
            mindfulness: { type: Boolean, default: false },
            study: { type: Boolean, default: false }
        }
    },
    
    // CHALLENGE STATS
    userChallenges: { type: Object, default: {} },
    challengeStats: {
        active: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 }
    },
    
    challengeData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // CARD BATTLE SYSTEM
    cardBattleData: {
        battleXP: { type: Number, default: 0 },
        battleLevel: { type: Number, default: 1 },
        battleTrophies: { type: Number, default: 0 },
        
        totalBattles: { type: Number, default: 0 },
        battlesWon: { type: Number, default: 0 },
        battlesLost: { type: Number, default: 0 },
        winStreak: { type: Number, default: 0 },
        longestWinStreak: { type: Number, default: 0 },
        
        cards: [{
            id: String,
            name: String,
            rarity: { 
                type: String, 
                enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] 
            },
            attack: Number,
            defense: Number,
            special: String,
            imageUrl: String,
            unlockedAt: { type: Date, default: Date.now },
            source: { 
                type: String, 
                enum: ['habit', 'challenge', 'battle', 'special'] 
            },
            sourceId: String
        }],
        
        totalCardsUnlocked: { type: Number, default: 0 },
        cardsByRarity: {
            common: { type: Number, default: 0 },
            uncommon: { type: Number, default: 0 },
            rare: { type: Number, default: 0 },
            epic: { type: Number, default: 0 },
            legendary: { type: Number, default: 0 }
        },
        
        activeDeck: {
            deckName: { type: String, default: 'My Deck' },
            cardIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
            lastUpdated: { type: Date, default: Date.now }
        },
        
        currentSeason: { type: String, default: 'Season_1' },
        seasonRank: { type: Number, default: 0 },
        peakRank: { type: Number, default: 0 },
        
        verificationLevel: {
            type: String,
            enum: ['basic', 'verified', 'premium'],
            default: 'basic'
        },
        parentVerificationEnabled: { type: Boolean, default: false },
        
        lastBattleDate: Date,
        lastCardGenerated: Date
    },

    // FITNESS METRICS
    fitnessMetrics: {
        totalWorkouts: { type: Number, default: 0 },
        thisWeekWorkouts: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        fitnessScore: { type: Number, default: 0 },
        avgWorkoutsPerWeek: { type: Number, default: 0 },
        totalFitnessXP: { type: Number, default: 0 },
        lastWorkout: Date,
        lastUpdated: Date
    },
    
    // PERFORMANCE DATA
    performanceData: {
        hasCompletedBaseline: {
            type: Boolean,
            default: false
        },
        baselineCompletedAt: {
            type: Date
        },
        physicalFitness: {
            currentLevel: {
                type: String,
                enum: ['beginner', 'intermediate', 'advanced']
            },
            goals: [{
                type: String
            }],
            exerciseFrequency: {
                type: String,
                enum: ['never', 'rarely', 'sometimes', 'regularly', 'daily']
            }
        },
        academicPerformance: {
            currentGPA: {
                type: String
            },
            studyHours: {
                type: Number
            },
            challenges: [{
                type: String
            }]
        },
        mentalWellbeing: {
            stressLevel: {
                type: Number,
                min: 1,
                max: 10
            },
            sleepHours: {
                type: Number
            },
            mindfulnessInterest: {
                type: Boolean,
                default: false
            }
        },
        socialSkills: {
            confidenceLevel: {
                type: Number,
                min: 1,
                max: 10
            },
            socialGoals: [{
                type: String
            }]
        },
        scores: {
            physical: { type: Number, default: 0 },
            mental: { type: Number, default: 0 },
            academic: { type: Number, default: 0 },
            overall: { type: Number, default: 0 }
        },
        streaks: {
            current: { type: Number, default: 0 },
            longest: { type: Number, default: 0 },
            lastUpdated: Date
        },
        totalXP: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: [String]
    },
    
    // STATUS FIELDS
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: Date,
    lastActive: Date,
    loginCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for faster queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ overallScore: -1 });
userSchema.index({ 'activity.timestamp': -1 });

module.exports = mongoose.model('User', userSchema);

// Virtual for card battle win rate
userSchema.virtual('battleWinRate').get(function() {
    const battleData = this.cardBattleData;
    if (!battleData || battleData.totalBattles === 0) return 0;
    return Math.round((battleData.battlesWon / battleData.totalBattles) * 100);
});

// Virtual for battle rank calculation
userSchema.virtual('battleRank').get(function() {
    const trophies = this.cardBattleData?.battleTrophies || 0;
    if (trophies >= 3000) return 'Champion';
    if (trophies >= 2000) return 'Master';
    if (trophies >= 1200) return 'Expert';
    if (trophies >= 600) return 'Advanced';
    if (trophies >= 200) return 'Intermediate';
    return 'Novice';
});

// Method to calculate card generation eligibility
userSchema.methods.canGenerateCard = function() {
    const lastGenerated = this.cardBattleData?.lastCardGenerated;
    if (!lastGenerated) return true;
    
    // Allow 1 card generation per hour maximum
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(lastGenerated) < hourAgo;
};

// Method to update battle stats after a battle
userSchema.methods.updateBattleStats = function(won, trophiesGained, xpGained) {
    if (!this.cardBattleData) {
        this.cardBattleData = {};
    }
    
    this.cardBattleData.totalBattles = (this.cardBattleData.totalBattles || 0) + 1;
    this.cardBattleData.battleXP = (this.cardBattleData.battleXP || 0) + xpGained;
    this.cardBattleData.battleTrophies = Math.max(0, (this.cardBattleData.battleTrophies || 0) + trophiesGained);
    this.cardBattleData.lastBattleDate = new Date();
    
    if (won) {
        this.cardBattleData.battlesWon = (this.cardBattleData.battlesWon || 0) + 1;
        this.cardBattleData.winStreak = (this.cardBattleData.winStreak || 0) + 1;
        this.cardBattleData.longestWinStreak = Math.max(
            this.cardBattleData.longestWinStreak || 0, 
            this.cardBattleData.winStreak
        );
    } else {
        this.cardBattleData.battlesLost = (this.cardBattleData.battlesLost || 0) + 1;
        this.cardBattleData.winStreak = 0;
    }
    
    // Update battle level based on XP
    const newLevel = Math.floor(this.cardBattleData.battleXP / 100) + 1;
    this.cardBattleData.battleLevel = newLevel;
    
    return this.save();
};

// Keep all your existing methods
userSchema.virtual('fullName').get(function() {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

userSchema.virtual('avatarInitials').get(function() {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName[0]}${this.profile.lastName[0]}`.toUpperCase();
    }
    return this.username.substring(0, 2).toUpperCase();
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLoginInfo = function() {
    this.lastLogin = new Date();
    this.loginCount += 1;
    return this.save();
};

userSchema.methods.updateFitnessScore = function(metrics) {
    this.fitnessMetrics = {
        ...this.fitnessMetrics,
        ...metrics,
        lastUpdated: new Date()
    };
    return this.save();
};

userSchema.virtual('currentLevel').get(function() {
    const totalXP = this.performanceData.totalXP || 0;
    return Math.floor(totalXP / 100) + 1;
});

userSchema.virtual('levelProgress').get(function() {
    const totalXP = this.performanceData.totalXP || 0;
    const currentLevelXP = (this.currentLevel - 1) * 100;
    const progressXP = totalXP - currentLevelXP;
    return {
        current: progressXP,
        required: 100,
        percentage: Math.round((progressXP / 100) * 100)
    };
});

userSchema.statics.getFitnessLeaderboard = async function(limit = 50) {
    return await this.find({ isActive: true })
        .select('username school yearLevel fitnessMetrics')
        .sort({ 'fitnessMetrics.fitnessScore': -1 })
        .limit(limit);
};

userSchema.statics.findBySchool = function(school) {
    return this.find({ school: school, isActive: true });
};

// NEW: Get battle leaderboard
userSchema.statics.getBattleLeaderboard = async function(limit = 50) {
    return await this.find({ 
        isActive: true,
        'cardBattleData.totalBattles': { $gt: 0 }
    })
    .select('username school yearLevel cardBattleData')
    .sort({ 'cardBattleData.battleTrophies': -1 })
    .limit(limit);
};

module.exports = mongoose.model('User', userSchema);