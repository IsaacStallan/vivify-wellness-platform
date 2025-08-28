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
        
        if (targetClass.students.includes(studentId)) {
            return { success: false, error: 'Already enrolled in this class' };
        }
        
        targetClass.students.push(studentId);
        localStorage.setItem('vivifyClasses', JSON.stringify(classes));
        
        const allUsers = JSON.parse(localStorage.getItem('vivifyUsers') || '[]');
        const studentIndex = allUsers.findIndex(u => u.id === studentId);
        
        if (studentIndex !== -1) {
            if (!allUsers[studentIndex].classes) {
                allUsers[studentIndex].classes = [];
            }
            if (!allUsers[studentIndex].classes.includes(targetClass.id)) {
                allUsers[studentIndex].classes.push(targetClass.id);
            }
            localStorage.setItem('vivifyUsers', JSON.stringify(allUsers));
        }
        
        console.log(`Student ${studentId} joined class ${targetClass.name} (${classCode})`);
        
        return { 
            success: true, 
            classId: targetClass.id,
            className: targetClass.name
        };
    },

    async createClass(teacherId, classData) {
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

document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username')?.value.trim() || document.getElementById('name')?.value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const role = document.getElementById('userRole')?.value || document.getElementById('role')?.value || 'student';

            // Validation
            if (!username || !email || !password) {
                alert('Please fill in all required fields');
                return;
            }

            // Check if email already exists
            const existingUsers = JSON.parse(localStorage.getItem('vivifyUsers') || '[]');
            if (existingUsers.find(user => user.email === email)) {
                alert('Email already registered. Please use a different email or login.');
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                name: username,
                email: email,
                password: password,
                role: role,
                classes: [],
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            // Add role-specific data
            if (role === 'student') {
                const yearLevel = document.getElementById('yearLevel')?.value;
                const school = document.getElementById('school')?.value === 'Other' ? 
                    document.getElementById('otherSchool')?.value : 
                    document.getElementById('school')?.value;
                
                newUser.yearLevel = yearLevel;
                newUser.school = school;

                // Handle class code joining
                const classCode = document.getElementById('teacherClassCode')?.value?.trim();
                if (classCode) {
                    const joinResult = ClassManager.addStudentToClass(newUser.id, classCode);
                    if (joinResult.success) {
                        console.log(`Student joined class: ${joinResult.className}`);
                    } else {
                        alert(`Registration successful, but class join failed: ${joinResult.error}`);
                    }
                }
            } else if (role === 'teacher') {
                newUser.department = document.getElementById('department')?.value;
                newUser.schoolCode = document.getElementById('schoolCode')?.value;
                newUser.staffId = document.getElementById('staffId')?.value;
            }

            // Save user
            existingUsers.push(newUser);
            localStorage.setItem('vivifyUsers', JSON.stringify(existingUsers));

            // Set authentication
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userRole', role);
            localStorage.setItem('userProfile', JSON.stringify(newUser));
            localStorage.setItem('authToken', 'local_' + newUser.id);

            // Redirect based on role
            if (role === 'teacher') {
                window.location.href = 'teacher-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // Handle demo accounts
            if (password === 'Demo123') {
                const pendingDemo = sessionStorage.getItem('pendingDemoProfile');
                if (pendingDemo) {
                    const demoUser = JSON.parse(pendingDemo);
                    sessionStorage.removeItem('pendingDemoProfile');
                    
                    // Save demo user to main storage
                    const existingUsers = JSON.parse(localStorage.getItem('vivifyUsers') || '[]');
                    const userExists = existingUsers.find(u => u.email === demoUser.email);
                    
                    if (!userExists) {
                        existingUsers.push(demoUser);
                        localStorage.setItem('vivifyUsers', JSON.stringify(existingUsers));
                    }
                    
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('userRole', demoUser.role);
                    localStorage.setItem('userProfile', JSON.stringify(demoUser));
                    localStorage.setItem('authToken', 'demo_' + demoUser.id);
                    
                    if (demoUser.role === 'teacher') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                    return;
                }
            }

            // Handle regular login
            const allUsers = JSON.parse(localStorage.getItem('vivifyUsers') || '[]');
            const user = allUsers.find(u => u.email === email && u.password === password);

            if (!user) {
                alert('Invalid email or password');
                return;
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            const userIndex = allUsers.findIndex(u => u.id === user.id);
            allUsers[userIndex] = user;
            localStorage.setItem('vivifyUsers', JSON.stringify(allUsers));

            // Set authentication
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userProfile', JSON.stringify(user));
            localStorage.setItem('authToken', 'local_' + user.id);

            // Redirect based on role
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');
            
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else if (user.role === 'teacher') {
                window.location.href = 'teacher-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }
});

// Global functions for class management
window.ClassManager = ClassManager;

window.joinClass = function() {
    const classCodeInput = document.getElementById('classCodeInput');
    if (!classCodeInput) return;
    
    const classCode = classCodeInput.value.trim().toUpperCase();
    if (!classCode) {
        alert('Please enter a class code');
        return;
    }
    
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