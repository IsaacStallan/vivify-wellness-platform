require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key'; // Use env variable for security

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:3000', // Update with your client origin
    methods: ['POST', 'GET'], // Specify allowed methods
    credentials: true, // Allow credentials like cookies, authorization headers
  })
);

// Add middleware to protect restricted routes
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).redirect('/login.html?error=authRequired');
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.status(401).redirect('/login.html?error=invalidToken');
  }
};

// Apply middleware to protected routes
app.use(['/profile.html', '/fitness.html', '/nutrition.html', '/mental-health.html', '/life-lessons.html'], authMiddleware);
app.use('/api/user', authMiddleware);

// Dummy user database
const users = [
  { id: 1, username: 'user1', password: bcrypt.hashSync('pass1', 10) }, // Passwords should always be hashed
  { id: 2, username: 'user2', password: bcrypt.hashSync('pass2', 10) },
];

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user in the dummy database
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Compare the provided password with the hashed password
  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Token verification endpoint
app.post('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ isValid: false, message: 'Token is missing' });
  }

  // Verify the token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ isValid: false, message: 'Invalid or expired token' });
    }
    res.json({ isValid: true, userId: decoded.userId });
  });
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
