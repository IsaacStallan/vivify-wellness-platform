const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT token and attach user to request object
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header or cookie
        const token = 
            req.headers.authorization?.split(' ')[1] || // Bearer token
            req.cookies?.token; // Cookie token
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required. Please log in.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user by ID
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found or deleted.' });
        }
        
        // Attach user to request object
        req.user = user;
        
        // Log last activity
        user.lastLogin = new Date();
        await user.save();
        
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
 * Middleware to check if user has admin role
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
};

/**
 * Optional authentication middleware - doesn't reject if no token is present
 */
const optionalAuth = async (req, res, next) => {
    try {
        // Get token from header or cookie
        const token = 
            req.headers.authorization?.split(' ')[1] || // Bearer token
            req.cookies?.token; // Cookie token
        
        if (!token) {
            // Skip authentication but mark request as unauthenticated
            req.isAuthenticated = false;
            return next();
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user by ID
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            req.isAuthenticated = false;
            return next();
        }
        
        // Attach user to request object
        req.user = user;
        req.isAuthenticated = true;
        
        next();
    } catch (error) {
        // Don't reject the request, just mark as unauthenticated
        req.isAuthenticated = false;
        next();
    }
};

module.exports = {
    authenticate,
    isAdmin,
    optionalAuth
};
