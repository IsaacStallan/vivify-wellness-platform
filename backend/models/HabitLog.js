const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    habits: {
        // Core habits
        hydration: { type: Boolean, default: false },
        sleep: { type: Boolean, default: false },
        movement: { type: Boolean, default: false },
        focus: { type: Boolean, default: false },
        // Custom habits
        custom1: { type: Boolean, default: false },
        custom2: { type: Boolean, default: false },
        custom3: { type: Boolean, default: false }
    },
    // Detailed tracking for core habits
    habitDetails: {
        hydration: {
            glasses: { type: Number, default: 0 },
            goal: { type: Number, default: 6 }
        },
        sleep: {
            hours: { type: Number, default: 0 },
            goal: { type: Number, default: 7 }
        },
        movement: {
            minutes: { type: Number, default: 0 },
            goal: { type: Number, default: 30 }
        },
        focus: {
            minutes: { type: Number, default: 0 },
            goal: { type: Number, default: 60 }
        }
    },
    oxygenChange: {
        type: Number,
        default: 0
    },
    altitudeChange: {
        type: Number,
        default: 0
    },
    mountainAtLog: {
        type: String,
        enum: ['training', 'fuji', 'kilimanjaro', 'elbrus', 'denali', 'aconcagua', 'vinson', 'everest']
    }
}, {
    timestamps: true
});

// Indexes
habitLogSchema.index({ userId: 1, date: -1 });
habitLogSchema.index({ date: -1 });

// Static methods
habitLogSchema.statics.getUserStreak = async function(userId) {
    const logs = await this.find({ userId })
        .sort({ date: -1 })
        .limit(365);

    let streak = 0;
    let lastDate = new Date();

    for (const log of logs) {
        const logDate = new Date(log.date);
        const daysDiff = Math.floor((lastDate - logDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
            const habitsCompleted = Object.values(log.habits).filter(h => h).length;
            if (habitsCompleted > 0) {
                streak++;
                lastDate = logDate;
            } else {
                break;
            }
        } else {
            break;
        }
    }

    return streak;
};

habitLogSchema.statics.getWeeklyStats = async function(userId) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const logs = await this.find({
        userId,
        date: { $gte: weekAgo }
    });

    let totalHabits = 0;
    let completedHabits = 0;

    logs.forEach(log => {
        const habits = Object.values(log.habits);
        totalHabits += habits.length;
        completedHabits += habits.filter(h => h).length;
    });

    return {
        totalLogs: logs.length,
        totalHabits,
        completedHabits,
        completionRate: totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0
    };
};

module.exports = mongoose.model('HabitLog', habitLogSchema);
