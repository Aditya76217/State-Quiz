/**
 * @fileoverview Express server entry point for the Which State Am I quiz application.
 * Configures middleware (helmet, CORS, compression, rate limiting),
 * mounts API routes, and handles graceful shutdown.
 * @module server
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ──────────────────────────────────────────────
// Security middleware
// ──────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// ──────────────────────────────────────────────
// CORS
// ──────────────────────────────────────────────

app.use(cors());

// ──────────────────────────────────────────────
// Compression
// ──────────────────────────────────────────────

app.use(compression());

// ──────────────────────────────────────────────
// Rate limiting
// ──────────────────────────────────────────────

const isTestEnv = process.env.NODE_ENV === 'test';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnv ? 10000 : 100, // Higher limit for test environment
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api', limiter);

// ──────────────────────────────────────────────
// Body parsing
// ──────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));

// ──────────────────────────────────────────────
// Static files
// ──────────────────────────────────────────────

app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────────
// API routes
// ──────────────────────────────────────────────

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// ──────────────────────────────────────────────
// Error handling
// ──────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ──────────────────────────────────────────────
// Start server (skip in test environment)
// ──────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🇮🇳 Which State Am I? server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   API: http://localhost:${PORT}/api/health`);
  });

  // ──────────────────────────────────────────────
  // WebSockets Setup
  // ──────────────────────────────────────────────
  const { WebSocketServer } = require('ws');
  const { verifyToken } = require('./middleware/auth');

  const wss = new WebSocketServer({ noServer: true });
  const activePlayers = new Map(); // socket -> { username, score, questionNumber, mode }

  function broadcastActivePlayers() {
    const list = Array.from(activePlayers.values()).map(p => ({
      username: p.username,
      score: p.score,
      questionNumber: p.questionNumber,
      mode: p.mode
    }));
    
    const message = JSON.stringify({
      type: 'ACTIVE_PLAYERS_LIST',
      players: list
    });

    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    });
  }

  server.on('upgrade', (request, socket, head) => {
    try {
      const pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
      
      if (pathname === '/ws') {
        const cookieHeader = request.headers.cookie || '';
        const match = cookieHeader.match(/(^|; )session_token=([^;]*)/);
        const token = match ? decodeURIComponent(match[2]) : null;
        const decoded = verifyToken(token);
        
        if (decoded) {
          wss.handleUpgrade(request, socket, head, (ws) => {
            ws.username = decoded.username;
            wss.emit('connection', ws, request);
          });
        } else {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
        }
      } else {
        socket.destroy();
      }
    } catch (err) {
      console.error('WS upgrade error:', err);
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    activePlayers.set(ws, {
      username: ws.username,
      score: 0,
      questionNumber: 0,
      mode: 'idle'
    });

    broadcastActivePlayers();

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'GAME_UPDATE') {
          const state = activePlayers.get(ws);
          if (state) {
            state.score = data.score;
            state.questionNumber = data.questionNumber;
            state.mode = data.mode;
            broadcastActivePlayers();
          }
        }
      } catch (e) {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      activePlayers.delete(ws);
      broadcastActivePlayers();
    });
    
    ws.on('error', (err) => {
      console.error(`WS error for ${ws.username}:`, err);
      activePlayers.delete(ws);
      broadcastActivePlayers();
    });
  });

  /**
   * Graceful shutdown handler.
   * Closes the HTTP server and database connection before exiting.
   * Forces exit after 10 seconds if shutdown hangs.
   * @param {string} signal - The OS signal received (e.g. SIGTERM, SIGINT)
   */
  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    // Close WebSocket connections
    wss.clients.forEach(client => client.close());
    
    server.close(() => {
      console.log('Server closed.');
      const { db } = require('./database/db');
      db.close();
      console.log('Database connection closed.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
