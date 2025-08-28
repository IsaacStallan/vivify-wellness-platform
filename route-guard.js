// route-guard.js - Frontend routing and access control
class RouteGuard {
    constructor() {
        this.init();
    }
    
    async init() {
        // Check authentication and role on page load
        await this.checkPageAccess();
        
        // Set up navigation event listeners
        this.setupNavigationGuards();
    }
    
    async checkPageAccess() {
        const currentPage = window.location.pathname.split('/').pop();
        const user = await authUtils.getCurrentUser();
        
        if (!user) {
            this.redirectToLogin(currentPage);
            return;
        }
        
        // Define page access rules
        const pageAccessRules = {
            'teacher-dashboard.html': ['teacher', 'admin', 'school_admin'],
            'admin-dashboard.html': ['admin', 'school_admin'],
            'dashboard.html': ['student', 'teacher', 'admin', 'school_admin'],
            'student-management.html': ['admin', 'school_admin'],
            'class-management.html': ['teacher', 'admin', 'school_admin'],
            'school-settings.html': ['school_admin']
        };
        
        const allowedRoles = pageAccessRules[currentPage];
        
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            this.redirectToAppropriatedashboard(user.role);
            return;
        }
        
        // Initialize page-specific functionality
        this.initializePageFeatures(user.role, currentPage);
    }
    
    redirectToLogin(intendedPage) {
        const redirectUrl = intendedPage ? `?redirect=${encodeURIComponent(intendedPage)}` : '';
        window.location.href = `login.html${redirectUrl}`;
    }
    
    redirectToAppropriateDatabase(userRole) {
        switch (userRole) {
            case 'teacher':
                window.location.href = 'teacher-dashboard.html';
                break;
            case 'admin':
            case 'school_admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'student':
            default:
                window.location.href = 'dashboard.html';
                break;
        }
    }
    
    setupNavigationGuards() {
        // Intercept navigation links
        document.addEventListener('click', async (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // Only guard internal navigation
            if (href.startsWith('http') || href.startsWith('#')) return;
            
            const user = await authUtils.getCurrentUser();
            if (!user) {
                e.preventDefault();
                this.redirectToLogin(href);
                return;
            }
            
            // Check if user has access to the target page
            if (!this.canAccessPage(href, user.role)) {
                e.preventDefault();
                this.showAccessDeniedMessage();
            }
        });
    }
    
    canAccessPage(pagePath, userRole) {
        const pageAccessRules = {
            'teacher-dashboard.html': ['teacher', 'admin', 'school_admin'],
            'admin-dashboard.html': ['admin', 'school_admin'],
            'student-management.html': ['admin', 'school_admin'],
            'class-management.html': ['teacher', 'admin', 'school_admin'],
            'school-settings.html': ['school_admin']
        };
        
        const allowedRoles = pageAccessRules[pagePath];
        return !allowedRoles || allowedRoles.includes(userRole);
    }
    
    showAccessDeniedMessage() {
        // Create and show access denied modal/alert
        const modal = document.createElement('div');
        modal.className = 'access-denied-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-lock"></i> Access Denied</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>You don't have permission to access this page.</p>
                    <p>Contact your administrator if you believe this is an error.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary close-modal">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for closing modal
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 5000);
    }
    
    initializePageFeatures(userRole, currentPage) {
        // Initialize role-specific features based on current page
        switch (currentPage) {
            case 'dashboard.html':
                if (userRole === 'student') {
                    this.initStudentDashboard();
                }
                break;
                
            case 'teacher-dashboard.html':
                this.initTeacherDashboard();
                break;
                
            case 'admin-dashboard.html':
                this.initAdminDashboard();
                break;
        }
    }
    
    initStudentDashboard() {
        // Hide teacher/admin specific elements
        const teacherElements = document.querySelectorAll('.teacher-only, .admin-only');
        teacherElements.forEach(el => el.style.display = 'none');
    }
    
    initTeacherDashboard() {
        // Load teacher-specific functionality
        if (typeof TeacherDashboard !== 'undefined') {
            new TeacherDashboard();
        }
    }
    
    initAdminDashboard() {
        // Load admin-specific functionality
        if (typeof AdminDashboard !== 'undefined') {
            new AdminDashboard();
        }
    }
}

// Role-specific feature toggles
class FeatureManager {
    static async setupRoleBasedFeatures() {
        const user = await authUtils.getCurrentUser();
        if (!user) return;
        
        // Show/hide navigation elements
        this.toggleNavigationElements(user.role);
        
        // Setup role-specific event listeners
        this.setupRoleSpecificListeners(user.role);
        
        // Load role-specific data
        this.loadRoleSpecificData(user.role);
    }
    
    static toggleNavigationElements(userRole) {
        const elementVisibility = {
            student: {
                show: ['.student-nav', '.wellness-tracker', '.assessments-menu'],
                hide: ['.teacher-nav', '.admin-nav', '.management-tools']
            },
            teacher: {
                show: ['.teacher-nav', '.student-overview', '.class-management'],
                hide: ['.admin-nav', '.school-management']
            },
            admin: {
                show: ['.admin-nav', '.teacher-nav', '.school-management', '.user-management'],
                hide: []
            },
            school_admin: {
                show: ['.admin-nav', '.teacher-nav', '.school-management', '.user-management', '.billing-management'],
                hide: []
            }
        };
        
        const config = elementVisibility[userRole];
        if (!config) return;
        
        config.show.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'block';
                el.classList.remove('hidden');
            });
        });
        
        config.hide.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'none';
                el.classList.add('hidden');
            });
        });
    }
    
    static setupRoleSpecificListeners(userRole) {
        switch (userRole) {
            case 'teacher':
                this.setupTeacherEventListeners();
                break;
            case 'admin':
            case 'school_admin':
                this.setupAdminEventListeners();
                break;
        }
    }
    
    static setupTeacherEventListeners() {
        // Add event listeners for teacher-specific functionality
        document.addEventListener('click', async (e) => {
            if (e.target.matches('.view-student-details')) {
                const studentId = e.target.dataset.studentId;
                await this.loadStudentDetails(studentId);
            }
            
            if (e.target.matches('.record-intervention')) {
                const studentId = e.target.dataset.studentId;
                this.showInterventionModal(studentId);
            }
        });
    }
    
    static setupAdminEventListeners() {
        // Add event listeners for admin-specific functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('.manage-teacher')) {
                const teacherId = e.target.dataset.teacherId;
                this.showTeacherManagementModal(teacherId);
            }
            
            if (e.target.matches('.view-school-analytics')) {
                this.loadSchoolAnalytics();
            }
        });
    }
    
    static async loadRoleSpecificData(userRole) {
        switch (userRole) {
            case 'teacher':
                await this.loadTeacherData();
                break;
            case 'admin':
            case 'school_admin':
                await this.loadAdminData();
                break;
        }
    }
    
    static async loadTeacherData() {
        try {
            const response = await fetch('/api/teacher/my-students', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.displayStudentOverview(data.students);
            }
        } catch (error) {
            console.error('Error loading teacher data:', error);
        }
    }
    
    static async loadAdminData() {
        // Load admin-specific data
        try {
            const [teachersResponse, analyticsResponse] = await Promise.all([
                fetch('/api/admin/teachers', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                }),
                fetch('/api/admin/school-analytics', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                })
            ]);
            
            if (teachersResponse.ok && analyticsResponse.ok) {
                const teachers = await teachersResponse.json();
                const analytics = await analyticsResponse.json();
                
                this.displayTeacherOverview(teachers);
                this.displaySchoolAnalytics(analytics);
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }
    
    static displayStudentOverview(students) {
        // Implementation for displaying student data in teacher dashboard
        const container = document.getElementById('students-overview');
        if (container) {
            container.innerHTML = students.map(student => `
                <div class="student-card" data-student-id="${student.id}">
                    <div class="student-info">
                        <h4>${student.name}</h4>
                        <p>Year ${student.yearLevel} • ${student.className}</p>
                        <div class="wellness-indicator ${student.wellnessStatus}">
                            ${student.overallScore}% Overall Wellness
                        </div>
                    </div>
                    <div class="student-actions">
                        <button class="btn btn-sm view-student-details" data-student-id="${student.id}">
                            View Details
                        </button>
                        ${student.alerts.length > 0 ? 
                            `<button class="btn btn-sm btn-warning record-intervention" data-student-id="${student.id}">
                                ${student.alerts.length} Alert${student.alerts.length > 1 ? 's' : ''}
                            </button>` : ''
                        }
                    </div>
                </div>
            `).join('');
        }
    }
}

// Initialize route guard and feature management
document.addEventListener('DOMContentLoaded', () => {
    new RouteGuard();
    FeatureManager.setupRoleBasedFeatures();
});

// Export for external use
window.RouteGuard = RouteGuard;
window.FeatureManager = FeatureManager;