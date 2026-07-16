/**
 * @fileoverview Authentication middleware for user session management.
 * Implements custom signed session tokens using Node.js crypto HMAC.
 * @module middleware/auth
 */

const crypto = require('crypto');
const { getUserByUsername } = require('../database/db');

const SESSION_SECRET = process.env.SESSION_SECRET || 'which-state-am-i-secret-session-key-9876';
const TOKEN_COOKIE_NAME = 'session_token';

/**
 * Generates a signed session token.
 * Token structure: base64(username).timestamp.signature
 * @param {string} username - The user's username
 * @returns {string} The signed token
 */
function generateToken(username) {
  const timestamp = Date.now();
  const base64Username = Buffer.from(username).toString('base64');
  const payload = `${base64Username}.${timestamp}`;
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verifies a signed session token.
 * Checks HMAC signature and token expiration (7 days).
 * @param {string} token - The signed token string
 * @returns {Object|null} Decoded user object containing username, or null if invalid
 */
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [base64Username, timestampStr, signature] = parts;
  const payload = `${base64Username}.${timestampStr}`;

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');

  // Verify signature using timingSafeEqual to prevent timing attacks
  try {
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }
  } catch (e) {
    return null;
  }

  // Check expiration (7 days)
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  try {
    const username = Buffer.from(base64Username, 'base64').toString('utf8');
    return { username };
  } catch (e) {
    return null;
  }
}

/**
 * Express middleware to authenticate users based on cookie session token.
 * Attaches user record to req.user if authenticated.
 * Does not block unauthenticated requests.
 */
function authenticateUser(req, res, next) {
  // Parse cookies manually or via cookie-parser if we had it.
  // Since we don't have cookie-parser loaded, we can write a simple regex parser:
  const cookies = req.headers.cookie || '';
  const match = cookies.match(new RegExp(`(^|; )${TOKEN_COOKIE_NAME}=([^;]*)`));
  const token = match ? decodeURIComponent(match[2]) : null;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const user = getUserByUsername(decoded.username);
      if (user) {
        // Exclude password hash from the user object for safety
        const { password_hash, ...safeUser } = user;
        req.user = safeUser;
      }
    }
  }
  next();
}

/**
 * Express middleware to enforce authentication.
 * Rejects unauthenticated requests with a 401.
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateUser,
  requireAuth,
  TOKEN_COOKIE_NAME,
};
