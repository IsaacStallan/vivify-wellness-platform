const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    // Fitness-specific metrics
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
    // Overall performance tracking
    performanceData: {
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
        }
    },
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: Date,
    loginCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

// Virtual for avatar initials
userSchema.virtual('avatarInitials').get(function() {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName[0]}${this.profile.lastName[0]}`.toUpperCase();
    }
    return this.username.substring(0, 2).toUpperCase();
});

// Hash password before saving
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update login info
userSchema.methods.updateLoginInfo = function() {
    this.lastLogin = new Date();
    this.loginCount += 1;
    return this.save();
};

// Update fitness score method
userSchema.methods.updateFitnessScore = function(metrics) {
    this.fitnessMetrics = {
        ...this.fitnessMetrics,
        ...metrics,
        lastUpdated: new Date()
    };
    return this.save();
};

// Calculate level based on XP
userSchema.virtual('currentLevel').get(function() {
    const totalXP = this.performanceData.totalXP || 0;
    return Math.floor(totalXP / 100) + 1; // 100 XP per level
});

// Get progress to next level
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

// Static method to get leaderboard
userSchema.statics.getFitnessLeaderboard = async function(limit = 50) {
    return await this.find({ isActive: true })
        .select('username school yearLevel fitnessMetrics')
        .sort({ 'fitnessMetrics.fitnessScore': -1 })
        .limit(limit);
};

// Static method to find users by school
userSchema.statics.findBySchool = function(school) {
    return this.find({ school: school, isActive: true });
};

module.exports = mongoose.model('User', userSchema);