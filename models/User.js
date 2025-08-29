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
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'school_admin', 'counselor'],
        default: 'student'
    },
    school: {
        type: String,
        default: 'Knox Grammar School'
    },
    yearLevel: {
        type: String,
        enum: ['7', '8', '9', '10', '11', '12', '']
    },
    lastLogin: Date,
    
    // Wellness baseline assessment data
    wellnessBaseline: {
        scores: {
            physical: { type: Number, min: 0, max: 100 },
            mental: { type: Number, min: 0, max: 100 },
            nutrition: { type: Number, min: 0, max: 100 },
            lifeSkills: { type: Number, min: 0, max: 100 },
            overall: { type: Number, min: 0, max: 100 }
        },
        responses: [{
            question: String,
            category: String,
            value: Number,
            answer: String
        }],
        completedAt: Date,
        version: { type: String, default: '1.0' }
    },
    
    // Class enrollment for students
    enrolledClasses: [String],
    
    // Classes created by teachers
    classes: [{
        id: String,
        code: String,
        name: String,
        subject: String,
        yearLevel: String,
        students: [String],
        createdAt: Date,
        active: { type: Boolean, default: true }
    }],
    
    // User preferences
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'dark'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        }
    },
    
    // Activity tracking
    activities: [{
        type: {
            type: String,
            enum: ['login', 'assessment', 'workout', 'meditation', 'nutrition', 'goal', 'other']
        },
        category: String,
        description: String,
        points: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, { 
    timestamps: true 
});

// Method to calculate overall wellness score
UserSchema.methods.calculateOverallWellnessScore = function() {
    if (this.wellnessBaseline && this.wellnessBaseline.scores) {
        const { physical, mental, nutrition, lifeSkills } = this.wellnessBaseline.scores;
        
        if (physical !== undefined && mental !== undefined && 
            nutrition !== undefined && lifeSkills !== undefined) {
            return Math.round((physical + mental + nutrition + lifeSkills) / 4);
        }
    }
    
    return 0;
};

// Method to add activity
UserSchema.methods.addActivity = function(type, category, description, points = 0) {
    this.activities.push({
        type,
        category,
        description,
        points,
        timestamp: new Date()
    });
    
    // Keep only last 50 activities
    if (this.activities.length > 50) {
        this.activities = this.activities.slice(-50);
    }
    
    return this.save();
};

const User = mongoose.model('User', UserSchema);

module.exports = User;