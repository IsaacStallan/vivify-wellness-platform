// models/User.js - Enhanced with role-based access
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    // NEW: Role-based access
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'school_admin'],
        default: 'student'
    },
    // NEW: School association for teachers/admins
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: function() {
            return this.role !== 'student';
        }
    },
    // NEW: For teachers - which classes/year levels they can access
    classPermissions: [{
        yearLevel: Number,
        className: String,
        studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    // NEW: Student-specific data
    studentData: {
        yearLevel: {
            type: Number,
            min: 7,
            max: 12,
            required: function() {
                return this.role === 'student';
            }
        },
        schoolClass: String,
        teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        parentEmail: String,
        // Privacy settings for what teachers can see
        privacySettings: {
            shareWellnessScores: { type: Boolean, default: true },
            shareActivityData: { type: Boolean, default: true },
            shareAssessmentResults: { type: Boolean, default: false }
        }
    },
    // Existing fields
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// NEW: School model for multi-tenancy
const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: String,
    state: {
        type: String,
        enum: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']
    },
    schoolCode: {
        type: String,
        unique: true,
        required: true
    },
    subscriptionTier: {
        type: String,
        enum: ['basic', 'premium', 'enterprise'],
        default: 'basic'
    }
}, {
    timestamps: true
});

module.exports = {
    User: mongoose.model('User', userSchema),
    School: mongoose.model('School', schoolSchema)
};