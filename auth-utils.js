/**
 * Authentication utility functions for client-side use
 */

const authUtils = {
    /**
     * Checks if user is logged in by verifying token in localStorage
     * @returns {Promise<boolean>} - True if user is logged in and token is valid
     */
    isLoggedIn: async function() {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            return false;
        }
        
        try {
            const response = await fetch('/auth/verify-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data.isValid;
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    },
    
    /**
     * Get user data from token or from API if available
     * @param {boolean} [refresh=false] - Whether to fetch fresh data from API
     * @returns {Promise<Object|null>} - User data or null if not logged in
     */
    getUser: async function(refresh = false) {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            return null;
        }
        
        // If refresh is false, try to get user from token
        if (!refresh) {
            try {
                // Parse token (JWT is header.payload.signature)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                
                const payload = JSON.parse(jsonPayload);
                
                // Check if token is expired
                const expiryDate = new Date(payload.exp * 1000);
                if (expiryDate < new Date()) {
                    this.logout();
                    return null;
                }
                
                return {
                    id: payload.id,
                    username: payload.username,
                    email: payload.email
                };
            } catch (error) {
                console.error('Token parsing error:', error);
            }
        }
        
        // If payload couldn't be parsed or refresh is true, get user from API
        try {
            const response = await fetch('/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    this.logout();
                }
                return null;
            }
            
            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('User profile error:', error);
            return null;
        }
    },
    
    /**
     * Log user in and store token
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Login result with success flag and message
     */
    login: async function(email, password) {
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userLoggedIn', 'true');
                return {
                    success: true,
                    user: data.user,
                    redirectTo: data.redirectTo
                };
            }
            
            return {
                success: false,
                message: data.message || 'Login failed'
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    },
    
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Registration result with success flag and message
     */
    register: async function(userData) {
        try {
            const response = await fetch('/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            return {
                success: response.ok,
                message: data.message
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    },
    
    /**
     * Log user out and clear storage
     */
    logout: function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userLoggedIn');
        
        // Optional: Make a server request to invalidate the token
        fetch('/auth/logout', { method: 'GET' }).catch(console.error);
    },
    
    /**
     * Request password reset for an email
     * @param {string} email - User email
     * @returns {Promise<Object>} - Result with success flag and message
     */
    requestPasswordReset: async function(email) {
        try {
            const response = await fetch('/auth/reset-password-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            return {
                success: response.ok,
                message: data.message
            };
        } catch (error) {
            console.error('Password reset request error:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    },
    
    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} password - New password
     * @returns {Promise<Object>} - Result with success flag and message
     */
    resetPassword: async function(token, password) {
        try {
            const response = await fetch(`/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
            
            const data = await response.json();
            
            return {
                success: response.ok,
                message: data.message
            };
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    },
    
    /**
     * Update authentication UI elements based on login state
     */
    updateAuthUI: function() {
        const token = localStorage.getItem('authToken');
        const isLoggedIn = !!token && localStorage.getItem('userLoggedIn') === 'true';
        
        // Update navigation links
        const loginLink = document.getElementById('loginLink');
        const signupLink = document.getElementById('signupLink');
        const logoutLink = document.getElementById('logoutLink');
        const profileLink = document.getElementById('profileLink') || document.getElementById('profile-link');
        const categoryDropdown = document.getElementById('categoryDropdown');
        
        if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'inline';
        if (signupLink) signupLink.style.display = isLoggedIn ? 'none' : 'inline';
        if (logoutLink) logoutLink.style.display = isLoggedIn ? 'inline' : 'none';
        if (profileLink) profileLink.style.display = isLoggedIn ? 'inline' : 'none';
        if (categoryDropdown) categoryDropdown.style.display = isLoggedIn ? 'block' : 'none';
        
        // Attach logout handler
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
                window.location.href = '/';
            });
        }
        
        // Handle restricted content
        const restrictedElements = document.querySelectorAll('.restricted');
        restrictedElements.forEach(element => {
            if (isLoggedIn) {
                element.classList.remove('disabled');
                if (element.tagName === 'A') {
                    element.style.pointerEvents = 'auto';
                    element.removeAttribute('data-tooltip');
                }
            } else {
                element.classList.add('disabled');
                if (element.tagName === 'A') {
                    element.style.pointerEvents = 'none';
                    element.setAttribute('data-tooltip', 'Login required to access this feature');
                    
                    // Add login redirect
                    element.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = `/login.html?redirect=${encodeURIComponent(element.href)}`;
                    });
                }
            }
        });
    }
};

// Auto-run UI update when script loads
document.addEventListener('DOMContentLoaded', function() {
    authUtils.updateAuthUI();
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authUtils;
}
