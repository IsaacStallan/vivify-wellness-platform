// class-management.js - Clean version without template literal issues

// Class management system
const ClassManager = {
    // Generate unique 6-character class code
    generateClassCode: function() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Make sure code doesn't already exist
        const existingClasses = JSON.parse(localStorage.getItem('vivifyClasses') || '[]');
        if (existingClasses.some(c => c.code === code)) {
            return this.generateClassCode(); // Try again if duplicate
        }
        return code;
    },

    // Teacher creates a new class
    createClass: function(teacherId, classData) {
        return new Promise((resolve) => {
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
            
            // Save to localStorage
            const existingClasses = JSON.parse(localStorage.getItem('vivifyClasses') || '[]');
            existingClasses.push(classInfo);
            localStorage.setItem('vivifyClasses', JSON.stringify(existingClasses));
            
            resolve(classInfo);
        });
    },

    // Student joins class with code
    joinClass: function(studentId, classCode) {
        return new Promise((resolve) => {
            const classes = JSON.parse(localStorage.getItem('vivifyClasses') || '[]');
            const targetClass = classes.find(c => c.code === classCode.toUpperCase() && c.active);
            
            if (!targetClass) {
                resolve({
                    success: false,
                    error: 'Invalid class code. Please check with your teacher.'
                });
                return;
            }
            
            if (targetClass.students.includes(studentId)) {
                resolve({
                    success: false,
                    error: 'You are already enrolled in this class.'
                });
                return;
            }
            
            // Add student to class
            targetClass.students.push(studentId);
            
            // Save updated classes
            localStorage.setItem('vivifyClasses', JSON.stringify(classes));
            
            // Update student profile
            const studentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            if (!studentProfile.classes) studentProfile.classes = [];
            
            studentProfile.classes.push({
                classId: targetClass.id,
                className: targetClass.name,
                teacherId: targetClass.teacherId,
                subject: targetClass.subject,
                joinedAt: new Date().toISOString(),
                classCode: targetClass.code
            });
            localStorage.setItem('userProfile', JSON.stringify(studentProfile));
            
            this.getTeacherName(targetClass.teacherId).then(teacherName => {
                resolve({
                    success: true,
                    className: targetClass.name,
                    teacherName: teacherName
                });
            });
        });
    },

    // Get teacher name
    getTeacherName: function(teacherId) {
        return new Promise((resolve) => {
            const users = JSON.parse(localStorage.getItem('vivifyUsers') || '[]');
            const teacher = users.find(u => u.id === teacherId);
            resolve(teacher ? teacher.name : 'Teacher');
        });
    },

    // Load student's classes
    loadStudentClasses: function() {
        const studentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const classes = studentProfile.classes || [];
        
        const classesContainer = document.getElementById('studentClasses');
        if (!classesContainer) return;
        
        if (classes.length === 0) {
            classesContainer.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">You haven\'t joined any classes yet. Ask your teacher for a class code!</p>';
            return;
        }
        
        let classesHtml = '';
        classes.forEach(function(cls) {
            classesHtml += '<div style="background: #333; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">';
            classesHtml += '<div style="display: flex; justify-content: space-between; align-items: center;">';
            classesHtml += '<div>';
            classesHtml += '<strong style="color: #f39c12;">' + cls.className + '</strong>';
            classesHtml += '<p style="color: #ccc; font-size: 0.9rem; margin: 0.5rem 0 0 0;">' + cls.subject + '</p>';
            classesHtml += '</div>';
            classesHtml += '<div style="text-align: right;">';
            classesHtml += '<div style="color: #27ae60; font-size: 0.8rem;">✓ Active</div>';
            classesHtml += '<div style="color: #888; font-size: 0.75rem;">Code: ' + cls.classCode + '</div>';
            classesHtml += '</div>';
            classesHtml += '</div>';
            classesHtml += '</div>';
        });
        
        classesContainer.innerHTML = classesHtml;
    },

    // Load teacher's classes
    loadTeacherClasses: function() {
        const teacherProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const classes = JSON.parse(localStorage.getItem('vivifyClasses') || '[]');
        const teacherClasses = classes.filter(c => c.teacherId === teacherProfile.id);
        
        const container = document.getElementById('teacherClasses');
        if (!container) return;
        
        if (teacherClasses.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">No classes created yet. Create your first class to start monitoring student wellness!</p>';
            return;
        }
        
        let classesHtml = '';
        teacherClasses.forEach(function(cls) {
            classesHtml += '<div style="background: #333; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">';
            classesHtml += '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">';
            classesHtml += '<div>';
            classesHtml += '<h4 style="color: #f39c12; margin: 0 0 0.5rem 0;">' + cls.name + '</h4>';
            classesHtml += '<p style="color: #ccc; font-size: 0.9rem; margin: 0;">' + cls.students.length + ' students • ' + cls.subject + '</p>';
            classesHtml += '</div>';
            classesHtml += '<div style="text-align: right;">';
            classesHtml += '<div style="background: #f39c12; color: black; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; font-size: 1rem;">' + cls.code + '</div>';
            classesHtml += '<p style="color: #888; font-size: 0.75rem; margin: 0.5rem 0 0 0;">Share this code</p>';
            classesHtml += '</div>';
            classesHtml += '</div>';
            classesHtml += '<div style="display: flex; gap: 0.5rem;">';
            classesHtml += '<button onclick="copyClassCode(\'' + cls.code + '\')" class="action-btn primary">';
            classesHtml += '<i class="fas fa-copy"></i> Copy Code</button>';
            classesHtml += '<button onclick="viewClassStudents(\'' + cls.id + '\')" class="action-btn">';
            classesHtml += '<i class="fas fa-users"></i> ' + cls.students.length + ' Students</button>';
            classesHtml += '</div>';
            classesHtml += '</div>';
        });
        
        container.innerHTML = classesHtml;
    }
};

// Global functions for UI interactions
window.joinClass = function() {
    const classCodeInput = document.getElementById('classCodeInput');
    if (!classCodeInput) return;
    
    const classCode = classCodeInput.value.trim().toUpperCase();
    if (!classCode) {
        alert('Please enter a class code');
        return;
    }
    
    const studentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    ClassManager.joinClass(studentProfile.id, classCode).then(function(result) {
        if (result.success) {
            alert('Successfully joined ' + result.className + '!');
            ClassManager.loadStudentClasses();
            classCodeInput.value = '';
        } else {
            alert(result.error);
        }
    });
};

window.createNewClass = function() {
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
    
    ClassManager.createClass(teacherProfile.id, {
        name: className,
        subject: subject,
        yearLevel: yearLevel
    }).then(function(newClass) {
        alert('Class created successfully!\n\nClass Code: ' + newClass.code + '\n\nShare this code with your students so they can join your class.');
        ClassManager.loadTeacherClasses();
    });
};

window.copyClassCode = function(code) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function() {
            alert('Class code ' + code + ' copied to clipboard! Share this with your students.');
        }).catch(function() {
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
        document.execCommand('copy');
        alert('Class code ' + text + ' copied! Share this with your students.');
    } catch (err) {
        alert('Could not copy code. Please manually share this code with students: ' + text);
    }
    
    document.body.removeChild(textArea);
}

window.viewClassStudents = function(classId) {
    const classes = JSON.parse(localStorage.getItem('vivifyClasses') || '[]');
    const targetClass = classes.find(c => c.id == classId);
    
    if (!targetClass) {
        alert('Class not found');
        return;
    }
    
    if (targetClass.students.length === 0) {
        alert('No students have joined this class yet.\n\nShare the class code: ' + targetClass.code);
        return;
    }
    
    alert('Class: ' + targetClass.name + '\nStudents: ' + targetClass.students.length + '\n\nThis would show detailed student list in a real implementation.');
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'student') {
        ClassManager.loadStudentClasses();
    } else if (userRole === 'teacher' || userRole === 'admin') {
        ClassManager.loadTeacherClasses();
    }
});