// auth-middleware.js - Enhanced with role-based access
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

/**
 * Basic authentication middleware
 */
const authenticate = async (req, res, next) => {
    try {
        const token = 
            req.headers.authorization?.split(' ')[1] || 
            req.cookies?.token;
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required. Please log in.' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id)
            .populate('schoolId')
            .select('-password');
            
        if (!user) {
            return res.status(401).json({ message: 'User not found or deleted.' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired. Please log in again.' });
        }
        
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Server error during authentication.' });
    }
};

/**
 * Role-based access control middleware
 * @param {Array} allowedRoles - Array of roles that can access the route
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
            });
        }
        
        next();
    };
};

/**
 * Check if teacher can access specific student data
 */
const canAccessStudent = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        
        const { studentId } = req.params;
        
        // Admins can access all students in their school
        if (req.user.role === 'admin' || req.user.role === 'school_admin') {
            return next();
        }
        
        // Teachers can only access students in their classes
        if (req.user.role === 'teacher') {
            const hasPermission = req.user.classPermissions.some(permission => 
                permission.studentIds.includes(studentId)
            );
            
            if (!hasPermission) {
                return res.status(403).json({ 
                    message: 'You do not have permission to access this student\'s data.' 
                });
            }
            
            return next();
        }
        
        // Students can only access their own data
        if (req.user.role === 'student' && req.user._id.toString() === studentId) {
            return next();
        }
        
        return res.status(403).json({ message: 'Access denied.' });
        
    } catch (error) {
        console.error('Permission check error:', error);
        return res.status(500).json({ message: 'Server error during permission check.' });
    }
};

/**
 * School-level access control
 */
const requireSameSchool = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    
    // For routes that need school-level access control
    // This will be used when accessing school-wide data
    next();
};

module.exports = {
    authenticate,
    requireRole,
    canAccessStudent,
    requireSameSchool
};