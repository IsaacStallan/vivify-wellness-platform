// API Service for Mountain Game
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.userId = localStorage.getItem('userId');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.token) {
            this.token = data.token;
            this.userId = data.user._id;
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.user._id);
            localStorage.setItem('username', data.user.username);
        }

        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (data.token) {
            this.token = data.token;
            this.userId = data.user._id;
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.user._id);
            localStorage.setItem('username', data.user.username);
        }

        return data;
    }

    logout() {
        this.token = null;
        this.userId = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
    }

    // Habits
    async getHabitTemplates(category = null) {
        const query = category ? `?category=${category}` : '';
        return await this.request(`/mountain/habits/templates${query}`);
    }

    async selectCustomHabits(customHabits) {
        return await this.request('/mountain/habits/select', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                customHabits
            })
        });
    }

    async logHabits(habits, habitDetails) {
        return await this.request('/mountain/habits/log', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                habits,
                habitDetails
            })
        });
    }

    async getHabitHistory(limit = 30) {
        return await this.request(`/mountain/habits/history?userId=${this.userId}&limit=${limit}`);
    }

    // Mountain Progress
    async getMountainProgress() {
        return await this.request(`/mountain/progress?userId=${this.userId}`);
    }

    async startMountain(mountainId) {
        return await this.request('/mountain/start', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                mountainId
            })
        });
    }

    async getAllMountains() {
        return await this.request('/mountain/all');
    }

    // Basecamps
    async getBasecampPosts(mountain, basecampName, limit = 50) {
        return await this.request(
            `/mountain/basecamp/posts?mountain=${mountain}&basecampName=${basecampName}&limit=${limit}`
        );
    }

    async createBasecampPost(mountain, basecampName, content) {
        return await this.request('/mountain/basecamp/post', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                mountain,
                basecampName,
                content
            })
        });
    }

    async upvotePost(postId) {
        return await this.request('/mountain/basecamp/upvote', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                postId
            })
        });
    }

    async flagPost(postId, reason) {
        return await this.request('/mountain/basecamp/flag', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                postId,
                reason
            })
        });
    }

    // Leaderboards
    async getWeeklyLeaderboard(limit = 50) {
        return await this.request(`/mountain/leaderboard/weekly?limit=${limit}`);
    }

    async getMountainLeaderboard(mountain, limit = 50) {
        return await this.request(`/mountain/leaderboard/mountain?mountain=${mountain}&limit=${limit}`);
    }

    async getTotalLeaderboard(limit = 50) {
        return await this.request(`/mountain/leaderboard/total?limit=${limit}`);
    }

    // User
    async getUserProfile() {
        return await this.request(`/user/${this.userId}`);
    }
}

export default new ApiService();
