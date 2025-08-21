require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require('path');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve static files from the current directory (where your HTML files are)
app.use(express.static(__dirname));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
    },
  })
);

// Database connection (remove deprecated options)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// JWT helper functions
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1h' });
};

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Routes
app.use('/auth', authRoutes);

// Serve the main index.html file at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API route to get user data
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route example
app.get('/dashboard', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'Dashboard.html'));
});

// Profile route
app.get('/profile', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Handle 404 for any other routes
app.get('*', (req, res) => {
  // Check if it's an HTML file request
  if (req.path.endsWith('.html')) {
    res.sendFile(path.join(__dirname, req.path), (err) => {
      if (err) {
        res.status(404).send('Page not found');
      }
    });
  } else {
    res.status(404).send('Page not found');
  }
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));