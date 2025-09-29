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
        await this.loadData(); // will set this._scoresFromServer when server sent scores
      
        const signupPoints = localStorage.getItem('signupPoints');
        if (signupPoints && !this.data.signupPointsRecovered) {
          this.data.totalPoints += parseInt(signupPoints);
          this.data.totalXP += parseInt(signupPoints);
          this.data.signupPointsRecovered = true;
          console.log(`Recovered ${signupPoints} signup points`);
        }
      
        this.resetDailyIfNewDay();
        this.migrateExistingData();
    
        // Check for existing assessment data in localStorage and sync it
        await this.syncExistingAssessmentData();
    
        // Reload data after potential assessment sync to get updated scores
        if (!this._scoresFromServer) {
          await this.loadData();
        }
      
        // Only compute local scores if we didn't get them from server
        if (!this._scoresFromServer) {
          this.calculateScores();
        }
      
        return this;
    }
      
      

    // UPDATED loadData method
    async loadData() {
        // 1. Load local cache first
        const localData = localStorage.getItem('vivifyUnifiedData');
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                this.data = { ...this.data, ...parsed };
            } catch (e) {
                console.warn('Bad vivifyUnifiedData JSON, ignoring.');
            }
        }
        
        // 2. Fetch from server and merge
        try {
            const response = await fetch(`${this.baseURL}/user/${this.username}`);
            if (!response.ok) {
                throw new Error('Server fetch failed');
            }
            
            const serverData = await response.json();
            
            if (serverData.unifiedTrackerData && Object.keys(serverData.unifiedTrackerData).length > 0) {
                const serverTrackerData = serverData.unifiedTrackerData;
                
                // Merge core data
                this.data.challenges = serverTrackerData.challenges || this.data.challenges;
                this.data.dailyCompletions = serverTrackerData.dailyCompletions || this.data.dailyCompletions;
                this.data.streaks = serverTrackerData.streaks || this.data.streaks;
                this.data.totalPoints = serverTrackerData.totalPoints || this.data.totalPoints;
                this.data.totalXP = serverTrackerData.totalXP || this.data.totalXP;
                this.data.activities = serverTrackerData.activities || this.data.activities;
                this.data.achievements = serverTrackerData.achievements || this.data.achievements;
                this.data.lastActiveDate = serverTrackerData.lastActiveDate || this.data.lastActiveDate;
                
                // CRITICAL: Restore habit completion status from dailyCompletions
                const today = new Date().toDateString();
                const todayCompletions = this.data.dailyCompletions[today] || [];
                
                console.log('Today\'s completions from server:', todayCompletions);
                
                // Update default habits
                this.data.habits.forEach(habit => {
                    habit.completed = todayCompletions.includes(habit.id);
                    habit.streak = this.data.streaks[habit.id] || 0;
                });
                
                // Update custom habits
                if (serverTrackerData.customHabits) {
                    this.data.customHabits = serverTrackerData.customHabits.map(habit => ({
                        ...habit,
                        completed: todayCompletions.includes(habit.id),
                        streak: this.data.streaks[habit.id] || 0
                    }));
                }
                
                console.log('Restored completion status for habits:', 
                    this.data.habits.filter(h => h.completed).map(h => h.name)
                );
            }
            
            // Sync assessment scores
            if (serverData.fitnessScore !== undefined) {
                this.data.scores.physical = serverData.fitnessScore;
                this.data.scores.mental = serverData.mentalScore;
                this.data.scores.nutrition = serverData.nutritionScore;
                this.data.scores.lifeSkills = serverData.lifeSkillsScore;
                this.data.scores.overall = Math.round((
                    this.data.scores.physical + 
                    this.data.scores.mental + 
                    this.data.scores.nutrition + 
                    this.data.scores.lifeSkills
                ) / 4);
                this._scoresFromServer = true;
            }
            
        } catch (error) {
            console.warn('Backend fetch failed, using local only:', error);
        }
        
        this.save();
    }

    // NEW: Sync to backend after state changes
    async syncUnifiedDataToBackend() {
        if (!this.username) {
            console.warn('Cannot sync: no username');
            return false;
        }
        
        try {
            const response = await fetch(`${this.baseURL}/users/sync-unified-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.username,
                    unifiedData: {
                        habits: this.data.habits,
                        customHabits: this.data.customHabits,
                        challenges: this.data.challenges,
                        dailyCompletions: this.data.dailyCompletions,
                        streaks: this.data.streaks,
                        scores: this.data.scores,
                        totalPoints: this.data.totalPoints,
                        totalXP: this.data.totalXP,
                        activities: this.data.activities.slice(0, 50), // Only sync last 50
                        achievements: this.data.achievements,
                        lastActiveDate: this.data.lastActiveDate
                    }
                })
            });
            
            if (response.ok) {
                console.log('✅ Data synced to backend');
                return true;
            } else {
                const error = await response.text();
                console.error('Sync failed:', error);
                return false;
            }
        } catch (error) {
            console.error('Sync request failed:', error);
            return false;
        }
    }

    // UPDATED: Save method now syncs to backend
    save() {
        // Always save to localStorage (instant, works offline)
        localStorage.setItem('vivifyUnifiedData', JSON.stringify(this.data));
        
        // Sync to backend (async, may fail if offline - that's OK)
        this.syncUnifiedDataToBackend().catch(err => {
            console.warn('Background sync failed:', err);
        });
        
        // Clear old data stores
        localStorage.removeItem('habitsData');
        localStorage.removeItem('performanceData');
        localStorage.removeItem(`vivify_challenges_${this.username}`);
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
        // Skip the old habitsData merging since we're using the new unified system
        if (serverData.totalPoints != null) this.data.totalPoints = serverData.totalPoints;
        
        // IGNORE old challenge data from server - only merge if it has the new challenge IDs
        if (serverData.challengeData) {
            const newChallengeIds = [
                'morning-momentum', 'focus-sprint', 'consistency-master',
                'performance-edge', 'elite-performer', 'exam-domination'
            ];
            
            const filteredChallenges = {};
            Object.keys(serverData.challengeData).forEach(challengeId => {
                if (newChallengeIds.includes(challengeId)) {
                    filteredChallenges[challengeId] = serverData.challengeData[challengeId];
                }
            });
            
            this.data.challenges = { ...this.data.challenges, ...filteredChallenges };
            console.log('Filtered out old challenge data from server');
        }
    
        // Handle assessment scores properly
        if (serverData.fitnessScore !== undefined) {
            this.data.scores.physical = serverData.fitnessScore;
            this.data.scores.mental = serverData.mentalScore;
            this.data.scores.nutrition = serverData.nutritionScore;
            this.data.scores.lifeSkills = serverData.lifeSkillsScore;
            
            this.data.scores.overall = Math.round((
                this.data.scores.physical + 
                this.data.scores.mental + 
                this.data.scores.nutrition + 
                this.data.scores.lifeSkills
            ) / 4);
            
            this.data.totalPoints = serverData.overallScore || this.data.totalPoints;
            this.data.totalXP = serverData.overallScore || this.data.totalXP;
                
            this._scoresFromServer = true;
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
            console.log(`New day detected: ${this.data.lastActiveDate} -> ${today}`);
            
            // FIXED: Only reset completion status, NOT streaks
            // Streaks should only reset after 24+ hours of inactivity
            this.getAllHabits().forEach(habit => {
                habit.completed = false; // Reset daily completion status
                // Don't touch habit.streak here - that's handled by missed day logic
            });
            
            // Check if we missed a day (gap of more than 1 day)
            const lastActive = new Date(this.data.lastActiveDate);
            const todayDate = new Date(today);
            const daysDiff = Math.floor((todayDate - lastActive) / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 1) {
                console.log(`Missed ${daysDiff - 1} days, resetting streaks`);
                // Only reset streaks if we actually missed days
                this.getAllHabits().forEach(habit => {
                    habit.streak = 0;
                });
                this.data.streaks = {};
            }
            
            this.data.lastActiveDate = today;
            this.save();
        }
    }

    // UNIFIED COMPLETION METHOD
    async completeHabit(habitId) {
        const habit = this.getAllHabits().find(h => h.id === habitId);
        
        if (!habit || habit.completed) {
            return false;
        }
        
        habit.completed = true;
        const today = new Date().toDateString();
        
        if (!this.data.dailyCompletions[today]) {
            this.data.dailyCompletions[today] = [];
        }
        this.data.dailyCompletions[today].push(habitId);
        
        habit.streak = (habit.streak || 0) + 1;
        this.data.streaks[habitId] = habit.streak;
        
        this.data.totalPoints += habit.points;
        this.data.totalXP += habit.points;
        
        this.updateScoresFromHabit(habit);
        this.logActivity(habit.name, habit.points, 'habit_completed', habitId);
        
        await this.syncToBackend(habitId, habit.points, 'habit_completed');
        
        this.save(); // This now triggers syncUnifiedDataToBackend()
        this.notifyCompletion(`✅ ${habit.name} +${habit.points} XP`, 'success');
        
        return true;
    }
    
    // Add this new method to sync everything
    async syncUnifiedDataToBackend() {
        try {
            const response = await fetch(`${this.baseURL}/users/sync-unified-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.username,
                    unifiedData: {
                        habits: this.data.habits,
                        customHabits: this.data.customHabits,
                        challenges: this.data.challenges,
                        dailyCompletions: this.data.dailyCompletions,
                        streaks: this.data.streaks,
                        scores: this.data.scores,
                        totalPoints: this.data.totalPoints,
                        totalXP: this.data.totalXP,
                        lastActiveDate: this.data.lastActiveDate
                    }
                })
            });
            
            if (response.ok) {
                console.log('Unified data synced to backend');
            }
        } catch (error) {
            console.error('Failed to sync unified data:', error);
        }
    }

    async updateScoresFromHabit(habit) {
        const categoryMap = {
            'Physical Performance': 'physical',
            'Mental Focus': 'mental',
            'Performance Nutrition': 'nutrition',
            'Excellence Habits': 'lifeSkills'
        };
        
        const scoreCategory = categoryMap[habit.category];
        if (scoreCategory && this.data.scores[scoreCategory] !== undefined) {
            const increment = habit.points * 0.1;
            this.data.scores[scoreCategory] = Math.min(100, this.data.scores[scoreCategory] + increment);
        }
        
        // Recalculate overall
        const categoryScores = [
            this.data.scores.physical,
            this.data.scores.mental,
            this.data.scores.nutrition,
            this.data.scores.lifeSkills
        ];
        
        this.data.scores.overall = Math.round(
            categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
        );
        
        // SYNC TO BACKEND
        try {
            await fetch(`${this.baseURL}/users/update-scores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.username,
                    scores: this.data.scores
                })
            });
            console.log('Scores synced to backend');
        } catch (error) {
            console.error('Failed to sync scores:', error);
        }
    }

    calculateScores() {
        if (this._scoresFromServer) return; // trust what the server gave us
      
        const completionRates = this.calculateWeeklyCompletionRates(); // returns 0..1 per category
        this.data.scores.physical   = Math.min(100, 20 + (completionRates.physical   * 80));
        this.data.scores.mental     = Math.min(100, 20 + (completionRates.mental     * 80));
        this.data.scores.nutrition  = Math.min(100, 20 + (completionRates.nutrition  * 80));
        this.data.scores.lifeSkills = Math.min(100, 20 + (completionRates.lifeSkills * 80));
      
        const cats = [
          this.data.scores.physical,
          this.data.scores.mental,
          this.data.scores.nutrition,
          this.data.scores.lifeSkills
        ];
        this.data.scores.overall = Math.round(cats.reduce((s,v)=>s+v,0) / cats.length);
    }
      
      

    calculateWeeklyCompletionRates() {
        const today = new Date();
        const rates = { physical: 0, mental: 0, nutrition: 0, lifeSkills: 0 };
        const counts = { physical: 0, mental: 0, nutrition: 0, lifeSkills: 0 };
    
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
                if (!category) return;
                counts[category] += 1; // one possible completion
                if (dayCompletions.includes(habit.id)) {
                    rates[category] += 1;
                }
            });
        }
    
        return {
            physical:   counts.physical   ? rates.physical   / counts.physical   : 0,
            mental:     counts.mental     ? rates.mental     / counts.mental     : 0,
            nutrition:  counts.nutrition  ? rates.nutrition  / counts.nutrition  : 0,
            lifeSkills: counts.lifeSkills ? rates.lifeSkills / counts.lifeSkills : 0,
        };
    }  
    
    async getLeaderboardData(timeframe = 'weekly') {
        try {
            console.log('Fetching leaderboard data for:', timeframe);
            
            // Add timeframe parameter to the API call
            const response = await fetch(`${this.baseURL}/users?timeframe=${timeframe}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const apiResponse = await response.json();
            console.log('Raw API response:', apiResponse);
            
            // Handle the new API structure that returns {users: [], timeframe, total}
            const leaderboardData = apiResponse.users || apiResponse;
            
            if (!Array.isArray(leaderboardData) || leaderboardData.length === 0) {
                console.warn('No leaderboard data available, using fallback');
                return this.getFallbackLeaderboardData();
            }
            
            // Data is already sorted by the backend
            
            // Find current user
            const username = this.username;
            let currentUser = null;
            let userRank = null;
            let userScore = 0;
            
            for (let i = 0; i < leaderboardData.length; i++) {
                const user = leaderboardData[i];
                if (user.username === username) {
                    currentUser = user;
                    userRank = i + 1;
                    userScore = user.score || 0;
                    break;
                }
            }
            
            // Transform data for display
            const worldData = leaderboardData.map((user, index) => {
                const isCurrentUser = currentUser && user.username === currentUser.username;
                
                return {
                    _id: user.id,
                    realName: user.username || `User${index + 1}`,
                    displayName: user.displayName || user.username || `User${index + 1}`,
                    school: user.school || 'Knox Grammar',
                    score: user.score || 0,
                    rankChange: null,
                    isCurrentUser: isCurrentUser,
                    isAnonymous: false
                };
            });
            
            // Use the scoreBreakdown from the backend response
            let breakdown = {
                assessment: 0,
                habits: 0,
                challenges: 0
            };
            
            if (currentUser && currentUser.scoreBreakdown) {
                breakdown = currentUser.scoreBreakdown;
            }
            
            console.log('Final breakdown calculation:', breakdown);
            console.log('Timeframe processed:', timeframe);
            
            const result = {
                world: worldData,
                friends: [],
                userRank: userRank || 1,
                userScore: userScore,
                scoreBreakdown: breakdown,
                timeframe: timeframe
            };
            
            console.log('Final leaderboard result:', result);
            return result;
            
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            return this.getFallbackLeaderboardData();
        }
    }

    _computeLocalBreakdown(range = 'all') {
        // decide the start boundary based on the selected range
        const now = new Date();
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - ((now.getDay()+6)%7)); startOfWeek.setHours(0,0,0,0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
        const after = range === 'week' ? +startOfWeek :
                      range === 'month' ? +startOfMonth : 0;
      
        const acts = (this.data && this.data.activities) ? this.data.activities : [];
        let habits = 0, challenges = 0, assessments = 0;
      
        for (const ev of acts) {
          if (!ev || (after && +new Date(ev.timestamp || ev.ts || 0) < after)) continue;
          const xp = Number(ev.xp || ev.points || 0);
          switch ((ev.type || '').toLowerCase()) {
            case 'habit':
              habits += xp; break;
            case 'challenge-join':
            case 'challenge-complete':
            case 'challenge':
              challenges += xp; break;
            case 'assessment':
              assessments += xp; break;
            default:
              // ignore
          }
        }
        const total = habits + challenges + assessments;
        return { habits, challenges, assessments, total };
      }
      
      _buildLocalLeaderboardFallback(range = 'all') {
        const breakdown = this._computeLocalBreakdown(range);
        const me = (this.getCurrentUser?.() || {}).name || 'You';
        return {
          myRank: 1,
          breakdown,
          world: { users: [{ rank: 1, name: me, score: breakdown.total, you: true }], totalUsers: 1, top3: [] },
          friends: { users: [] }
        };
      }
      

    // Also add these methods for friend functionality
    async sendFriendRequest(targetUsername, message) {
        try {
            const response = await fetch('https://vivify-backend.onrender.com/api/friends/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    targetUsername,
                    message
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send friend request');
            }
            
            const result = await response.json();
            return result.success;
            
        } catch (error) {
            console.error('Error sending friend request:', error);
            return false;
        }
    }

    async syncExistingAssessmentData() {
        try {
            // Check for existing assessment data in localStorage
            const localAssessment = localStorage.getItem('vivify:assessmentResults');
            const localUserProfile = localStorage.getItem('userProfile');
            
            if (!localAssessment) {
                console.log('No local assessment data found');
                return;
            }
            
            const assessmentData = JSON.parse(localAssessment);
            const userProfile = JSON.parse(localUserProfile || '{}');
            
            // Check if we have scores to sync
            if (assessmentData.scores && Object.keys(assessmentData.scores).length > 0) {
                console.log('Found local assessment data:', assessmentData.scores);
                
                // Check if user already has assessment data in database
                const hasDbAssessment = this.data.scores && 
                    (this.data.scores.physical > 0 || this.data.scores.mental > 0 || 
                     this.data.scores.nutrition > 0 || this.data.scores.lifeSkills > 0);
                
                if (!hasDbAssessment) {
                    console.log('User has no assessment data in database, syncing...');
                    
                    // Prepare the sync data
                    const syncData = {
                        username: this.username,
                        fitnessScore: assessmentData.scores.fitness || assessmentData.scores.physical || 0,
                        mentalScore: assessmentData.scores.mental || 0,
                        nutritionScore: assessmentData.scores.nutrition || 0,
                        lifeSkillsScore: assessmentData.scores.lifeSkills || assessmentData.scores.lifestyle || 0,
                        hasCompletedAssessment: true,
                        lastAssessmentDate: assessmentData.completedAt || assessmentData.timestamp || new Date().toISOString()
                    };
                    
                    console.log('Syncing data:', syncData);
                    
                    // Sync to backend
                    const response = await fetch(`${this.baseURL}/users/sync-assessment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(syncData)
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('Successfully synced assessment data:', result);
                        
                        // Update local data
                        this.data.scores = {
                            ...this.data.scores,
                            physical: syncData.fitnessScore,
                            mental: syncData.mentalScore,
                            nutrition: syncData.nutritionScore,
                            lifeSkills: syncData.lifeSkillsScore
                        };
                        this.data.hasCompletedAssessment = true;
                        
                        // Show success notification
                        if (typeof showNotification === 'function') {
                            showNotification('Your previous assessment data has been recovered and synced!', 'success');
                        }
                        
                        // Refresh current view if on dashboard or leaderboard
                        if (typeof currentTab !== 'undefined' && (currentTab === 'dashboard' || currentTab === 'leaderboard')) {
                            setTimeout(() => {
                                if (typeof loadTabContent === 'function') {
                                    loadTabContent(currentTab);
                                }
                            }, 1000);
                        }
                        
                    } else {
                        const error = await response.text();
                        console.error('Failed to sync assessment data:', error);
                    }
                } else {
                    console.log('User already has assessment data in database');
                }
            } else {
                console.log('No valid assessment scores found in localStorage');
            }
        } catch (error) {
            console.error('Error syncing existing assessment data:', error);
        }
    }

    // CHALLENGE METHODS

    // FIXED joinChallenge method in VivifyUnifiedTracker class
    async joinChallenge(challengeId) {
        const challenge = challenges[challengeId];
        if (!challenge) {
            console.error('Challenge not found:', challengeId);
            return false;
        }
        
        // CRITICAL FIX: Check if already joined (prevent duplicates)
        if (this.data.challenges[challengeId]?.joined) {
            console.log('Already joined challenge:', challengeId);
            this.notifyCompletion('You are already in this challenge', 'info');
            return false;
        }

        // ADDITIONAL CHECK: Look for existing activities to prevent duplicates
        const existingJoinActivity = this.data.activities.find(activity => 
            activity.type === 'challenge_joined' && 
            activity.description?.includes(challenge.name)
        );
        
        if (existingJoinActivity) {
            console.log('Found existing join activity, preventing duplicate');
            this.notifyCompletion('You have already joined this challenge', 'info');
            
            // Sync local state with what should be reality
            this.data.challenges[challengeId] = {
                joined: true,
                startDate: existingJoinActivity.timestamp,
                completedDays: [],
                lastCompletedDate: null,
                completed: false,
                streak: 0,
                totalDays: 0,
                daysRemaining: challenge.duration,
                progressPercentage: 0
            };
            
            this.save();
            return false;
        }

        const now = new Date();
        this.data.challenges[challengeId] = {
            joined: true,
            startDate: now.toISOString(),
            completedDays: [],
            lastCompletedDate: null,
            completed: false,
            streak: 0,
            totalDays: 0,
            daysRemaining: challenge.duration,
            progressPercentage: 0
        };

        // Award join points ONCE
        this.data.totalPoints += 25;
        this.data.totalXP += 25;
        
        // Log activity
        this.logActivity(`Joined ${challenge.name}`, 25, 'challenge_joined', challengeId);
        
        // Sync to backend
        await this.syncToBackend(`challenge_${challengeId}`, 25, 'challenge_joined');
        
        this.save();
        this.notifyCompletion(`Challenge joined! Track daily progress to earn rewards`, 'success');
        return true;
    }

    // Add this method to VivifyUnifiedTracker class for cleaning up duplicates
    cleanupDuplicateActivities() {
        console.log('Starting duplicate activity cleanup...');
        
        if (!this.data.activities || !Array.isArray(this.data.activities)) {
            console.log('No activities to clean up');
            return;
        }
        
        const originalCount = this.data.activities.length;
        const seenActivities = new Set();
        const cleanActivities = [];
        let pointsToSubtract = 0;
        
        // Group activities to identify duplicates
        const activityGroups = {};
        
        this.data.activities.forEach((activity, index) => {
            if (!activity || !activity.type) return;
            
            // Create a unique key for challenge join activities
            let uniqueKey;
            if (activity.type === 'challenge_joined') {
                // For challenge joins, use type + challenge name
                const challengeName = activity.description?.replace('Joined ', '') || activity.name;
                uniqueKey = `${activity.type}_${challengeName}`;
            } else if (activity.type === 'challenge_daily' || activity.type === 'challenge_completed') {
                // For daily/completion, allow multiples but track by challenge + date
                const date = new Date(activity.timestamp).toDateString();
                const challengeName = activity.description?.split(' of ')[1] || activity.name;
                uniqueKey = `${activity.type}_${challengeName}_${date}`;
            } else {
                // For other activities, use type + name + date
                const date = new Date(activity.timestamp).toDateString();
                uniqueKey = `${activity.type}_${activity.name || activity.description}_${date}`;
            }
            
            if (!activityGroups[uniqueKey]) {
                activityGroups[uniqueKey] = [];
            }
            activityGroups[uniqueKey].push({ activity, index });
        });
        
        // Process each group
        Object.entries(activityGroups).forEach(([key, group]) => {
            if (group.length > 1) {
                console.log(`Found ${group.length} duplicates for: ${key}`);
                
                // Keep the earliest one (first timestamp)
                group.sort((a, b) => new Date(a.activity.timestamp) - new Date(b.activity.timestamp));
                const keeper = group[0];
                const duplicates = group.slice(1);
                
                // Add the keeper to clean activities
                cleanActivities.push(keeper.activity);
                
                // Calculate points to subtract from duplicates
                duplicates.forEach(dup => {
                    const points = dup.activity.points || 0;
                    pointsToSubtract += points;
                    console.log(`Removing duplicate: ${dup.activity.description} (-${points} points)`);
                });
            } else {
                // No duplicates, keep the activity
                cleanActivities.push(group[0].activity);
            }
        });
        
        // Update the data
        this.data.activities = cleanActivities;
        
        // Subtract the duplicate points
        if (pointsToSubtract > 0) {
            this.data.totalPoints = Math.max(0, (this.data.totalPoints || 0) - pointsToSubtract);
            this.data.totalXP = Math.max(0, (this.data.totalXP || 0) - pointsToSubtract);
            
            console.log(`Cleanup complete:
    - Removed ${originalCount - cleanActivities.length} duplicate activities
    - Subtracted ${pointsToSubtract} phantom points
    - New total points: ${this.data.totalPoints}
    - New activities count: ${cleanActivities.length}`);
            
            // Save the cleaned data
            this.save();
            
            // Show notification to user
            this.notifyCompletion(`Cleaned up ${originalCount - cleanActivities.length} duplicate activities and corrected point totals`, 'success');
            
            return {
                removed: originalCount - cleanActivities.length,
                pointsSubtracted: pointsToSubtract,
                newTotal: this.data.totalPoints
            };
        } else {
            console.log('No duplicates found - data is clean');
            return { removed: 0, pointsSubtracted: 0, newTotal: this.data.totalPoints };
        }
    }

    // Add this method to run cleanup automatically on initialize
    async initializeWithCleanup() {
        await this.initialize();
        
        // Run cleanup once per session to fix any existing duplicates
        const hasRunCleanup = sessionStorage.getItem(`vivify_cleanup_${this.username}`);
        if (!hasRunCleanup) {
            console.log('Running one-time duplicate cleanup...');
            this.cleanupDuplicateActivities();
            sessionStorage.setItem(`vivify_cleanup_${this.username}`, 'true');
        }
        
        return this;
    }

    // Add daily progress tracking
    async completeChallengeDay(challengeId) {
        const challenge = challenges[challengeId];
        const userChallenge = this.data.challenges[challengeId];
        
        if (!userChallenge?.joined || userChallenge.completed) return false;
        
        const today = new Date().toISOString().split('T')[0];
        if (userChallenge.completedDays.includes(today)) {
            this.notifyCompletion('Already completed today!', 'info');
            return false;
        }

        // Mark day complete
        userChallenge.completedDays.push(today);
        userChallenge.lastCompletedDate = today;
        userChallenge.totalDays = userChallenge.completedDays.length;
        userChallenge.daysRemaining = challenge.duration - userChallenge.totalDays;
        userChallenge.progressPercentage = Math.round((userChallenge.totalDays / challenge.duration) * 100);
        
        // Award daily points
        const dailyPoints = challenge.dailyPoints || 15;
        this.data.totalPoints += dailyPoints;
        this.data.totalXP += dailyPoints;
        
        this.logActivity(`Day ${userChallenge.totalDays} of ${challenge.name}`, dailyPoints, 'challenge_daily');
        
        // Check completion
        if (userChallenge.totalDays >= challenge.duration) {
            userChallenge.completed = true;
            const completionBonus = challenge.points;
            this.data.totalPoints += completionBonus;
            this.data.totalXP += completionBonus;
            
            this.logActivity(`Completed ${challenge.name}!`, completionBonus, 'challenge_completed');
            this.notifyCompletion(`🏆 Challenge completed! +${completionBonus + dailyPoints} total points`, 'success');
        } else {
            this.notifyCompletion(`Day ${userChallenge.totalDays}/${challenge.duration} complete! +${dailyPoints} points`, 'success');
        }
        
        await this.syncToBackend(`challenge_${challengeId}`, dailyPoints, 'challenge_daily');
        this.save();
        return true;
    }

    // Add this method inside the VivifyUnifiedTracker class

    checkChallengeStreaks() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
        
        Object.entries(this.data.challenges).forEach(([id, userChallenge]) => {
            if (!userChallenge?.joined || userChallenge.completed) return;
            
            const challenge = challenges[id];
            if (!challenge) return;
            
            const lastCompleted = userChallenge.lastCompletedDate;
            const daysSinceStart = Math.floor((new Date() - new Date(userChallenge.startDate)) / (1000 * 60 * 60 * 24));
            
            // Check if they're behind schedule
            if (daysSinceStart > userChallenge.totalDays && lastCompleted !== today) {
                // They missed a day - show warning
                userChallenge.streak = 0;
                userChallenge.behindSchedule = true;
                
                this.notifyCompletion(`⚠️ ${challenge.name}: You're behind schedule! Complete today to stay in the challenge.`, 'error');
            }
            
            // Check if they've been inactive for 2+ days (challenge failure)
            if (lastCompleted && lastCompleted !== today && lastCompleted !== yesterday) {
                const daysSinceLast = Math.floor((new Date() - new Date(lastCompleted + 'T00:00:00')) / (1000 * 60 * 60 * 24));
                
                if (daysSinceLast >= 2) {
                    userChallenge.failed = true;
                    userChallenge.joined = false;
                    
                    this.notifyCompletion(`❌ Challenge failed: ${challenge.name}. You can restart anytime!`, 'error');
                    
                    // Log the failure
                    this.logActivity(`Failed challenge: ${challenge.name}`, 0, 'challenge_failed', id);
                }
            }
        });
        
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

    logActivity(name, points, type, habitId = null) {
        const activityEntry = {
            id: Date.now(),
            name: name,
            points: points,
            type: type,
            timestamp: new Date().toISOString(),
            description: name
        };
        
        // Add habitId for habit completions
        if (habitId && type === 'habit_completed') {
            activityEntry.habitId = habitId;
        }
        
        this.data.activities.unshift(activityEntry);
        
        // Keep last 50 activities
        if (this.data.activities.length > 50) {
            this.data.activities = this.data.activities.slice(0, 50);
        }
    }

    async syncToBackend(habitId, points, activityType = 'habit_completed') {
        try {
            // Update habit points in the database
            const response = await fetch(`${this.baseURL}/users/update-habit-points`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    username: this.username,
                    pointsToAdd: points,
                    habitId: habitId,
                    activityType: activityType,  // ADD THIS
                    timestamp: new Date().toISOString()  // ADD THIS
                })
            });
            
            if (response.ok) {
                console.log(`Synced ${points} habit points to backend with activity log`);
            } else {
                console.error('Failed to sync to backend:', await response.text());
            }
            
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    /*    
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
    } */

        calculateCurrentStreak() {
            let streak = 0;
            let checkDate = new Date();
            const habits = this.getAllHabits();
            
            // Start from today and work backwards
            while (true) {
                const dateStr = checkDate.toDateString();
                const dayCompletions = this.data.dailyCompletions[dateStr] || [];
                
                // Consider a day "complete" if at least 70% of habits were done
                const completionRate = habits.length > 0 ? dayCompletions.length / habits.length : 0;
                
                if (completionRate >= 0.7) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    // If today has no completions, don't count it against streak yet
                    if (streak === 0 && dateStr === new Date().toDateString()) {
                        checkDate.setDate(checkDate.getDate() - 1);
                        continue;
                    }
                    break;
                }
                
                // Safety break to prevent infinite loops
                if (streak > 365) break;
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
        
        // Use the existing method and average the rates
        const rates = this.calculateWeeklyCompletionRates();
        const avgRate = Object.values(rates).reduce((sum, rate) => sum + rate, 0) / 4;
        const weeklyRate = Math.round(avgRate * 100);
    
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
window.vivifyTracker = null;
