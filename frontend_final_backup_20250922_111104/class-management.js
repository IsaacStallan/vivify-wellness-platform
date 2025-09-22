// UNIFIED CLASS MANAGEMENT SYSTEM - Backend Version
const ClassManager = {
    generateClassCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    async addStudentToClass(studentId, classCode) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/classes/join', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ studentId, classCode })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error joining class:', error);
            return { success: false, error: 'Network error' };
        }
    },

    async createClass(teacherId, classData) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/classes/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ teacherId, ...classData })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creating class:', error);
            throw error;
        }
    }
};

class AuthManager {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://vivify-wellness-platform.onrender.com';
    }

    async login(email, password) {
        try {
            // Try backend first, fallback to localStorage
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.token) {
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('userProfile', JSON.stringify(result.user));
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('username', result.user.username || result.user.name);
                    return { success: true, user: result.user, redirectTo: result.redirectTo };
                }
            }
        } catch (error) {
            console.log('Backend unavailable, using localStorage fallback');
        }

        // Fallback to localStorage authentication
        return this.localLogin(email, password);
    }

    localLogin(email, password) {
        const users = JSON.parse(localStorage.getItem('vivifyUsers') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userProfile', JSON.stringify(user));
            localStorage.setItem('username', user.username || user.name);
            
            // Set baseline assessment flag for new users
            if (!localStorage.getItem('performanceData')) {
                localStorage.setItem('needsBaselineAssessment', 'true');
            }
            
            const redirectTo = this.getRedirectUrl(user.role);
            return { success: true, user, redirectTo };
        }
        
        return { success: false, message: 'Invalid email or password' };
    }

    async signup(userData) {
        try {
            // Try backend first
            const response = await fetch(`${this.baseURL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.user) {
                    localStorage.setItem('userProfile', JSON.stringify(result.user));
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('username', result.user.username || result.user.name);
                    localStorage.setItem('needsBaselineAssessment', 'true');
                    return { success: true, user: result.user, redirectTo: result.redirectTo };
                }
            }
        } catch (error) {
            console.log('Backend unavailable, using localStorage fallback');
        }

        // Fallback to localStorage
        return this.localSignup(userData);
    }

    localSignup(userData) {
        const users = JSON.parse(localStorage.getItem('vivifyUsers') || '[]');
        
        // Check if user already exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('vivifyUsers', JSON.stringify(users));
        localStorage.setItem('userProfile', JSON.stringify(newUser));
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('username', newUser.username || newUser.name);
        localStorage.setItem('needsBaselineAssessment', 'true');

        const redirectTo = this.getRedirectUrl(newUser.role);
        return { success: true, user: newUser, redirectTo };
    }

    getRedirectUrl(role) {
        switch(role) {
            case 'admin':
                return 'admin-dashboard.html';
            case 'teacher':
                return 'teacher-dashboard.html';
            case 'student':
            default:
                return 'performance-baseline-assessment.html';
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const loginBtn = document.getElementById('loginBtn');
            const messageElement = document.getElementById('message');
            
            if (!email || !password) {
                showMessage('Please fill in all fields.', 'error');
                return;
            }
            
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;
            
            try {
                const result = await authManager.login(email, password);
                
                if (result.success) {
                    showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = result.redirectTo;
                    }, 1500);
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage('Login failed. Please try again.', 'error');
            } finally {
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
            }
        });
    }
});

function showMessage(message, type = 'error') {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = type === 'error' ? 'error-message' : 'success-message';
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Handle signup form submission - BACKEND VERSION
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username')?.value.trim() || document.getElementById('name')?.value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const role = document.getElementById('userRole')?.value || document.getElementById('role')?.value || 'student';
            
            // Role-specific fields
            const yearLevel = document.getElementById('yearLevel')?.value;
            const schoolCode = document.getElementById('schoolCode')?.value || 'KNOX2024';
            const className = document.getElementById('className')?.value;

            // Validation
            if (!username || !email || !password) {
                alert('Please fill in all required fields');
                return;
            }

            try {
                fetch('https://vivify-wellness-platform.onrender.com/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username, 
                        email, 
                        password, 
                        role,
                        yearLevel: role === 'student' ? parseInt(yearLevel) : undefined,
                        schoolCode,
                        className
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Registration successful! You can now log in.');
                    window.location.href = 'login.html';
                } else {
                    alert('Signup failed: ' + result.message);
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('Network error. Please try again.');
            }
        });
    }

    // Handle login form submission - BACKEND VERSION
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const response = await fetch('https://vivify-wellness-platform.onrender.com/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    // Store backend session data properly
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('user', JSON.stringify(result.user)); // For admin dashboard
                    localStorage.setItem('userProfile', JSON.stringify(result.user)); // For profile page
                    localStorage.setItem('authToken', result.token);
                    
                    // Backend handles role-based redirect
                    window.location.href = result.redirectTo;
                } else {
                    alert(result.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Network error. Please try again.');
            }
        });
    }
});

// Keep existing ClassManager global functions
window.ClassManager = ClassManager;

window.joinClass = async function() {
    const classCodeInput = document.getElementById('classCodeInput');
    if (!classCodeInput) return;
    
    const classCode = classCodeInput.value.trim().toUpperCase();
    if (!classCode) {
        alert('Please enter a class code');
        return;
    }
    
    const studentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const result = await ClassManager.addStudentToClass(studentProfile.id, classCode);
    
    if (result.success) {
        alert(`Successfully joined ${result.className}!`);
        classCodeInput.value = '';
        if (typeof loadStudentClasses === 'function') {
            loadStudentClasses();
        }
    } else {
        alert(result.error || 'Failed to join class');
    }
};

window.createNewClass = async function() {
    const className = prompt('Enter class name (e.g., "Year 10A Mathematics"):');
    if (!className) return;
    
    const subject = prompt('Enter subject (e.g., "Mathematics", "English"):');
    if (!subject) return;
    
    const yearLevel = parseInt(prompt('Enter year level (7-12):'));
    if (!yearLevel || yearLevel < 7 || yearLevel > 12) {
        alert('Please enter a valid year level (7-12)');
        return;
    }
    
    const teacherProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    try {
        const newClass = await ClassManager.createClass(teacherProfile.id, {
            name: className,
            subject: subject,
            yearLevel: yearLevel
        });
        
        alert(`Class created successfully!\n\nClass Code: ${newClass.code}\n\nShare this code with your students so they can join your class.`);
        
        // Refresh displays
        if (typeof loadTeacherClasses === 'function') {
            loadTeacherClasses();
        }
    } catch (error) {
        alert('Failed to create class. Please try again.');
    }
};

window.copyClassCode = function(code) {
    navigator.clipboard.writeText(code).then(() => {
        alert(`Class code ${code} copied to clipboard!`);
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`Class code ${code} copied!`);
    });
};