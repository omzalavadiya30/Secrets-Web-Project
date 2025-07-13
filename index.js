const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(flash());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.redirect('/login');
    
    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect('/login');
  }
};

// Validation middleware
const validateRegistration = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6, max: 8 })
    .withMessage('Password must be between 6-8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// Helper function for flash messages
const flashError = (req, message) => req.flash('errors', [{ msg: message }]);
const flashSuccess = (req, message) => req.flash('success', message);

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Secrets - Share Your Secrets Securely', user: req.user || null });
});

app.get('/register', (req, res) => {
  res.render('register', { 
    title: 'Create Account',
    errors: req.flash('errors'),
    success: req.flash('success')
  });
});

app.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array());
      return res.redirect('/register');
    }

    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      flashError(req, 'User with this email already exists');
      return res.redirect('/register');
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    await new User({ name, email, password: hashedPassword }).save();
    
    flashSuccess(req, 'Registration successful! Please login.');
    res.redirect('/login');
    
  } catch (error) {
    console.error('Registration error:', error);
    flashError(req, 'Registration failed. Please try again.');
    res.redirect('/register');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login',
    errors: req.flash('errors'),
    success: req.flash('success')
  });
});

app.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array());
      return res.redirect('/login');
    }

    const { email, password } = req.body;
    
    // Find user and verify password
    const user = await User.findOne({ email }).lean();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      flashError(req, 'Invalid email or password');
      return res.redirect('/login');
    }

    // Create JWT token and set cookie
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    flashError(req, 'Login failed. Please try again.');
    res.redirect('/login');
  }
});

app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.render('dashboard', { 
      title: 'Dashboard',
      user,
      success: req.flash('success'),
      errors: req.flash('errors')
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  flashSuccess(req, 'Logged out successfully!');
  res.redirect('/login');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found', 
    message: 'The page you are looking for does not exist.' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));