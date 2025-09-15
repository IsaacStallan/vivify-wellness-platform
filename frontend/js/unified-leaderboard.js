// unified-leaderboard.js - Add this to both pages

class UnifiedLeaderboardManager {
    constructor() {
        this.STORAGE_KEY = 'vivifyLeaderboard'; // Single storage key
        this.UPDATE_EVENT = 'vivifyLeaderboardUpdate';
        this.initialized = false;
        this.currentUser = null;
    }

    initialize(userId, username, school = 'Knox Grammar') {
        this.currentUser = {
            userId: userId,
            username: username,
            displayName: username,
            school: school
        };
        this.initialized = true;
        
        // Migrate old data if it exists
        this.migrateOldData();
        
        console.log('UnifiedLeaderboardManager initialized for:', username);
        return this;
    }

    migrateOldData() {
        // Migrate from old storage keys to unified system
        const oldGlobal = JSON.parse(localStorage.getItem('globalLeaderboard') || '[]');
        const oldChallenges = JSON.parse(localStorage.getItem('challengesLeaderboard') || '[]');
        const existing = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        
        if (existing.length === 0 && (oldGlobal.length > 0 || oldChallenges.length > 0)) {
            // Merge old data, prioritizing challenges data
            const merged = [];
            const seenUsers = new Set();
            
            [...oldChallenges, ...oldGlobal].forEach(entry => {
                const key = entry.userId || entry.username;
                if (!seenUsers.has(key)) {
                    seenUsers.add(key);
                    merged.push(this.normalizeUserEntry(entry));
                }
            });
            
            this.saveLeaderboard(merged);
            console.log('Migrated old leaderboard data:', merged.length, 'users');
        }
    }

    normalizeUserEntry(entry) {
        // Ensure consistent data structure
        return {
            userId: entry.userId || entry.username,
            username: entry.username || entry.displayName || 'Student',
            displayName: entry.displayName || entry.username || 'Student',
            school: entry.school || 'Knox Grammar',
            overallScore: entry.overallScore || entry.totalPoints || 0,
            level: entry.level || Math.floor((entry.overallScore || 0) / 500) + 1,
            activeChallenges: entry.activeChallenges || 0,
            completedChallenges: entry.completedChallenges || 0,
            focusMinutes: entry.focusMinutes || 0,
            gamesPlayed: entry.gamesPlayed || 0,
            streak: entry.streak || entry.currentStreak || 0,
            lastActive: entry.lastActive || Date.now()
        };
    }

    getLeaderboard() {
        const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        return data.map(entry => this.normalizeUserEntry(entry))
                  .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
    }

    saveLeaderboard(leaderboard) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leaderboard));
        
        // CRITICAL: Also update old storage keys for backward compatibility
        localStorage.setItem('globalLeaderboard', JSON.stringify(leaderboard));
        localStorage.setItem('challengesLeaderboard', JSON.stringify(leaderboard));
    }

    addPoints(points, activityType = 'general', metadata = {}) {
        if (!this.initialized || !this.currentUser || points <= 0) {
            console.warn('Cannot add points: not initialized or invalid points');
            return false;
        }

        try {
            const leaderboard = this.getLeaderboard();
            let userEntry = leaderboard.find(entry => 
                entry.userId === this.currentUser.userId || 
                entry.username === this.currentUser.username
            );

            if (!userEntry) {
                // Create new user entry
                userEntry = this.normalizeUserEntry({
                    ...this.currentUser,
                    overallScore: 0
                });
                leaderboard.push(userEntry);
            }

            // CRITICAL: Add points instead of setting them
            const oldScore = userEntry.overallScore || 0;
            userEntry.overallScore = oldScore + points;
            userEntry.level = Math.floor(userEntry.overallScore / 500) + 1;
            userEntry.lastActive = Date.now();

            // Update activity-specific stats
            if (activityType === 'focus_timer' || activityType === 'brain_training') {
                userEntry.focusMinutes = metadata.focusMinutes || userEntry.focusMinutes || 0;
                userEntry.gamesPlayed = (userEntry.gamesPlayed || 0) + 1;
            }

            // Re-sort and save
            const sortedLeaderboard = leaderboard.sort((a, b) => 
                (b.overallScore || 0) - (a.overallScore || 0)
            );
            
            this.saveLeaderboard(sortedLeaderboard);

            // Broadcast update
            this.broadcastUpdate({
                userId: this.currentUser.userId,
                username: this.currentUser.username,
                pointsAdded: points,
                newScore: userEntry.overallScore,
                activityType: activityType,
                metadata: metadata
            });

            console.log(`Added ${points} points for ${activityType}. New score: ${userEntry.overallScore}`);
            return true;

        } catch (error) {
            console.error('Error adding points:', error);
            return false;
        }
    }

    getCurrentUserScore() {
        const leaderboard = this.getLeaderboard();
        const userEntry = leaderboard.find(entry => 
            entry.userId === this.currentUser?.userId || 
            entry.username === this.currentUser?.username
        );
        return userEntry?.overallScore || 0;
    }

    getCurrentUserRank() {
        const leaderboard = this.getLeaderboard();
        const userIndex = leaderboard.findIndex(entry => 
            entry.userId === this.currentUser?.userId || 
            entry.username === this.currentUser?.username
        );
        return userIndex >= 0 ? userIndex + 1 : null;
    }

    broadcastUpdate(data) {
        const event = new CustomEvent(this.UPDATE_EVENT, { detail: data });
        window.dispatchEvent(event);
    }

    onUpdate(callback) {
        window.addEventListener(this.UPDATE_EVENT, (event) => {
            callback(event.detail);
        });
    }

    // Display helpers for different page formats
    displayForAttentionTraining(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const leaderboard = this.getLeaderboard().slice(0, 10);
        container.innerHTML = '';

        leaderboard.forEach((entry, index) => {
            const isCurrentUser = entry.username === this.currentUser?.username;
            const rank = index + 1;
            
            let rankStyle = '#f39c12';
            if (rank === 1) rankStyle = '#ffd700';
            else if (rank === 2) rankStyle = '#c0c0c0';
            else if (rank === 3) rankStyle = '#cd7f32';
            
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            if (isCurrentUser) {
                item.style.border = '2px solid #f39c12';
                item.style.background = 'rgba(243, 156, 18, 0.1)';
            }
            
            item.innerHTML = `
                <div class="rank" style="color: ${rankStyle}">${rank}</div>
                <div class="player-avatar">${entry.username.charAt(0).toUpperCase()}</div>
                <div class="player-info">
                    <div class="player-name">${entry.displayName}${isCurrentUser ? ' (You)' : ''}</div>
                    <div class="player-school">${entry.school}</div>
                </div>
                <div class="player-stats">
                    <div class="focus-time">${entry.overallScore} pts</div>
                    <div class="streak-count">Level ${entry.level}</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    displayForChallengesPage(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const leaderboard = this.getLeaderboard().slice(0, 10);
        container.innerHTML = '';

        leaderboard.forEach((entry, index) => {
            const isCurrentUser = entry.username === this.currentUser?.username;
            
            let icon = '<i class="fas fa-user"></i>';
            if (index === 0) icon = '<i class="fas fa-crown" style="color:#f39c12;"></i>';
            else if (index === 1) icon = '<i class="fas fa-medal" style="color:#c0c0c0;"></i>';
            else if (index === 2) icon = '<i class="fas fa-medal" style="color:#cd7f32;"></i>';
            
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            if (isCurrentUser) {
                item.classList.add('current-user');
            }
            
            item.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-avatar">${icon}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${entry.displayName}${isCurrentUser ? ' (You)' : ''}</div>
                    <div class="leaderboard-school">${entry.school}</div>
                </div>
                <div class="overall-score">
                    <div class="leaderboard-score">${entry.overallScore.toLocaleString()}</div>
                    <div class="level-badge">Level ${entry.level}</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
}

// Global instance
window.VivifyLeaderboard = new UnifiedLeaderboardManager();

// Usage examples:

// In attention-training.html, replace syncPointsToUnifiedLeaderboard with:
function addPointsToLeaderboard(points, activityType) {
    return window.VivifyLeaderboard.addPoints(points, activityType, {
        focusMinutes: parseInt(document.getElementById('total-minutes')?.textContent || '0')
    });
}

// In challenges.html, when user completes a challenge:
function onChallengeComplete(challengeId, points) {
    return window.VivifyLeaderboard.addPoints(points, 'challenge_complete', {
        challengeId: challengeId
    });
}

// Initialize on both pages:
// const user = getLoggedInUser();
// window.VivifyLeaderboard.initialize(user.userId, user.username, user.school);

// Listen for updates on both pages:
// window.VivifyLeaderboard.onUpdate((data) => {
//     console.log('Leaderboard updated:', data);
//     // Refresh displays
//     window.VivifyLeaderboard.displayForChallengesPage('leaderboardList');
// });