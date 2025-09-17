// js/card-system.js - Integration with your existing habit tracker

class VivifyCardSystem {
    constructor() {
        this.username = localStorage.getItem('username');
        this.baseURL = 'https://vivify-backend.onrender.com/api';
        this.cards = [];
        this.activeDeck = null;
        this.pendingCardGeneration = false;
        
        if (!this.username) {
            console.warn('No username found - card system disabled');
            return;
        }
        
        this.init();
    }

    async init() {
        console.log('🎴 Initializing Vivify Card System for', this.username);
        await this.loadUserCards();
        this.setupEventListeners();
        this.enhanceExistingUI();
    }

    // Load user's existing cards
    async loadUserCards() {
        try {
            const response = await fetch(`${this.baseURL}/cards/${this.username}`);
            if (response.ok) {
                const data = await response.json();
                this.cards = data.cards || [];
                this.battleData = data.battleData || {};
                console.log(`📊 Loaded ${this.cards.length} cards`);
            }
        } catch (error) {
            console.error('Error loading cards:', error);
        }
    }

    // Generate card from habit completion
    async generateCardFromHabit(habitType, streakLength = 1, verified = false, verificationMethod = 'none') {
        if (this.pendingCardGeneration) {
            console.log('Card generation already in progress...');
            return null;
        }

        this.pendingCardGeneration = true;

        try {
            console.log(`🎴 Generating card: ${habitType}, streak: ${streakLength}, verified: ${verified}`);
            
            const response = await fetch(`${this.baseURL}/cards/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.username,
                    habitType,
                    streakLength,
                    verified,
                    verificationMethod
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const newCard = data.card;
                    this.cards.push(newCard);
                    
                    // Show card unlock notification
                    this.showCardUnlockNotification(newCard, data.message);
                    
                    // Update UI elements
                    this.updateCardCountDisplay();
                    
                    console.log(`🎉 Card generated: ${newCard.name} (${newCard.rarity})`);
                    return newCard;
                }
            } else if (response.status === 429) {
                console.log('⏰ Card generation rate limited');
                return null;
            }
        } catch (error) {
            console.error('Error generating card:', error);
        } finally {
            this.pendingCardGeneration = false;
        }

        return null;
    }

    // Enhanced challenge completion with card generation
    async completeChallenge(challengeId, streakLength = 1, verified = false) {
        // Map challenge to habit type
        const challengeHabitMap = {
            'fitness-foundation': 'fitness',
            'morning-energy': 'fitness', 
            'deep-work': 'study',
            'stress-resilience': 'mental',
            'elite-morning': 'life_skills',
            'time-mastery': 'study'
        };

        const habitType = challengeHabitMap[challengeId] || 'study';
        
        // Generate card BEFORE sending to your existing progress API
        const newCard = await this.generateCardFromHabit(habitType, streakLength, verified);
        
        // Continue with your existing challenge completion logic
        // (This integrates with your existing challengeManager.completeDay)
        
        return newCard;
    }

    // Show card unlock notification
    showCardUnlockNotification(card, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'card-unlock-notification';
        notification.innerHTML = `
            <div class="card-unlock-content">
                <div class="card-unlock-header">
                    <i class="fas fa-star"></i>
                    <span>New Card Unlocked!</span>
                </div>
                <div class="card-unlock-card ${card.rarity}">
                    <div class="card-unlock-name">${card.name}</div>
                    <div class="card-unlock-power">${card.power}</div>
                    <div class="card-unlock-rarity">${card.rarity.toUpperCase()}</div>
                </div>
                <div class="card-unlock-message">${message}</div>
                <button class="card-unlock-close" onclick="this.parentElement.parentElement.remove()">
                    View Collection
                </button>
            </div>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
            border: 2px solid ${this.getRarityColor(card.rarity)};
            border-radius: 20px;
            padding: 2rem;
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            animation: cardUnlockAnimation 0.6s ease-out;
            max-width: 400px;
            text-align: center;
            color: white;
        `;

        // Add CSS animation
        if (!document.getElementById('card-unlock-styles')) {
            const styles = document.createElement('style');
            styles.id = 'card-unlock-styles';
            styles.textContent = `
                @keyframes cardUnlockAnimation {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) rotateY(180deg); }
                    50% { transform: translate(-50%, -50%) scale(1.1) rotateY(90deg); }
                    100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotateY(0deg); }
                }
                
                .card-unlock-notification {
                    font-family: 'Inter', sans-serif;
                }
                
                .card-unlock-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #f39c12;
                }
                
                .card-unlock-card {
                    background: rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    margin: 1rem 0;
                    border: 1px solid;
                }
                
                .card-unlock-card.common { border-color: #8e8e93; }
                .card-unlock-card.uncommon { border-color: #34c759; }
                .card-unlock-card.rare { border-color: #007aff; }
                .card-unlock-card.epic { border-color: #af52de; }
                .card-unlock-card.legendary { 
                    border-color: #ff9500; 
                    background: linear-gradient(145deg, rgba(255,149,0,0.2), rgba(255,149,0,0.1));
                }
                
                .card-unlock-name {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                
                .card-unlock-power {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #ff3b30;
                    margin: 0.5rem 0;
                }
                
                .card-unlock-rarity {
                    font-size: 0.9rem;
                    font-weight: bold;
                    opacity: 0.8;
                }
                
                .card-unlock-message {
                    margin: 1rem 0;
                    color: rgba(255,255,255,0.8);
                }
                
                .card-unlock-close {
                    background: #f39c12;
                    color: #000;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .card-unlock-close:hover {
                    background: #e67e22;
                    transform: translateY(-2px);
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);

        // Click to view collection
        notification.querySelector('.card-unlock-close').addEventListener('click', () => {
            window.location.href = 'card-collection.html';
        });
    }

    // Setup event listeners for existing UI elements
    setupEventListeners() {
        // Listen for challenge completions
        document.addEventListener('challengeCompleted', (event) => {
            const { challengeId, streakLength, verified } = event.detail;
            this.completeChallenge(challengeId, streakLength, verified);
        });

        // Listen for habit completions
        document.addEventListener('habitCompleted', (event) => {
            const { habitType, streakLength, verified } = event.detail;
            this.generateCardFromHabit(habitType, streakLength, verified);
        });
    }

    // Enhance existing UI with card elements
    enhanceExistingUI() {
        this.addCardCountToDashboard();
        this.addCardLinksToNavigation();
        this.enhanceHabitTracker();
        this.enhanceChallengeCards();
    }

    // Add card count to dashboard
    addCardCountToDashboard() {
        const dashboardStats = document.querySelector('.dashboard-grid .sidebar-panel .stats-grid');
        if (dashboardStats && this.cards.length > 0) {
            const cardStatHTML = `
                <div class="stat-card" onclick="window.location.href='card-collection.html'" style="cursor: pointer;">
                    <div class="stat-number" style="color: #f39c12;">${this.cards.length}</div>
                    <div class="stat-label">Cards Collected</div>
                </div>
            `;
            dashboardStats.insertAdjacentHTML('beforeend', cardStatHTML);
        }
    }

    // Add card links to navigation
    addCardLinksToNavigation() {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.querySelector('a[href="card-collection.html"]')) {
            const cardLinkHTML = `<li><a href="card-collection.html">Cards</a></li>`;
            const dashboardLink = navLinks.querySelector('a[href="dashboard.html"]');
            if (dashboardLink) {
                dashboardLink.parentElement.insertAdjacentHTML('beforebegin', cardLinkHTML);
            }
        }
    }

    // Enhance habit tracker with card previews
    enhanceHabitTracker() {
        const habitItems = document.querySelectorAll('.habit-item');
        habitItems.forEach(habitItem => {
            const habitName = habitItem.querySelector('.habit-name')?.textContent;
            if (habitName && !habitItem.querySelector('.habit-card-preview')) {
                const habitType = this.mapHabitNameToType(habitName);
                const previewHTML = `
                    <div class="habit-card-preview" style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-top: 0.5rem;">
                        🎴 Unlocks: ${this.getCardTypeForHabit(habitType)} cards
                    </div>
                `;
                habitItem.querySelector('.habit-details').insertAdjacentHTML('beforeend', previewHTML);
            }
        });
    }

    // Enhance challenge cards with card rewards info
    enhanceChallengeCards() {
        const challengeCards = document.querySelectorAll('.challenge-card');
        challengeCards.forEach(challengeCard => {
            const challengeId = challengeCard.dataset.challenge;
            if (challengeId && !challengeCard.querySelector('.challenge-card-reward')) {
                const habitType = this.mapChallengeToHabitType(challengeId);
                const rewardHTML = `
                    <div class="challenge-card-reward" style="background: rgba(243, 156, 18, 0.1); padding: 0.75rem; border-radius: 8px; margin: 1rem 0; text-align: center;">
                        <div style="color: #f39c12; font-weight: bold; margin-bottom: 0.5rem;">
                            🎴 Card Rewards
                        </div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">
                            Daily: ${this.getCardTypeForHabit(habitType)} cards<br>
                            Completion: Rare+ guaranteed
                        </div>
                    </div>
                `;
                const challengeActions = challengeCard.querySelector('.challenge-progress');
                if (challengeActions) {
                    challengeActions.insertAdjacentHTML('afterend', rewardHTML);
                }
            }
        });
    }

    // Update card count displays
    updateCardCountDisplay() {
        const cardCountElements = document.querySelectorAll('[data-card-count]');
        cardCountElements.forEach(element => {
            element.textContent = this.cards.length;
        });
    }

    // Helper methods
    mapHabitNameToType(habitName) {
        const nameMap = {
            'physical training': 'fitness',
            'focus training': 'mental',
            'fuel optimization': 'nutrition',
            'skill development': 'life_skills',
            'performance review': 'study'
        };
        
        const lowerName = habitName.toLowerCase();
        for (const [key, type] of Object.entries(nameMap)) {
            if (lowerName.includes(key)) return type;
        }
        
        return 'study'; // default
    }

    mapChallengeToHabitType(challengeId) {
        const challengeMap = {
            'fitness-foundation': 'fitness',
            'morning-energy': 'fitness',
            'deep-work': 'study',
            'stress-resilience': 'mental',
            'elite-morning': 'life_skills',
            'time-mastery': 'study'
        };
        return challengeMap[challengeId] || 'study';
    }

    getCardTypeForHabit(habitType) {
        const typeMap = {
            'fitness': 'Endurance',
            'study': 'Focus',
            'mental': 'Calm',
            'nutrition': 'Discipline',
            'life_skills': 'Discipline',
            'sleep': 'Calm'
        };
        return typeMap[habitType] || 'Focus';
    }

    getRarityColor(rarity) {
        const colors = {
            common: '#8e8e93',
            uncommon: '#34c759',
            rare: '#007aff',
            epic: '#af52de',
            legendary: '#ff9500'
        };
        return colors[rarity] || colors.common;
    }

    // Quick access methods for integration
    async quickGenerateCard(habitType, options = {}) {
        const { streakLength = 1, verified = false, verificationMethod = 'none' } = options;
        return await this.generateCardFromHabit(habitType, streakLength, verified, verificationMethod);
    }

    getCardStats() {
        return {
            total: this.cards.length,
            byRarity: this.cards.reduce((acc, card) => {
                acc[card.rarity] = (acc[card.rarity] || 0) + 1;
                return acc;
            }, {}),
            byType: this.cards.reduce((acc, card) => {
                acc[card.type] = (acc[card.type] || 0) + 1;
                return acc;
            }, {}),
            battleLevel: this.battleData.battleLevel || 1,
            battleTrophies: this.battleData.battleTrophies || 0
        };
    }
}

// Integration with your existing challengeManager
class EnhancedChallengeManager extends ChallengeManager {
    constructor() {
        super();
        this.cardSystem = new VivifyCardSystem();
    }

    async completeDay(challengeId, selectedActions = []) {
        const ch = challenges[challengeId];
        const uc = this.userChallenges[challengeId];
        
        if (!ch || !uc?.joined) {
            return this.showNotification('Join the challenge first', 'info');
        }

        const today = new Date().toISOString().split('T')[0];
        if (uc.completedDays.includes(today)) {
            this.showNotification('Already completed today!', 'info');
            return;
        }

        uc.completedDays.push(today);
        uc.lastCompletedDate = today;
        uc.totalDays = uc.completedDays.length;
        
        this.updateStreak(challengeId);
        
        // NEW: Generate card when completing challenge day
        if (this.cardSystem) {
            const habitType = this.cardSystem.mapChallengeToHabitType(challengeId);
            const streakLength = uc.totalDays;
            const verified = selectedActions.length > 0; // Basic verification if actions selected
            
            await this.cardSystem.generateCardFromHabit(habitType, streakLength, verified);
        }
        
        // Check completion
        if (uc.totalDays >= ch.totalGoal) {
            uc.completed = true;
            
            // Generate special completion card
            if (this.cardSystem) {
                const habitType = this.cardSystem.mapChallengeToHabitType(challengeId);
                await this.cardSystem.generateCardFromHabit(habitType, ch.totalGoal, true, 'challenge_completion');
            }
            
            if (window.VivifyLeaderboard) {
                window.VivifyLeaderboard.addPoints(ch.points, 'challenge_complete', { challengeId });
            }
            this.syncPointsToBackend(ch.points, 'challenge_complete', { challengeId });
            
            this.showNotification(`Challenge completed! +${ch.points} points & rare card unlocked!`, 'success');
        } else {
            const progressPoints = ch.dailyPoints || 10;
            if (window.VivifyLeaderboard) {
                window.VivifyLeaderboard.addPoints(progressPoints, 'challenge_progress', { challengeId });
            }
            this.syncPointsToBackend(progressPoints, 'challenge_progress', { challengeId });
            
            this.showNotification(`Day completed! +${progressPoints} points & new card unlocked!`, 'success');
        }

        this.saveUserData();
        this.displayChallenges();
    }
}

// Enhanced habit tracker integration
class EnhancedHabitTracker {
    constructor() {
        this.cardSystem = new VivifyCardSystem();
        this.setupHabitIntegration();
    }

    setupHabitIntegration() {
        // Override existing habit completion functions
        if (window.tracker && window.tracker.toggleDailyHabit) {
            const originalToggle = window.tracker.toggleDailyHabit.bind(window.tracker);
            
            window.tracker.toggleDailyHabit = async (habitId) => {
                const habit = window.tracker.dailyHabits.find(h => h.id === habitId);
                if (!habit || habit.completed) return;

                // Complete the habit normally
                await originalToggle(habitId);

                // Generate card
                if (this.cardSystem) {
                    const habitType = this.cardSystem.mapHabitNameToType(habit.name);
                    const streakLength = this.calculateStreakLength(habitId);
                    const verified = false; // Basic completion
                    
                    await this.cardSystem.generateCardFromHabit(habitType, streakLength, verified);
                }
            };
        }
    }

    calculateStreakLength(habitId) {
        // Simple streak calculation - you can enhance this
        const today = new Date().toDateString();
        const habitData = JSON.parse(localStorage.getItem(`habit_${habitId}_data`) || '{}');
        const completedDates = habitData.completedDates || [];
        
        let streak = 0;
        let checkDate = new Date();
        
        for (let i = 0; i < 30; i++) {
            const dateStr = checkDate.toDateString();
            if (completedDates.includes(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return Math.max(1, streak);
    }
}

// Global initialization and integration
window.VivifyCardSystem = VivifyCardSystem;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userLoggedIn') === 'true') {
        console.log('🎮 Initializing Vivify Card Battle System...');
        
        // Initialize card system
        window.vivifyCards = new VivifyCardSystem();
        
        // Enhance existing managers if they exist
        setTimeout(() => {
            // Replace challengeManager with enhanced version
            if (window.challengeManager) {
                const enhancedManager = new EnhancedChallengeManager();
                // Copy existing data
                enhancedManager.userChallenges = window.challengeManager.userChallenges;
                window.challengeManager = enhancedManager;
                console.log('✅ Enhanced challenge manager with card system');
            }
            
            // Initialize enhanced habit tracker
            if (document.querySelector('.habit-item')) {
                window.enhancedHabitTracker = new EnhancedHabitTracker();
                console.log('✅ Enhanced habit tracker with card system');
            }
        }, 1000);
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VivifyCardSystem, EnhancedChallengeManager, EnhancedHabitTracker };
}