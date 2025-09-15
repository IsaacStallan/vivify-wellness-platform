// FIXED: unified-leaderboard.js - Updated version
class UnifiedLeaderboardManager {
    constructor() {
        this.STORAGE_KEY = 'vivifyLeaderboard';
        this.UPDATE_EVENT = 'vivifyLeaderboardUpdate';
        this.initialized = false;
        this.currentUser = null;
        this.updateListeners = [];
    }

    initialize(userId, username, school = 'Knox Grammar') {
        this.currentUser = {
            userId: userId,
            username: username,
            displayName: username,
            school: school
        };
        this.initialized = true;
        
        // Ensure user exists in leaderboard
        this.ensureUserExists();
        
        console.log('UnifiedLeaderboardManager initialized for:', username);
        return this;
    }

    ensureUserExists() {
        const leaderboard = this.getLeaderboard();
        let userEntry = leaderboard.find(entry => 
            entry.userId === this.currentUser.userId || 
            entry.username === this.currentUser.username
        );

        if (!userEntry) {
            userEntry = this.normalizeUserEntry({
                ...this.currentUser,
                overallScore: 0
            });
            leaderboard.push(userEntry);
            this.saveLeaderboard(leaderboard);
        }
    }

    normalizeUserEntry(entry) {
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
        // Keep backward compatibility
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
                this.ensureUserExists();
                userEntry = leaderboard.find(entry => 
                    entry.userId === this.currentUser.userId || 
                    entry.username === this.currentUser.username
                );
            }

            // CRITICAL FIX: Add points properly
            const oldScore = userEntry.overallScore || 0;
            userEntry.overallScore = oldScore + points;
            userEntry.level = Math.floor(userEntry.overallScore / 500) + 1;
            userEntry.lastActive = Date.now();

            // Update activity-specific stats
            if (activityType.includes('focus') || activityType.includes('brain')) {
                userEntry.focusMinutes = metadata.focusMinutes || userEntry.focusMinutes || 0;
                userEntry.gamesPlayed = (userEntry.gamesPlayed || 0) + 1;
            }

            // Sort and save
            const sortedLeaderboard = leaderboard.sort((a, b) => 
                (b.overallScore || 0) - (a.overallScore || 0)
            );
            
            this.saveLeaderboard(sortedLeaderboard);

            // CRITICAL FIX: Sync ALL displays immediately
            this.syncAllDisplays();

            // Broadcast update AFTER sync
            const updateData = {
                userId: this.currentUser.userId,
                username: this.currentUser.username,
                pointsAdded: points,
                newScore: userEntry.overallScore,
                activityType: activityType,
                metadata: metadata
            };

            // Call all registered listeners immediately
            this.updateListeners.forEach(callback => {
                try {
                    callback(updateData);
                } catch (error) {
                    console.error('Error in update listener:', error);
                }
            });

            // Also dispatch event
            setTimeout(() => {
                const event = new CustomEvent(this.UPDATE_EVENT, { detail: updateData });
                window.dispatchEvent(event);
            }, 100);

            console.log(`Added ${points} points for ${activityType}. New score: ${userEntry.overallScore}`);
            return true;

        } catch (error) {
            console.error('Error adding points:', error);
            return false;
        }
    }

    // CRITICAL FIX: Sync all displays when points are added
    syncAllDisplays() {
        const currentScore = this.getCurrentUserScore();
        
        // Update focus score displays (attention training page)
        const focusScoreEl = document.getElementById('focus-score');
        if (focusScoreEl) {
            focusScoreEl.textContent = currentScore;
        }

        // Update challenge stats (challenges page)
        const totalPointsEl = document.getElementById('totalPoints');
        if (totalPointsEl) {
            totalPointsEl.textContent = currentScore;
        }

        // Force refresh leaderboard displays
        setTimeout(() => {
            if (document.getElementById('leaderboardList')) {
                this.displayForChallengesPage('leaderboardList');
            }
            if (document.getElementById('focus-leaderboard-list')) {
                this.displayForAttentionTraining('focus-leaderboard-list');
            }
        }, 50);
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

    onUpdate(callback) {
        this.updateListeners.push(callback);
        
        // Also listen to events for backward compatibility
        window.addEventListener(this.UPDATE_EVENT, (event) => {
            callback(event.detail);
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
}

// Global instance
window.VivifyLeaderboard = new UnifiedLeaderboardManager();

// FIXED: Updated usage for attention training page
// Replace your existing addPointsToLeaderboard function with this:
function addPointsToLeaderboard(points, activityType) {
    if (!window.VivifyLeaderboard) {
        console.error('VivifyLeaderboard not available');
        return false;
    }
    
    // CRITICAL FIX: Don't update local displays manually - let the unified system handle it
    const success = window.VivifyLeaderboard.addPoints(points, activityType, {
        focusMinutes: parseInt(document.getElementById('total-minutes')?.textContent || '0')
    });
    
    if (success) {
        console.log(`Successfully added ${points} points for ${activityType}`);
    }
    
    return success;
}

// FIXED: Updated game completion functions
// In your Stroop game, replace the point update section with:
function endStroopGame() {
    gameActive = false;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    
    const basePoints = 50;
    const pointsResult = calculatePoints(basePoints, 'stroop', accuracy);
    
    // CRITICAL FIX: Only call the unified leaderboard - don't manually update local displays
    const success = addPointsToLeaderboard(pointsResult.points, 'brain_training');
    
    if (success) {
        container.innerHTML = `
            <h3>Stroop Challenge Complete!</h3>
            <div class="game-score">
                <div class="score-value">${accuracy}%</div>
                <div class="score-label">Accuracy</div>
            </div>
            <p>Level ${gameLevel} • ${correctAnswers}/${totalQuestions} correct</p>
            <p><strong>+${pointsResult.points} focus points earned</strong></p>
            <p>Your total score: ${window.VivifyLeaderboard.getCurrentUserScore()} points</p>
            
            <button class="btn btn-primary" onclick="gameLevel++; startStroopGame(document.getElementById('game-content'))">Next Level</button>
            <button class="btn btn-secondary" onclick="closeGame()">Close</button>
        `;
    }
}