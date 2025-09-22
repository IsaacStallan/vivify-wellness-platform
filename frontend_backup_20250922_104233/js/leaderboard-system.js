// ==========================================
// Vivify Leaderboard System
// Uses backend (Mongo) as single source of truth
// ==========================================

class RealUsersLeaderboard {
    constructor() {
        this.userId = this.getCurrentUserId();
        this.userProfile = null;
    }

    // 1. Ensure each browser/device has a persistent ID
    getCurrentUserId() {
        let userId = localStorage.getItem('vivifyUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            localStorage.setItem('vivifyUserId', userId);

            // Register new user on backend
            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, displayName: "Student" })
            }).catch(err => console.error("Failed to register user:", err));
        }
        return userId;
    }

    // 2. Fetch the current user's profile from backend
    async fetchUserProfile() {
        try {
            const res = await fetch(`/api/user/${this.userId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.userProfile = await res.json();
            return this.userProfile;
        } catch (err) {
            console.error("❌ Failed to fetch user profile:", err);
            return null;
        }
    }

    // 3. Update user stats in backend
    async updateUserStats(updates) {
        try {
            const res = await fetch(`/api/user/${this.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.userProfile = await res.json();
            return this.userProfile;
        } catch (err) {
            console.error("❌ Failed to update user:", err);
        }
    }

    // 4. Fetch leaderboard from backend
    async fetchLeaderboard() {
        try {
            const res = await fetch('/api/leaderboard');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error("❌ Failed to fetch leaderboard:", err);
            return [];
        }
    }

    // 5. Render leaderboard UI
    async renderLeaderboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error("⚠️ Container not found:", containerId);
            return;
        }

        const leaderboard = await this.fetchLeaderboard();

        if (leaderboard.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">
                    <h3>No players yet</h3>
                    <p>Be the first to complete an activity and appear here.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div style="margin-bottom: 1rem; color:#ccc; text-align:center;">
                ${leaderboard.length} students competing
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
        `;

        leaderboard.forEach((user, index) => {
            const isCurrent = user.userId === this.userId;
            const rank = index + 1;
            html += `
                <div style="
                    padding:1rem;
                    border-radius:8px;
                    background:${isCurrent ? 'rgba(243,156,18,0.2)' : 'rgba(255,255,255,0.05)'};
                    border:${isCurrent ? '2px solid #f39c12' : '1px solid rgba(255,255,255,0.1)'};
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                ">
                    <div>
                        <strong>#${rank}</strong>
                        ${isCurrent ? '<span style="color:#f39c12;">You</span>' : (user.displayName || 'Student')}
                        <small style="color:#999;">${user.school || ''}</small>
                    </div>
                    <div>
                        <span style="color:#f39c12; font-weight:700;">${user.overallScore || 0}</span> pts
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    // 6. Example: complete an activity (+points)
    async completeActivity(points = 10) {
        if (!this.userProfile) await this.fetchUserProfile();

        const newScore = (this.userProfile?.overallScore || 0) + points;
        const newStats = {
            overallScore: newScore,
            challengeStats: {
                ...this.userProfile?.challengeStats,
                totalPoints: (this.userProfile?.challengeStats?.totalPoints || 0) + points
            }
        };

        await this.updateUserStats(newStats);
        await this.renderLeaderboard('leaderboard');
    }
}

// ==========================================
// Initialize
// ==========================================
window.realLeaderboard = new RealUsersLeaderboard();

document.addEventListener('DOMContentLoaded', () => {
    // Auto-render leaderboard into container with id="leaderboard"
    window.realLeaderboard.renderLeaderboard('leaderboard');
});
