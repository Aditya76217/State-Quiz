/**
 * @fileoverview API route handlers for the Which State Am I quiz application.
 * Manages quiz sessions in-memory, handles quiz gameplay, state lookups,
 * score submission, and leaderboard retrieval.
 * @module routes/api
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  getRandomStates,
  getCluesForState,
  getAllStates,
  getStateById,
  saveScore,
  getLeaderboard,
  searchStates,
  countHigherScores,
} = require('../database/db');
const {
  validateScore,
  validateQuizStart,
  validateAnswer,
  handleValidationErrors,
} = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// ──────────────────────────────────────────────
// In-memory session store
// ──────────────────────────────────────────────

/**
 * @typedef {Object} QuizSession
 * @property {string} id - Unique session identifier (UUID)
 * @property {string} mode - Game mode ('classic' or 'rapid')
 * @property {string} difficulty - Difficulty level
 * @property {Object[]} states - Array of state objects with their clues
 * @property {number} currentQuestion - Current question index (0-based)
 * @property {number} score - Accumulated score
 * @property {number} cluesRevealed - Number of clues revealed for the current question
 * @property {number} startTime - Timestamp when the session was created
 * @property {Object[]} answers - Array of answer records
 */

/** @type {Map<string, QuizSession>} */
const sessions = new Map();

/** Maximum session age in milliseconds (1 hour) */
const SESSION_TTL = 60 * 60 * 1000;

/** Session cleanup interval in milliseconds (10 minutes) */
const CLEANUP_INTERVAL = 10 * 60 * 1000;

/**
 * Periodically removes expired sessions from the in-memory store.
 * Runs every 10 minutes and clears sessions older than 1 hour.
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.startTime > SESSION_TTL) {
      sessions.delete(id);
    }
  }
}, CLEANUP_INTERVAL);

// Prevent the cleanup interval from keeping the process alive in tests
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

// ──────────────────────────────────────────────
// Utility functions
// ──────────────────────────────────────────────

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm.
 * @template T
 * @param {T[]} array - The array to shuffle
 * @returns {T[]} The same array, now shuffled
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Calculates points earned based on game mode and clues used.
 * Classic mode: (5 - cluesUsed + 1) * 20, max 100
 * Rapid mode: flat 10 points per correct answer
 * @param {string} mode - Game mode ('classic' or 'rapid')
 * @param {number} cluesUsed - Number of clues revealed before answering
 * @returns {number} Points earned
 */
function calculatePoints(mode, cluesUsed) {
  if (mode === 'rapid') {
    return 10;
  }
  // Classic: fewer clues used = more points
  return Math.max((5 - cluesUsed + 1) * 20, 20);
}

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

/**
 * GET /health
 * Health check endpoint.
 * @returns {{ status: string, timestamp: string, uptime: number }}
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /quiz/start
 * Starts a new quiz session.
 * @query {string} [mode=classic] - Game mode ('classic' or 'rapid')
 * @query {string} [difficulty=mixed] - Difficulty filter ('easy', 'medium', 'hard', 'mixed')
 * @returns {{ sessionId: string, mode: string, totalQuestions: number, difficulty: string }}
 */
router.get('/quiz/start', validateQuizStart, handleValidationErrors, (req, res) => {
  try {
    const mode = req.query.mode || 'classic';
    const difficulty = req.query.difficulty || 'mixed';
    const totalQuestions = mode === 'classic' ? 10 : 20;

    const states = getRandomStates(totalQuestions, difficulty);

    if (states.length === 0) {
      return res.status(500).json({
        error: 'No states available. Please seed the database first.',
      });
    }

    // Load clues for each state
    const statesWithClues = states.map((state) => ({
      ...state,
      clues: getCluesForState(state.id, 5),
    }));

    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      mode,
      difficulty,
      states: statesWithClues,
      currentQuestion: 0,
      score: 0,
      cluesRevealed: 1,
      startTime: Date.now(),
      answers: [],
    };

    sessions.set(sessionId, session);

    res.json({
      sessionId,
      mode,
      totalQuestions: states.length,
      difficulty,
    });
  } catch (err) {
    console.error('Error starting quiz:', err);
    res.status(500).json({ error: 'Failed to start quiz session' });
  }
});

/**
 * GET /quiz/question/:sessionId
 * Retrieves the current question for a quiz session.
 * @param {string} sessionId - The quiz session UUID
 * @returns {Object} Question data with clue, options, and metadata
 */
router.get('/quiz/question/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    // Check if game is complete
    if (session.currentQuestion >= session.states.length) {
      return res.json({
        complete: true,
        score: session.score,
        totalQuestions: session.states.length,
      });
    }

    const currentState = session.states[session.currentQuestion];
    const clues = currentState.clues;
    const revealedClue = clues[session.cluesRevealed - 1];

    if (!revealedClue) {
      return res.status(500).json({ error: 'No clues available for this question' });
    }

    // Generate 4 options: 1 correct + 3 random wrong answers
    const allStates = getAllStates();
    const wrongOptions = allStates
      .filter((s) => s.name !== currentState.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((s) => s.name);

    const options = shuffleArray([currentState.name, ...wrongOptions]);

    const totalClues = Math.min(clues.length, 5);
    const pointsAvailable = calculatePoints(session.mode, session.cluesRevealed);

    res.json({
      questionNumber: session.currentQuestion + 1,
      totalQuestions: session.states.length,
      clue: revealedClue.clue_text,
      clueNumber: session.cluesRevealed,
      totalClues,
      clueType: revealedClue.clue_type,
      options,
      timeLimit: session.mode === 'rapid' ? 10 : null,
      pointsAvailable,
    });
  } catch (err) {
    console.error('Error getting question:', err);
    res.status(500).json({ error: 'Failed to get question' });
  }
});

/**
 * POST /quiz/hint
 * Reveals the next clue for the current question in a quiz session.
 * @body {{ sessionId: string }}
 * @returns {Object} The next clue with metadata and updated points available
 */
router.post('/quiz/hint', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    if (session.currentQuestion >= session.states.length) {
      return res.status(400).json({ error: 'Game is already complete' });
    }

    const currentState = session.states[session.currentQuestion];
    const clues = currentState.clues;
    const totalClues = Math.min(clues.length, 5);

    if (session.cluesRevealed >= totalClues) {
      return res.status(400).json({
        error: 'No more clues available for this question',
        clueNumber: session.cluesRevealed,
        totalClues,
      });
    }

    // Reveal next clue
    session.cluesRevealed++;
    const newClue = clues[session.cluesRevealed - 1];
    const pointsAvailable = calculatePoints(session.mode, session.cluesRevealed);

    res.json({
      clue: newClue.clue_text,
      clueNumber: session.cluesRevealed,
      totalClues,
      clueType: newClue.clue_type,
      pointsAvailable,
    });
  } catch (err) {
    console.error('Error getting hint:', err);
    res.status(500).json({ error: 'Failed to get hint' });
  }
});

/**
 * POST /quiz/answer
 * Submits an answer for the current question in a quiz session.
 * @body {{ sessionId: string, answer: string }}
 * @returns {Object} Result with correctness, points, state info, and completion status
 */
router.post('/quiz/answer', validateAnswer, handleValidationErrors, (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    if (session.currentQuestion >= session.states.length) {
      return res.status(400).json({ error: 'Game is already complete' });
    }

    const currentState = session.states[session.currentQuestion];
    const isCorrect = currentState.name.toLowerCase() === answer.trim().toLowerCase();
    const pointsEarned = isCorrect ? calculatePoints(session.mode, session.cluesRevealed) : 0;

    // Update session
    session.score += pointsEarned;
    session.answers.push({
      questionNumber: session.currentQuestion + 1,
      stateName: currentState.name,
      givenAnswer: answer,
      correct: isCorrect,
      pointsEarned,
      cluesUsed: session.cluesRevealed,
    });

    // Advance to next question
    session.currentQuestion++;
    session.cluesRevealed = 1;

    const isComplete = session.currentQuestion >= session.states.length;

    res.json({
      correct: isCorrect,
      correctAnswer: currentState.name,
      pointsEarned,
      totalScore: session.score,
      stateInfo: {
        capital: currentState.capital,
        funFact: currentState.fun_fact,
        famousFor: currentState.famous_for,
      },
      isComplete,
      nextQuestion: !isComplete ? session.currentQuestion + 1 : null,
    });
  } catch (err) {
    console.error('Error submitting answer:', err);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

/**
 * GET /states
 * Retrieves all states, with optional search filtering.
 * @query {string} [search] - Optional name search filter (case-insensitive)
 * @returns {Object[]} Array of state objects
 */
router.get('/states', (req, res) => {
  try {
    const { search } = req.query;

    if (search) {
      const results = searchStates(search);
      return res.json(results);
    }

    res.json(getAllStates());
  } catch (err) {
    console.error('Error getting states:', err);
    res.status(500).json({ error: 'Failed to retrieve states' });
  }
});

/**
 * GET /states/:id
 * Retrieves a single state by ID with all its clues.
 * @param {string} id - The state's database ID (must be an integer)
 * @returns {Object} State object with clues array
 */
router.get('/states/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Validate id is an integer
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'State ID must be a valid integer' });
    }

    const state = getStateById(parseInt(id, 10));

    if (!state) {
      return res.status(404).json({ error: 'State not found' });
    }

    const clues = getCluesForState(state.id);

    res.json({
      ...state,
      clues,
    });
  } catch (err) {
    console.error('Error getting state:', err);
    res.status(500).json({ error: 'Failed to retrieve state' });
  }
});

/**
 * GET /leaderboard
 * Retrieves top scores for a game mode.
 * @query {string} [mode=classic] - Game mode filter ('classic' or 'rapid')
 * @query {number} [limit=10] - Maximum entries to return (max 50)
 * @returns {Object[]} Array of score objects ordered by score DESC
 */
router.get('/leaderboard', (req, res) => {
  try {
    const mode = req.query.mode || 'classic';
    let limit = parseInt(req.query.limit, 10) || 10;
    limit = Math.min(Math.max(limit, 1), 50);

    const leaderboard = getLeaderboard(mode, limit);
    res.json(leaderboard);
  } catch (err) {
    console.error('Error getting leaderboard:', err);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

/**
 * POST /scores
 * Submits a new score to the leaderboard.
 * @body {{ playerName: string, score: number, gameMode: string, timeTaken?: number }}
 * @returns {{ id: number, rank: number }}
 */
router.post('/scores', authenticateUser, validateScore, handleValidationErrors, (req, res) => {
  try {
    const { playerName, score, gameMode, timeTaken } = req.body;
    const userId = req.user ? req.user.id : null;

    const id = saveScore(playerName, score, gameMode, timeTaken, userId);
    const rank = countHigherScores(gameMode, score) + 1;

    res.status(201).json({ id: Number(id), rank });
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

module.exports = router;
