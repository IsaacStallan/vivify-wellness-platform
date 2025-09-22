class VivifyAPI {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('authToken');
    }
    
    async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            },
            ...options
        };
        
        const response = await fetch(`${this.baseURL}${endpoint}`, config);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
    }
    
    async submitWorkout(workoutData) {
        return this.request('/fitness/workouts', {
            method: 'POST',
            body: JSON.stringify(workoutData)
        });
    }
    
    async getLeaderboard() {
        return this.request('/fitness/leaderboard');
    }
    
    async syncWorkouts(workouts) {
        return this.request('/fitness/sync', {
            method: 'POST',
            body: JSON.stringify({ workouts })
        });
    }
}

// Make it globally available
window.VivifyAPI = VivifyAPI;