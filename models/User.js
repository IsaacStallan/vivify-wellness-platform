const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    profileImage: {
        type: String,
        default: '/images/default-profile.png'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date,
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'dark'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        }
    },
    wellnessData: {
        physicalScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        mentalScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        academicScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        socialScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        lastAssessment: Date
    },
    activity: [{
        type: {
            type: String,
            enum: ['login', 'assessment', 'workout', 'meditation', 'nutrition', 'other']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        details: mongoose.Schema.Types.Mixed
    }]
}, { timestamps: true });

// Add pre-save hooks, virtual fields, or methods here if needed

// Example method to calculate overall wellness score
UserSchema.methods.calculateOverallWellnessScore = function() {
    const { physicalScore, mentalScore, academicScore, socialScore } = this.wellnessData;
    
    // Only calculate if all scores are populated
    if (physicalScore !== undefined && mentalScore !== undefined && 
        academicScore !== undefined && socialScore !== undefined) {
        // Simple average calculation (could be weighted if needed)
        return Math.round((physicalScore + mentalScore + academicScore + socialScore) / 4);
    }
    
    return 0;
};

// Example method to add activity log
UserSchema.methods.addActivity = function(type, details = {}) {
    this.activity.push({
        type,
        timestamp: new Date(),
        details
    });
    
    return this.save();
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
