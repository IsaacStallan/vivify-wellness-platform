// auth-utils.js - Enhanced with role-based UI control
const authUtils = {
    /**
     * Get current user data including role information
     * @returns {Promise<Object|null>} - User data with role info or null
     */
    getCurrentUser: async function() {
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        
        try {
            const response = await fetch('/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.user;
            }
        } catch (error) {
            console.error('Error getting current user:', error);
        }
        
        return null;
    },
    
    /**
     * Check if user has specific role
     * @param {string|Array} roles - Role(s) to check
     * @returns {Promise<boolean>} - True if user has required role
     */
    hasRole: async function(roles) {
        const user = await this.getCurrentUser();
        if (!user) return false;
        
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        return requiredRoles.includes(user.role);
    },
    
    /**
     * Enhanced login with role handling
     */
    login: async function(email, password) {
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token and user info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                return {
                    success: true,
                    redirectTo: data.redirectTo,
                    user: data.user
                };
            } else {
                return {
                    success: false,
                    message: data.message
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    },
    
    /**
     * Enhanced signup with role selection
     */
    register: async function(userData) {
        try {
            const response = await fetch('/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
     * Enhanced UI update with role-based visibility
     */
    updateAuthUI: async function() {
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const userRole = localStorage.getItem('userRole');
        
        // Basic auth UI elements
        const loginLink = document.getElementById('loginLink');
        const signupLink = document.getElementById('signupLink');
        const logoutLink = document.getElementById('logoutLink');
        const profileLink = document.getElementById('profileLink');
        const dashboardLink = document.getElementById('dashboardLink');
        
        // Role-specific UI elements
        const teacherNav = document.querySelector('.teacher-nav');
        const adminNav = document.querySelector('.admin-nav');
        const studentNav = document.querySelector('.student-nav');
        
        // Update basic auth elements
        if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'inline';
        if (signupLink) signupLink.style.display = isLoggedIn ? 'none' : 'inline';
        if (logoutLink) logoutLink.style.display = isLoggedIn ? 'inline' : 'none';
        if (profileLink) profileLink.style.display = isLoggedIn ? 'inline' : 'none';
        
        // Update dashboard link based on role
        if (dashboardLink && isLoggedIn) {
            switch (userRole) {
                case 'teacher':
                    dashboardLink.href = 'teacher-dashboard.html';
                    dashboardLink.textContent = 'Teacher Dashboard';
                    break;
                case 'admin':
                case 'school_admin':
                    dashboardLink.href = 'admin-dashboard.html';
                    dashboardLink.textContent = 'Admin Dashboard';
                    break;
                default:
                    dashboardLink.href = 'dashboard.html';
                    dashboardLink.textContent = 'Dashboard';
            }
        }
        
        // Show/hide role-specific navigation
        if (teacherNav) {
            teacherNav.style.display = (isLoggedIn && (userRole === 'teacher' || userRole === 'admin')) ? 'block' : 'none';
        }
        if (adminNav) {
            adminNav.style.display = (isLoggedIn && (userRole === 'admin' || userRole === 'school_admin')) ? 'block' : 'none';
        }
        if (studentNav) {
            studentNav.style.display = (isLoggedIn && userRole === 'student') ? 'block' : 'none';
        }
        
        // Handle role-restricted content
        this.handleRoleRestrictions(userRole);
    },
    
    /**
     * Handle role-based content restrictions
     */
    handleRoleRestrictions: function(userRole) {
        // Hide content based on role restrictions
        const teacherOnlyElements = document.querySelectorAll('.teacher-only');
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        const studentOnlyElements = document.querySelectorAll('.student-only');
        
        teacherOnlyElements.forEach(element => {
            element.style.display = (userRole === 'teacher' || userRole === 'admin') ? 'block' : 'none';
        });
        
        adminOnlyElements.forEach(element => {
            element.style.display = (userRole === 'admin' || userRole === 'school_admin') ? 'block' : 'none';
        });
        
        studentOnlyElements.forEach(element => {
            element.style.display = (userRole === 'student') ? 'block' : 'none';
        });
    },
    
    /**
     * Enhanced logout with role cleanup
     */
    logout: function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        
        // Server-side logout
        fetch('/auth/logout', { method: 'GET' }).catch(console.error);
    },
    
    /**
     * Check if user can access specific student data (for teachers)
     */
    canAccessStudent: async function(studentId) {
        const user = await this.getCurrentUser();
        if (!user) return false;
        
        // Admins can access all students in their school
        if (user.role === 'admin' || user.role === 'school_admin') {
            return true;
        }
        
        // Teachers can access students in their classes
        if (user.role === 'teacher') {
            return user.classPermissions?.some(permission => 
                permission.studentIds.includes(studentId)
            );
        }
        
        // Students can only access their own data
        return user.role === 'student' && user.id === studentId;
    }
};

// Auto-update UI on page load
document.addEventListener('DOMContentLoaded', function() {
    authUtils.updateAuthUI();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authUtils;
}