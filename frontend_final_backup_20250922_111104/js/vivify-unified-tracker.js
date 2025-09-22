// ENHANCED UNIFIED TRACKER SYSTEM
// This replaces all three separate tracking systems

class VivifyUnifiedTracker {
    constructor() {
        this.baseURL = 'https://vivify-backend.onrender.com/api';
        this.username = localStorage.getItem('username');
        
        // Unified data structure for ALL tracking
        this.data = {
            // Core habits (consistent across all pages)
            habits: [
                {
                    id: 'morning_routine',
                    name: 'Morning Power Routine',
                    description: 'Complete energizing morning routine within 1 hour of waking',
                    category: 'Physical Performance',
                    points: 20,
                    type: 'daily',
                    completed: false,
                    streak: 0
                },
                {
                    id: 'physical_training',
                    name: 'Physical Training',
                    description: 'Complete 30+ minutes of intentional physical exercise',
                    category: 'Physical Performance', 
                    points: 25,
                    type: 'daily',
                    completed: false,
                    streak: 0
                },
                {
                    id: 'deep_work',
                    name: 'Deep Work Session',
                    description: 'Complete 90 minutes of focused, distraction-free work',
                    category: 'Mental Focus',
                    points: 30,
                    type: 'daily', 
                    completed: false,
                    streak: 0
                },
                {
                    id: 'nutrition_tracking',
                    name: 'Performance Nutrition',
                    description: 'Track all meals and hit protein/hydration targets',
                    category: 'Performance Nutrition',
                    points: 15,
                    type: 'daily',
                    completed: false,
                    streak: 0
                },
                {
                    id: 'reading',
                    name: 'Learning & Growth',
                    description: 'Read or learn something new for 30+ minutes',
                    category: 'Excellence Habits',
                    points: 20,
                    type: 'daily',
                    completed: false,
                    streak: 0
                },
                {
                    id: 'reflection',
                    name: 'Performance Review',
                    description: 'Reflect on wins, losses, and tomorrow\'s priorities',
                    category: 'Excellence Habits',
                    points: 15,
                    type: 'daily',
                    completed: false,
                    streak: 0
                },
                {
                    id: 'sleep_prep',
                    name: 'Recovery Preparation',
                    description: 'Wind down routine and in bed by target time',
                    category: 'Physical Performance',
                    points: 20,
                    type: 'daily',
                    completed: false,
                    streak: 0
                },
                {
                    id: 'skill_practice',
                    name: 'Skill Development',
                    description: 'Practice a specific skill for 45+ minutes',
                    category: 'Excellence Habits',
                    points: 25,
                    type: 'daily',
                    completed: false,
                    streak: 0
                }
            ],
            
            // Custom habits created by students
            customHabits: [],
            
            // Challenges data
            challenges: {},
            
            // Performance scores
            scores: {
                physical: 0,
                mental: 0,
                nutrition: 0,
                lifeSkills: 0,
                overall: 0
            },
            
            // Progress tracking
            dailyCompletions: {}, // date -> [habitIds]
            streaks: {},
            totalPoints: 0,
            totalXP: 0,
            
            // Unified activity log
            activities: [],
            
            // Achievements
            achievements: {},
            
            // Last active date for daily resets
            lastActiveDate: new Date().toDateString()
        };
    }

    async initialize() {
        await this.loadData();
        
        // Recover signup points if they exist
        const signupPoints = localStorage.getItem('signupPoints');
        if (signupPoints && !this.data.signupPointsRecovered) {
            this.data.totalPoints += parseInt(signupPoints);
            this.data.totalXP += parseInt(signupPoints);
            this.data.signupPointsRecovered = true;
            console.log(`Recovered ${signupPoints} signup points`);
        }
        this.resetDailyIfNewDay();
        this.migrateExistingData();
        this.calculateScores();
        return this;
    }

    async loadData() {
        try {
            // Load from backend first
            const response = await fetch(`${this.baseURL}/user/${this.username}`);
            const serverData = await response.json();
            
            if (!serverData.error) {
                this.mergeServerData(serverData);
            }
        } catch (error) {
            console.log('Loading from local storage...');
        }
        
        // Load existing unified data
        const localData = localStorage.getItem('vivifyUnifiedData');
        if (localData) {
            const parsed = JSON.parse(localData);
            this.data = { ...this.data, ...parsed };
        }
        
        this.save();
    }

    migrateExistingData() {
        // Migrate from old habits system
        const oldHabitsData = localStorage.getItem('habitsData');
        if (oldHabitsData) {
            try {
                const habitsData = JSON.parse(oldHabitsData);
                
                // Migrate daily completions
                if (habitsData.dailyCompletions) {
                    this.data.dailyCompletions = { ...this.data.dailyCompletions, ...habitsData.dailyCompletions };
                }
                
                // Migrate custom habits
                if (habitsData.customHabits) {
                    habitsData.customHabits.forEach(habit => {
                        if (!this.data.customHabits.find(h => h.id === habit.id)) {
                            this.data.customHabits.push(habit);
                        }
                    });
                }
                
                // Migrate achievements
                if (habitsData.achievements) {
                    this.data.achievements = { ...this.data.achievements, ...habitsData.achievements };
                }
                
                console.log('Successfully migrated old habits data');
            } catch (error) {
                console.error('Error migrating habits data:', error);
            }
        }

        // Migrate from old performance system
        const oldPerformanceData = localStorage.getItem('performanceData');
        if (oldPerformanceData) {
            try {
                const performanceData = JSON.parse(oldPerformanceData);
                
                if (performanceData.scores) {
                    this.data.scores = { ...this.data.scores, ...performanceData.scores };
                }
                
                if (performanceData.activities) {
                    this.data.activities = [...this.data.activities, ...performanceData.activities];
                }
                
                if (performanceData.totalXP) {
                    this.data.totalXP = performanceData.totalXP;
                }
                
                console.log('Successfully migrated old performance data');
            } catch (error) {
                console.error('Error migrating performance data:', error);
            }
        }

        // Migrate from old challenges system
        const oldChallengesData = localStorage.getItem(`vivify_challenges_${this.username}`);
        if (oldChallengesData) {
            try {
                const challengesData = JSON.parse(oldChallengesData);
                this.data.challenges = { ...this.data.challenges, ...challengesData };
                
                console.log('Successfully migrated old challenges data');
            } catch (error) {
                console.error('Error migrating challenges data:', error);
            }
        }
    }

    mergeServerData(serverData) {
        if (serverData.habitsData) {
            const today = new Date().toDateString();
            Object.keys(serverData.habitsData).forEach(habitType => {
                const habit = this.data.habits.find(h => this.mapHabitToType(h.id) === habitType);
                if (habit && serverData.habitsData[habitType].completedToday) {
                    habit.completed = true;
                    if (!this.data.dailyCompletions[today]) {
                        this.data.dailyCompletions[today] = [];
                    }
                    if (!this.data.dailyCompletions[today].includes(habit.id)) {
                        this.data.dailyCompletions[today].push(habit.id);
                    }
                }
            });
        }
        
        if (serverData.totalPoints) {
            this.data.totalPoints = serverData.totalPoints;
        }

        if (serverData.challengeData) {
            this.data.challenges = { ...this.data.challenges, ...serverData.challengeData };
        }
    }

    mapHabitToType(habitId) {
        const map = {
            'morning_routine': 'exercise',
            'physical_training': 'exercise', 
            'deep_work': 'study',
            'nutrition_tracking': 'nutrition',
            'reading': 'study',
            'reflection': 'mindfulness',
            'sleep_prep': 'sleep',
            'skill_practice': 'study'
        };
        return map[habitId] || 'study';
    }

    resetDailyIfNewDay() {
        const today = new Date().toDateString();
        
        if (this.data.lastActiveDate !== today) {
            // Reset daily completions
            this.getAllHabits().forEach(habit => {
                habit.completed = false;
            });
            
            this.data.lastActiveDate = today;
            this.save();
        }
    }

    // UNIFIED COMPLETION METHOD
    async completeHabit(habitId) {
        const habit = this.getAllHabits().find(h => h.id === habitId);
        
        if (!habit || habit.completed) {
            console.log('Habit already completed or not found');
            return false;
        }
        
        // Mark as completed
        habit.completed = true;
        const today = new Date().toDateString();
        
        // Update daily completions
        if (!this.data.dailyCompletions[today]) {
            this.data.dailyCompletions[today] = [];
        }
        this.data.dailyCompletions[today].push(habitId);
        
        // Update streak
        habit.streak = (habit.streak || 0) + 1;
        this.data.streaks[habitId] = habit.streak;
        
        // Add points
        this.data.totalPoints += habit.points;
        this.data.totalXP += habit.points;
        
        // Update performance scores
        this.updateScoresFromHabit(habit);
        
        // Log activity
        this.logActivity(habit.name, habit.points, 'habit');
        
        // Sync to backend
        await this.syncToBackend(habitId, habit.points);
        
        // Add to unified leaderboard
        if (window.VivifyLeaderboard) {
            window.VivifyLeaderboard.addPoints(habit.points, 'habit_complete', {
                habitId: habitId,
                habitName: habit.name
            });
        }
        
        // Check achievements
        this.checkAchievements();
        
        this.save();
        this.notifyCompletion(habit.name, habit.points);
        
        console.log(`Completed habit: ${habit.name} (+${habit.points} points)`);
        return true;
    }

    updateScoresFromHabit(habit) {
        const categoryMap = {
            'Physical Performance': 'physical',
            'Mental Focus': 'mental',
            'Performance Nutrition': 'nutrition',
            'Excellence Habits': 'lifeSkills'
        };
        
        const scoreCategory = categoryMap[habit.category];
        if (scoreCategory && this.data.scores[scoreCategory] !== undefined) {
            // Increase score based on habit points (smaller increments for gradual progress)
            const increment = habit.points * 0.1;
            this.data.scores[scoreCategory] = Math.min(100, this.data.scores[scoreCategory] + increment);
        }
        
        // Recalculate overall score
        const categoryScores = [
            this.data.scores.physical,
            this.data.scores.mental,
            this.data.scores.nutrition,
            this.data.scores.lifeSkills
        ];
        
        this.data.scores.overall = Math.round(
            categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
        );
    }

    calculateScores() {
        // Calculate based on habit completion rate
        const completionRates = this.calculateWeeklyCompletionRates();
        this.data.scores.physical = Math.min(100, 20 + (completionRates.physical * 80));
        this.data.scores.mental = Math.min(100, 20 + (completionRates.mental * 80));
        this.data.scores.nutrition = Math.min(100, 20 + (completionRates.nutrition * 80));
        this.data.scores.lifeSkills = Math.min(100, 20 + (completionRates.lifeSkills * 80));
        
        // Calculate overall
        const categoryScores = [
            this.data.scores.physical,
            this.data.scores.mental,
            this.data.scores.nutrition,
            this.data.scores.lifeSkills
        ];
        
        this.data.scores.overall = Math.round(
            categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
        );
    }

    calculateWeeklyCompletionRates() {
        const today = new Date();
        const rates = {
            physical: 0,
            mental: 0,
            nutrition: 0,
            lifeSkills: 0
        };
        
        const categoryMap = {
            'Physical Performance': 'physical',
            'Mental Focus': 'mental',
            'Performance Nutrition': 'nutrition',
            'Excellence Habits': 'lifeSkills'
        };
        
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toDateString();
            
            const dayCompletions = this.data.dailyCompletions[dateStr] || [];
            
            this.getAllHabits().forEach(habit => {
                const category = categoryMap[habit.category];
                if (category && dayCompletions.includes(habit.id)) {
                    rates[category] += 1/7; // 1/7th for each day completed
                }
            });
        }
        
        return rates;
    }

    // CHALLENGE METHODS
    async joinChallenge(challengeId) {
        if (this.data.challenges[challengeId]?.joined) {
            this.notifyCompletion('You are already in this challenge', 'info');
            return;
        }

        const now = new Date();
        this.data.challenges[challengeId] = {
            joined: true,
            startDate: now.toISOString(),
            completedDays: [],
            lastCompletedDate: null,
            completed: false,
            streak: 0,
            totalDays: 0
        };

        this.data.totalPoints += 25;
        this.data.totalXP += 25;
        
        this.logActivity(`Joined challenge`, 25, 'challenge_join');

        await this.syncToBackend(`challenge_${challengeId}`, 25);
        
        if (window.VivifyLeaderboard) {
            window.VivifyLeaderboard.addPoints(25, 'challenge_join', { 
                challengeId: challengeId
            });
        }
        
        this.save();
        this.notifyCompletion(`Challenge joined! +25 points`, 'success');
    }

    async completeChallengeDay(challengeId, challenge) {
        const uc = this.data.challenges[challengeId];
        
        if (!uc?.joined) {
            this.notifyCompletion('Join the challenge first', 'info');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (uc.completedDays.includes(today)) {
            this.notifyCompletion('Already completed today!', 'info');
            return;
        }

        uc.completedDays.push(today);
        uc.lastCompletedDate = today;
        uc.totalDays = uc.completedDays.length;
        
        const dailyPoints = challenge.dailyPoints || 10;
        this.data.totalPoints += dailyPoints;
        this.data.totalXP += dailyPoints;
        
        this.logActivity(`Challenge day completed: ${challenge.name}`, dailyPoints, 'challenge_daily');
        
        // Check completion
        if (uc.totalDays >= challenge.totalGoal) {
            uc.completed = true;
            const completionBonus = challenge.points - (dailyPoints * challenge.totalGoal);
            if (completionBonus > 0) {
                this.data.totalPoints += completionBonus;
                this.data.totalXP += completionBonus;
            }
            this.notifyCompletion(`Challenge completed! +${challenge.points} total points`, 'success');
        } else {
            this.notifyCompletion(`Day completed! +${dailyPoints} points`, 'success');
        }

        if (window.VivifyLeaderboard) {
            window.VivifyLeaderboard.addPoints(dailyPoints, 'challenge_daily', { 
                challengeId: challengeId
            });
        }

        await this.syncToBackend(`challenge_${challengeId}`, dailyPoints);
        this.save();
    }

    // CUSTOM HABIT CREATION
    createCustomHabit(data) {
        const habit = {
            id: 'custom_' + Date.now(),
            name: data.name,
            description: data.description,
            category: data.category,
            points: data.points,
            type: 'daily',
            completed: false,
            streak: 0,
            isCustom: true
        };
        
        this.data.customHabits.push(habit);
        this.save();
        
        console.log('Created custom habit:', habit.name);
        return habit;
    }

    deleteCustomHabit(habitId) {
        if (!habitId.startsWith('custom_')) {
            console.error('Cannot delete default habits');
            return false;
        }

        this.data.customHabits = this.data.customHabits.filter(h => h.id !== habitId);
        
        // Clean up related data
        delete this.data.streaks[habitId];
        Object.keys(this.data.dailyCompletions).forEach(date => {
            this.data.dailyCompletions[date] = this.data.dailyCompletions[date].filter(id => id !== habitId);
        });

        this.save();
        console.log('Deleted custom habit:', habitId);
        return true;
    }

    // UTILITY METHODS
    getAllHabits() {
        return [...this.data.habits, ...this.data.customHabits];
    }

    logActivity(name, points, type) {
        this.data.activities.unshift({
            id: Date.now(),
            name: name,
            points: points,
            type: type,
            timestamp: new Date().toISOString(),
            description: name
        });
        
        // Keep last 50 activities
        if (this.data.activities.length > 50) {
            this.data.activities = this.data.activities.slice(0, 50);
        }
    }

    async syncToBackend(identifier, points) {
        try {
            const habitType = this.mapHabitToType(identifier);
            
            await fetch(`${this.baseURL}/habits/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.username,
                    habitType: habitType,
                    value: 100
                })
            });
            
            console.log('Synced to backend successfully');
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    checkAchievements() {
        const completedToday = this.getAllHabits().filter(h => h.completed).length;
        const totalHabits = this.getAllHabits().length;
        const currentStreak = this.calculateCurrentStreak();

        if (!this.data.achievements.first_habit && completedToday >= 1) {
            this.unlockAchievement('first_habit');
        }

        if (!this.data.achievements.perfect_day && completedToday === totalHabits) {
            this.unlockAchievement('perfect_day');
        }

        if (!this.data.achievements.week_warrior && currentStreak >= 7) {
            this.unlockAchievement('week_warrior');
        }

        if (!this.data.achievements.consistency_king && currentStreak >= 30) {
            this.unlockAchievement('consistency_king');
        }
    }

    unlockAchievement(achievementId) {
        this.data.achievements[achievementId] = true;
        this.notifyCompletion(`Achievement Unlocked: ${achievementId}!`, 'achievement');
        this.save();
    }

    calculateCurrentStreak() {
        let streak = 0;
        let checkDate = new Date();
        
        while (true) {
            const dateStr = checkDate.toDateString();
            const dayCompletions = this.data.dailyCompletions[dateStr] || [];
            const completionRate = this.getAllHabits().length > 0 ? dayCompletions.length / this.getAllHabits().length : 0;
            
            if (completionRate >= 0.7) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateUserLevel() {
        const levels = [
            { name: 'Beginner', min: 0, max: 99, tier: 'Bronze' },
            { name: 'Rising', min: 100, max: 249, tier: 'Bronze' },
            { name: 'Developing', min: 250, max: 499, tier: 'Bronze' },
            { name: 'Skilled', min: 500, max: 799, tier: 'Silver' },
            { name: 'Advanced', min: 800, max: 1199, tier: 'Silver' },
            { name: 'Expert', min: 1200, max: 1699, tier: 'Gold' },
            { name: 'Elite', min: 1700, max: 2499, tier: 'Gold' },
            { name: 'Champion', min: 2500, max: 3999, tier: 'Platinum' },
            { name: 'Legend', min: 4000, max: 9999, tier: 'Diamond' }
        ];
        
        const xp = this.data.totalXP;
        
        for (let level of levels) {
            if (xp >= level.min && xp <= level.max) {
                const progress = Math.round(((xp - level.min) / (level.max - level.min)) * 100);
                return {
                    name: level.name,
                    tier: level.tier,
                    xp: xp,
                    progress: progress,
                    nextLevelXP: level.max + 1,
                    currentLevelMin: level.min,
                    currentLevelMax: level.max
                };
            }
        }
        
        return { name: 'Legend', tier: 'Diamond', xp: xp, progress: 100, nextLevelXP: null };
    }

    // DATA EXPORT METHODS
    getHabitsPageData() {
        const allHabits = this.getAllHabits();
        const completedToday = allHabits.filter(h => h.completed).length;
        const totalHabits = allHabits.length;
        const currentStreak = this.calculateCurrentStreak();
        const longestStreak = Math.max(...Object.values(this.data.streaks), 0);
        const weeklyRate = this.calculateWeeklyCompletionRate();

        return {
            habits: allHabits,
            stats: {
                completedToday,
                totalHabits,
                currentStreak,
                longestStreak,
                weeklyRate,
                totalPoints: this.data.totalPoints
            },
            dailyCompletions: this.data.dailyCompletions,
            activities: this.data.activities.slice(0, 5)
        };
    }

    getDashboardData() {
        return {
            scores: this.data.scores,
            activities: this.data.activities.slice(0, 8),
            streaks: {
                currentStreak: this.calculateCurrentStreak(),
                longestStreak: Math.max(...Object.values(this.data.streaks), 0)
            },
            level: this.calculateUserLevel(),
            habits: this.getAllHabits(),
            totalPoints: this.data.totalPoints,
            totalXP: this.data.totalXP
        };
    }

    getChallengesData() {
        const active = Object.values(this.data.challenges).filter(c => c.joined && !c.completed).length;
        const completed = Object.values(this.data.challenges).filter(c => c.completed).length;
        
        return {
            challenges: this.data.challenges,
            stats: {
                active,
                completed,
                totalPoints: this.data.totalPoints
            },
            achievements: Object.keys(this.data.achievements || {})
        };
    }

    calculateWeeklyCompletionRate() {
        const today = new Date();
        let totalPossible = 0;
        let totalCompleted = 0;

        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toDateString();
            
            totalPossible += this.getAllHabits().length;
            const dayCompletions = this.data.dailyCompletions[dateString] || [];
            totalCompleted += dayCompletions.length;
        }

        return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    }

    save() {
        localStorage.setItem('vivifyUnifiedData', JSON.stringify(this.data));
        
        // Clear old data stores to prevent conflicts
        localStorage.removeItem('habitsData');
        localStorage.removeItem('performanceData');
        localStorage.removeItem(`vivify_challenges_${this.username}`);
    }

    notifyCompletion(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 100px; right: 20px; z-index: 10000;
            background: ${type === 'success' ? '#27ae60' : type === 'info' ? '#3498db' : '#f39c12'};
            color: white; padding: 1rem 1.5rem; border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            transform: translateX(100px); opacity: 0;
            transition: all 0.4s ease; font-weight: 600; max-width: 350px;
        `;
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100px)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }
}

// Global instance
let vivifyTracker;