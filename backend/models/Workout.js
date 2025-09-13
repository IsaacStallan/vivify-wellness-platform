const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    workoutType: {
        type: String,
        required: true,
        enum: ['cardio', 'strength', 'sports', 'pushups', 'hiit', 'flexibility', 'general'],
        default: 'general'
    },
    reps: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    points: {
        type: Number,
        default: 20
    },
    intensity: {
        type: String,
        enum: ['easy', 'moderate', 'hard', 'beast'],
        default: 'moderate'
    },
    equipment: {
        type: String,
        enum: ['none', 'bodyweight', 'basic', 'full'],
        default: 'none'
    },
    category: {
        type: String,
        default: 'physical'
    },
    description: {
        type: String,
        default: 'Completed workout'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for efficient querying
workoutSchema.index({ userId: 1, timestamp: -1 });
workoutSchema.index({ userId: 1, category: 1, timestamp: -1 });

// Virtual for calculating workout age
workoutSchema.virtual('age').get(function() {
    return Math.floor((Date.now() - this.timestamp) / (1000 * 60 * 60 * 24)); // days
});

// Method to check if workout is from this week
workoutSchema.methods.isThisWeek = function() {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return this.timestamp >= weekStart;
};

// Static method to get user's workout stats
workoutSchema.statics.getUserStats = async function(userId) {
    const workouts = await this.find({ 
        userId: userId,
        category: 'physical'
    }).sort({ timestamp: -1 });
    
    const totalWorkouts = workouts.length;
    const thisWeekWorkouts = workouts.filter(w => w.isThisWeek()).length;
    const totalPoints = workouts.reduce((sum, w) => sum + w.points, 0);
    
    return {
        totalWorkouts,
        thisWeekWorkouts,
        totalPoints,
        workouts
    };
};

module.exports = mongoose.model('Workout', workoutSchema);