/**
 * @fileoverview Auth router handling registration, login, logout, and self check.
 * Implements scrypt hashing for secure password storage.
 * @module routes/auth
 */

const express = require('express');
const crypto = require('crypto');
const { createUser, getUserByUsername } = require('../database/db');
const { generateToken, authenticateUser, TOKEN_COOKIE_NAME } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ──────────────────────────────────────────────
// Hashing Helpers
// ──────────────────────────────────────────────

/**
 * Hashes a password using scrypt.
 * Output format: salt:hash
 * @param {string} password - The plain text password
 * @returns {string} The formatted salt and hash
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored scrypt hash.
 * @param {string} password - The plain text password
 * @param {string} storedHash - The stored salt and hash format (salt:hash)
 * @returns {boolean} True if correct, false otherwise
 */
function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(':');
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    
    const hashBuffer = Buffer.from(hash, 'hex');
    const testBuffer = Buffer.from(testHash, 'hex');
    
    return hashBuffer.length === testBuffer.length && crypto.timingSafeEqual(hashBuffer, testBuffer);
  } catch (e) {
    return false;
  }
}

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

/**
 * POST /register
 * Registers a new user.
 */
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be 3 to 20 characters long')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const existing = getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ error: 'Username is already taken' });
      }

      const passwordHash = hashPassword(password);
      const userId = createUser(username, passwordHash);

      const token = generateToken(username);
      
      // Set session cookie
      res.setHeader(
        'Set-Cookie',
        `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; ${
          process.env.NODE_ENV === 'production' ? 'Secure;' : ''
        }`
      );

      res.status(201).json({
        message: 'Registration successful',
        user: { id: Number(userId), username },
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
);

/**
 * POST /login
 * Authenticates user and sets session token cookie.
 */
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = getUserByUsername(username);
      if (!user || !verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = generateToken(username);

      // Set session cookie
      res.setHeader(
        'Set-Cookie',
        `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; ${
          process.env.NODE_ENV === 'production' ? 'Secure;' : ''
        }`
      );

      res.json({
        message: 'Login successful',
        user: { id: user.id, username: user.name || user.username },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Failed to authenticate user' });
    }
  }
);

/**
 * POST /logout
 * Clears session token cookie.
 */
router.post('/logout', (req, res) => {
  res.setHeader(
    'Set-Cookie',
    `${TOKEN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /me
 * Checks auth status and returns user object if logged in.
 */
router.get('/me', authenticateUser, (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

module.exports = router;
