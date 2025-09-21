// UNIFIED CLASS MANAGEMENT SYSTEM
const ClassManager = {
    generateClassCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    addStudentToClass(studentId, classCode) {
        const classes = JSON.parse(localStorage.getItem('vivifyClasses') || '[]');
        const targetClass = classes.find(c => c.code === classCode.toUpperCase() && c.active);
        
        if (!targetClass) {
            return { success: false, error: 'Invalid class code' };
        }
        
        if (!targetClass.students) {
            targetClass.students = [];
        }
        
        const studentIdStr = String(studentId);
        if (targetClass.students.includes(studentIdStr)) {
            return { success: false, error: 'Already enrolled in this class' };
        }
        
        targetClass.students.push(studentIdStr);
        localStorage.setItem('vivifyClasses', JSON.stringify(classes));
        
        const allUsers = JSON.parse(localStorage.getItem('vivifyUsers') || '[]');
        const studentIndex = allUsers.findIndex(u => String(u.id) === studentIdStr);
        
        if (studentIndex !== -1) {
            if (!allUsers[studentIndex].classes) {
                allUsers[studentIndex].classes = [];
            }
            if (!allUsers[studentIndex].classes.includes(targetClass.id)) {
                allUsers[studentIndex].classes.push(targetClass.id);
            }
            allUsers[studentIndex].lastLogin = new Date().toISOString();
            localStorage.setItem('vivifyUsers', JSON.stringify(allUsers));
        }
        
        console.log(`Student ${studentIdStr} joined class ${targetClass.name} (${classCode})`);
        
        return { 
            success: true, 
            classId: targetClass.id,
            className: targetClass.name
        };
    },

    async createClass(teacherId, classData) {
        try {
            // Use API if available, fallback to localStorage
            const authToken = localStorage.getItem('authToken');
            if (authToken) {
                const response = await fetch('https://vivify-backend.onrender.com/api/classes/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        teacherId,
                        name: classData.name,
                        subject: classData.subject,
                        yearLevel: classData.yearLevel
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    return result.class || result;
                }
            }
        } catch (error) {
            console.log('API not available, using localStorage');
        }

        // Fallback to localStorage
        const classCode = this.generateClassCode();
        const classInfo = {
            id: Date.now(),
            teacherId: teacherId,
            code: classCode,
            name: classData.name,
            subject: classData.subject || 'General',
            yearLevel: classData.yearLevel,
            students: [],
            createdAt: new Date().toISOString(),
            active: true
        };
        
        const existingClasses = JSON.parse(localStorage.getItem('vivifyClasses') || '[]');
        existingClasses.push(classInfo);
        localStorage.setItem('vivifyClasses', JSON.stringify(existingClasses));
        
        return classInfo;
    }
};

document.addEventListener('DOMContentLoaded', async function () {
    const profileMenu = document.getElementById('profile-menu');
    const signupLink = document.getElementById('signupLink');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const profilePic = document.getElementById('profile-pic');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Initialize authentication state
    await checkAuthenticationState();

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // Basic validation
            if (!username || !email || !password) {
                alert('Please fill in all fields');
                return;
            }

            if (username.length < 3) {
                alert('Username must be at least 3 characters long');
                return;
            }

            if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
                alert('Password must be at least 8 characters long and contain at least one uppercase letter and one number');
                return;
            }

            try {
                const response = await fetch('https://vivify-backend.onrender.com/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                const result = await response.json();
                console.log('Signup result:', result);

                if (response.ok) {
                    if (result.autoLogin && result.token) {
                        // Auto-login after signup (development mode)
                        localStorage.setItem('userLoggedIn', 'true');
                        localStorage.setItem('authToken', result.token);
                        localStorage.setItem('username', result.user.username);
                        localStorage.setItem('userEmail', result.user.email);
                        localStorage.setItem('needsBaselineAssessment', 'true');
                        
                        const userProfile = {
                            id: result.user.id,
                            name: result.user.username,
                            username: result.user.username,
                            email: result.user.email,
                            role: result.user.role || 'student',
                            school: 'Knox Grammar School',
                            yearLevel: '',
                            signupTime: new Date().toISOString()
                        };
                        localStorage.setItem('userProfile', JSON.stringify(userProfile));
                        
                        console.log('Auto-login successful:', result.user.username);
                        
                        // Redirect to baseline assessment
                        window.location.href = 'performance-baseline-assessment.html';
                    } else {
                        // Email verification required
                        alert('Account created! Please check your email to verify your account before logging in.');
                        window.location.href = 'login.html?message=signup-success';
                    }
                } else {
                    alert('Signup failed: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error during signup:', error);
                alert('An error occurred. Please check your connection and try again.');
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }

            try {
                const response = await fetch('https://vivify-backend.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const result = await response.json();
                console.log('Login server response:', result);

                if (response.ok && result.token) {
                    // Store authentication data
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('authToken', result.token);
                    
                    // Store user data from server response
                    if (result.user) {
                        localStorage.setItem('username', result.user.username);
                        localStorage.setItem('userEmail', result.user.email);
                        
                        const userProfile = {
                            id: result.user.id,
                            name: result.user.username,
                            username: result.user.username,
                            email: result.user.email,
                            role: result.user.role || 'student',
                            school: result.user.school || 'Knox Grammar School',
                            yearLevel: result.user.yearLevel || '',
                            loginTime: new Date().toISOString(),
                            emailVerified: result.user.emailVerified
                        };
                        localStorage.setItem('userProfile', JSON.stringify(userProfile));
                        
                        console.log('Login successful - Username stored:', result.user.username);
                        console.log('UserProfile created:', userProfile);
                    }
                    
                    // Check for performance baseline completion
                    try {
                        const performanceResponse = await fetch('/api/performance/data', {
                            headers: { 'Authorization': `Bearer ${result.token}` }
                        });
                        
                        if (performanceResponse.ok) {
                            const performanceResult = await performanceResponse.json();
                            console.log('performance data from server:', performanceResult);
                            
                            if (performanceResult.performanceData && performanceResult.performanceData.scores) {
                                // User has completed baseline - store data and go to dashboard
                                const performanceData = {
                                    scores: performanceResult.performanceData.scores,
                                    user: JSON.parse(localStorage.getItem('userProfile')),
                                    activities: [],
                                    customGoals: [],
                                    lastUpdated: new Date().toISOString(),
                                    baselineCompleted: true
                                };
                                localStorage.setItem('performanceData', JSON.stringify(performanceData));
                                localStorage.removeItem('needsBaselineAssessment');
                                
                                console.log('Existing performance data loaded from server');
                                window.location.href = 'Dashboard.html';
                            } else {
                                // No baseline data - need assessment
                                localStorage.setItem('needsBaselineAssessment', 'true');
                                console.log('No performance baseline found, redirecting to assessment');
                                window.location.href = 'performance-baseline-assessment.html';
                            }
                        } else {
                            // performance API failed - check local data
                            console.log('performance API failed, checking localStorage');
                            const localperformanceData = localStorage.getItem('performanceData');
                            if (localperformanceData) {
                                try {
                                    const parsed = JSON.parse(localperformanceData);
                                    if (parsed.baselineCompleted) {
                                        window.location.href = 'Dashboard.html';
                                    } else {
                                        localStorage.setItem('needsBaselineAssessment', 'true');
                                        window.location.href = 'performance-baseline-assessment.html';
                                    }
                                } catch {
                                    localStorage.setItem('needsBaselineAssessment', 'true');
                                    window.location.href = 'performance-baseline-assessment.html';
                                }
                            } else {
                                localStorage.setItem('needsBaselineAssessment', 'true');
                                window.location.href = 'performance-baseline-assessment.html';
                            }
                        }
                    } catch (performanceError) {
                        console.log('performance check failed, defaulting to assessment flow');
                        localStorage.setItem('needsBaselineAssessment', 'true');
                        window.location.href = 'performance-baseline-assessment.html';
                    }
                } else {
                    console.log('Login failed:', result);
                    alert(result.message || 'Login failed. Please check your email and password.');
                }
            } catch (error) {
                console.error('Network error during login:', error);
                alert('Network error. Please check your connection and try again.');
            }
        });
    }

    // Handle navigation authentication state
    updateNavigationState();
});

async function checkAuthenticationState() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const authToken = localStorage.getItem('authToken');
    
    if (isLoggedIn && authToken) {
        try {
            // Verify token with server and get fresh user data
            const response = await fetch('https://vivify-backend.onrender.com/api/user', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update stored user data with fresh server data
                if (result.user) {
                    localStorage.setItem('username', result.user.username);
                    localStorage.setItem('userEmail', result.user.email);
                    
                    const userProfile = {
                        id: result.user.id,
                        name: result.user.username,
                        username: result.user.username,
                        email: result.user.email,
                        role: result.user.role || 'student',
                        school: result.user.school || 'Knox Grammar School',
                        yearLevel: result.user.yearLevel || '',
                        emailVerified: result.user.emailVerified,
                        lastSync: new Date().toISOString()
                    };
                    localStorage.setItem('userProfile', JSON.stringify(userProfile));
                    
                    console.log('Authentication verified - Username:', result.user.username);
                }
            } else if (response.status === 401) {
                // Token expired or invalid
                console.log('Token expired, clearing authentication');
                clearAuthenticationData();
            }
        } catch (error) {
            console.log('Auth check failed:', error.message);
        }
    }
}

function updateNavigationState() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    
    // Update navigation links based on authentication state
    const elements = {
        signup: document.getElementById('signup-link') || document.getElementById('signupLink'),
        login: document.getElementById('login-link') || document.getElementById('loginLink'), 
        dashboard: document.getElementById('dashboard-link') || document.getElementById('dashboardLink'),
        profile: document.getElementById('profile-link') || document.getElementById('profileLink'),
        logout: document.getElementById('logout-link') || document.getElementById('logoutLink')
    };
    
    if (elements.signup) elements.signup.style.display = isLoggedIn ? 'none' : 'inline';
    if (elements.login) elements.login.style.display = isLoggedIn ? 'none' : 'inline';
    if (elements.dashboard) elements.dashboard.style.display = isLoggedIn ? 'inline' : 'none';
    if (elements.profile) elements.profile.style.display = isLoggedIn ? 'inline' : 'none';
    if (elements.logout) {
        elements.logout.style.display = isLoggedIn ? 'inline' : 'none';
        
        // Add logout handler
        elements.logout.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
}

function clearAuthenticationData() {
    const keysToRemove = [
        'userLoggedIn',
        'authToken', 
        'username',
        'userEmail',
        'userProfile',
        'userRole',
        'needsBaselineAssessment',
        'performanceData'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('Authentication data cleared');
}

function logout() {
    // Notify server of logout
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        fetch('/auth/logout', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        }).catch(console.error);
    }
    
    clearAuthenticationData();
    window.location.href = 'index.html';
}

// Global functions for class management
window.ClassManager = ClassManager;

window.joinClass = async function() {
    const classCodeInput = document.getElementById('classCodeInput');
    if (!classCodeInput) return;
    
    const classCode = classCodeInput.value.trim().toUpperCase();
    if (!classCode || classCode.length !== 6) {
        alert('Please enter a valid 6-character class code');
        return;
    }
    
    const authToken = localStorage.getItem('authToken');
    
    // Try API first
    if (authToken) {
        try {
            const response = await fetch('https://vivify-backend.onrender.com/api/classes/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ classCode })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                alert(`Successfully joined "${result.className}"!`);
                classCodeInput.value = '';
                if (typeof loadStudentClasses === 'function') {
                    loadStudentClasses();
                }
                return;
            } else {
                alert(result.message || 'Failed to join class');
                return;
            }
        } catch (error) {
            console.log('API join failed, trying localStorage method');
        }
    }
    
    // Fallback to localStorage method
    const studentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const result = ClassManager.addStudentToClass(studentProfile.id, classCode);
    
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
        if (typeof loadStudents === 'function') {
            loadStudents();
        }
        if (typeof loadClassOverview === 'function') {
            loadClassOverview();
        }
    } catch (error) {
        console.error('Class creation error:', error);
        alert('Failed to create class. Please try again.');
    }
};

window.copyClassCode = function(code) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(() => {
            alert(`Class code ${code} copied to clipboard!`);
        }).catch(() => {
            fallbackCopyTextToClipboard(code);
        });
    } else {
        fallbackCopyTextToClipboard(code);
    }
};

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert(`Class code ${text} copied!`);
        } else {
            prompt('Copy this class code:', text);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        prompt('Copy this class code:', text);
    }
    
    document.body.removeChild(textArea);
}

// Auto-fetch user data when token exists
async function fetchUserData() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        console.log('No auth token found');
        return null;
    }
    
    try {
        const response = await fetch('https://vivify-backend.onrender.com/api/user', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.user) {
                // Update localStorage with fresh server data
                localStorage.setItem('username', result.user.username);
                localStorage.setItem('userEmail', result.user.email);
                
                const userProfile = {
                    id: result.user.id,
                    name: result.user.username,
                    username: result.user.username,
                    email: result.user.email,
                    role: result.user.role || 'student',
                    school: result.user.school || 'Knox Grammar School',
                    yearLevel: result.user.yearLevel || '',
                    emailVerified: result.user.emailVerified,
                    lastSync: new Date().toISOString()
                };
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                
                console.log('User data refreshed from server:', result.user.username);
                return result.user;
            }
        } else if (response.status === 401) {
            console.log('Authentication failed - token invalid');
            clearAuthenticationData();
            return null;
        } else {
            console.log('Failed to fetch user data:', response.status);
        }
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }
    
    return null;
}

// Enhanced authentication check that fetches fresh data
async function checkAndRefreshAuth() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const authToken = localStorage.getItem('authToken');
    
    if (isLoggedIn && authToken) {
        const userData = await fetchUserData();
        if (userData) {
            updateNavigationState();
            return true;
        } else {
            clearAuthenticationData();
            return false;
        }
    }
    
    return false;
}

// Export for use in other files
window.VivifyAuth = {
    checkAndRefreshAuth,
    clearAuthenticationData,
    logout,
    fetchUserData
};

// Auto-refresh user data when page loads if logged in
if (localStorage.getItem('userLoggedIn') === 'true') {
    fetchUserData().then(user => {
        if (user) {
            console.log('Page loaded with authenticated user:', user.username);
        }
    });
}