// Core Habits (non-negotiable, always active)
const CORE_HABITS = {
    hydration: {
        id: 'hydration',
        name: 'Hydration',
        icon: '💧',
        description: 'Drink 6+ glasses of water',
        category: 'Physical',
        goal: 6,
        unit: 'glasses',
        oxygenBonus: 15,
        trackingType: 'counter',
        tips: [
            'Keep a water bottle with you',
            'Set hourly reminders',
            'Drink a glass when you wake up'
        ]
    },
    sleep: {
        id: 'sleep',
        name: 'Sleep',
        icon: '😴',
        description: 'Get 7+ hours of quality sleep',
        category: 'Physical',
        goal: 7,
        unit: 'hours',
        oxygenBonus: 20,
        trackingType: 'time',
        tips: [
            'Set a consistent bedtime',
            'Avoid screens 1hr before bed',
            'Keep your room cool and dark'
        ]
    },
    movement: {
        id: 'movement',
        name: 'Movement',
        icon: '🏃',
        description: '30 minutes of physical activity',
        category: 'Physical',
        goal: 30,
        unit: 'minutes',
        oxygenBonus: 15,
        trackingType: 'time',
        tips: [
            'Take the stairs instead of elevator',
            'Walk during phone calls',
            'Try a quick HIIT workout'
        ]
    },
    focus: {
        id: 'focus',
        name: 'Focus',
        icon: '🎯',
        description: '1 hour of deep work or study',
        category: 'Academic',
        goal: 60,
        unit: 'minutes',
        oxygenBonus: 20,
        trackingType: 'time',
        tips: [
            'Use the Pomodoro technique',
            'Turn off all notifications',
            'Have a dedicated study space'
        ]
    }
};

// Custom Habit Templates (user picks 3)
const CUSTOM_HABIT_TEMPLATES = {
    // ACADEMIC CATEGORY
    homework_early: {
        id: 'homework_early',
        name: 'Early Homework',
        icon: '📚',
        description: 'Complete homework before 8pm',
        category: 'Academic',
        oxygenBonus: 10,
        trackingType: 'boolean'
    },
    read_daily: {
        id: 'read_daily',
        name: 'Daily Reading',
        icon: '📖',
        description: 'Read for 20 minutes',
        category: 'Academic',
        oxygenBonus: 10,
        trackingType: 'time',
        goal: 20,
        unit: 'minutes'
    },
    study_session: {
        id: 'study_session',
        name: 'Study Session',
        icon: '✍️',
        description: 'Complete a focused study session',
        category: 'Academic',
        oxygenBonus: 12,
        trackingType: 'boolean'
    },
    review_notes: {
        id: 'review_notes',
        name: 'Review Notes',
        icon: '📝',
        description: 'Review today\'s class notes',
        category: 'Academic',
        oxygenBonus: 8,
        trackingType: 'boolean'
    },
    learn_new: {
        id: 'learn_new',
        name: 'Learn Something New',
        icon: '🧠',
        description: 'Spend 15min learning a new skill',
        category: 'Academic',
        oxygenBonus: 10,
        trackingType: 'time',
        goal: 15,
        unit: 'minutes'
    },

    // PHYSICAL CATEGORY
    morning_stretch: {
        id: 'morning_stretch',
        name: 'Morning Stretch',
        icon: '🧘',
        description: '10-minute morning stretch routine',
        category: 'Physical',
        oxygenBonus: 8,
        trackingType: 'boolean'
    },
    sports_practice: {
        id: 'sports_practice',
        name: 'Sports Practice',
        icon: '⚽',
        description: 'Practice your sport for 30min',
        category: 'Physical',
        oxygenBonus: 12,
        trackingType: 'time',
        goal: 30,
        unit: 'minutes'
    },
    strength_training: {
        id: 'strength_training',
        name: 'Strength Training',
        icon: '💪',
        description: 'Complete strength workout',
        category: 'Physical',
        oxygenBonus: 12,
        trackingType: 'boolean'
    },
    healthy_breakfast: {
        id: 'healthy_breakfast',
        name: 'Healthy Breakfast',
        icon: '🥗',
        description: 'Eat a nutritious breakfast',
        category: 'Physical',
        oxygenBonus: 8,
        trackingType: 'boolean'
    },
    no_junk_food: {
        id: 'no_junk_food',
        name: 'No Junk Food',
        icon: '🚫',
        description: 'Avoid junk food today',
        category: 'Physical',
        oxygenBonus: 10,
        trackingType: 'boolean'
    },
    walk_steps: {
        id: 'walk_steps',
        name: '10K Steps',
        icon: '👟',
        description: 'Walk 10,000 steps',
        category: 'Physical',
        oxygenBonus: 12,
        trackingType: 'counter',
        goal: 10000,
        unit: 'steps'
    },

    // MENTAL CATEGORY
    meditation: {
        id: 'meditation',
        name: 'Meditation',
        icon: '🧘‍♂️',
        description: '10-minute meditation',
        category: 'Mental',
        oxygenBonus: 12,
        trackingType: 'time',
        goal: 10,
        unit: 'minutes'
    },
    gratitude_journal: {
        id: 'gratitude_journal',
        name: 'Gratitude Journal',
        icon: '📓',
        description: 'Write 3 things you\'re grateful for',
        category: 'Mental',
        oxygenBonus: 10,
        trackingType: 'boolean'
    },
    breathing_exercise: {
        id: 'breathing_exercise',
        name: 'Breathing Exercise',
        icon: '🌬️',
        description: '5-minute breathing practice',
        category: 'Mental',
        oxygenBonus: 8,
        trackingType: 'time',
        goal: 5,
        unit: 'minutes'
    },
    screen_free_hour: {
        id: 'screen_free_hour',
        name: 'Screen-Free Hour',
        icon: '📵',
        description: '1 hour without screens before bed',
        category: 'Mental',
        oxygenBonus: 10,
        trackingType: 'boolean'
    },
    nature_time: {
        id: 'nature_time',
        name: 'Nature Time',
        icon: '🌳',
        description: 'Spend 20min outside',
        category: 'Mental',
        oxygenBonus: 10,
        trackingType: 'time',
        goal: 20,
        unit: 'minutes'
    },

    // CREATIVE/SOCIAL CATEGORY
    creative_hobby: {
        id: 'creative_hobby',
        name: 'Creative Hobby',
        icon: '🎨',
        description: 'Work on a creative project',
        category: 'Creative',
        oxygenBonus: 10,
        trackingType: 'boolean'
    },
    music_practice: {
        id: 'music_practice',
        name: 'Music Practice',
        icon: '🎵',
        description: 'Practice instrument for 20min',
        category: 'Creative',
        oxygenBonus: 10,
        trackingType: 'time',
        goal: 20,
        unit: 'minutes'
    },
    family_time: {
        id: 'family_time',
        name: 'Family Time',
        icon: '👨‍👩‍👧',
        description: 'Quality time with family',
        category: 'Social',
        oxygenBonus: 10,
        trackingType: 'boolean'
    },
    help_someone: {
        id: 'help_someone',
        name: 'Help Someone',
        icon: '🤝',
        description: 'Do something kind for someone',
        category: 'Social',
        oxygenBonus: 10,
        trackingType: 'boolean'
    },
    social_connection: {
        id: 'social_connection',
        name: 'Social Connection',
        icon: '💬',
        description: 'Have a meaningful conversation',
        category: 'Social',
        oxygenBonus: 8,
        trackingType: 'boolean'
    },
    organize_space: {
        id: 'organize_space',
        name: 'Organize Space',
        icon: '🧹',
        description: 'Clean and organize your room',
        category: 'Life Skills',
        oxygenBonus: 8,
        trackingType: 'boolean'
    },
    plan_tomorrow: {
        id: 'plan_tomorrow',
        name: 'Plan Tomorrow',
        icon: '📅',
        description: 'Plan tomorrow\'s schedule',
        category: 'Life Skills',
        oxygenBonus: 8,
        trackingType: 'boolean'
    }
};

// Get habits by category
function getHabitsByCategory(category) {
    return Object.values(CUSTOM_HABIT_TEMPLATES).filter(
        habit => habit.category === category
    );
}

// Get all categories
function getCategories() {
    const categories = new Set();
    Object.values(CUSTOM_HABIT_TEMPLATES).forEach(habit => {
        categories.add(habit.category);
    });
    return Array.from(categories);
}

// Get habit by ID
function getHabit(habitId) {
    return CORE_HABITS[habitId] || CUSTOM_HABIT_TEMPLATES[habitId] || null;
}

// Validate user's custom habit selection
function validateCustomHabits(habitIds) {
    if (!Array.isArray(habitIds) || habitIds.length !== 3) {
        return { valid: false, error: 'Must select exactly 3 custom habits' };
    }

    for (const habitId of habitIds) {
        if (!CUSTOM_HABIT_TEMPLATES[habitId]) {
            return { valid: false, error: `Invalid habit ID: ${habitId}` };
        }
    }

    return { valid: true };
}

module.exports = {
    CORE_HABITS,
    CUSTOM_HABIT_TEMPLATES,
    getHabitsByCategory,
    getCategories,
    getHabit,
    validateCustomHabits
};
