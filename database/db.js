/**
 * @fileoverview Database module for the Which State Am I quiz application.
 * Uses better-sqlite3 for synchronous SQLite operations with WAL mode enabled.
 * Provides helper functions for querying states, clues, and scores.
 * @module database/db
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'quiz.db');

/** @type {DatabaseSync} */
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// ──────────────────────────────────────────────
// Schema initialization
// ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    capital TEXT NOT NULL,
    region TEXT NOT NULL,
    famous_for TEXT,
    fun_fact TEXT,
    statehood_year INTEGER,
    official_language TEXT
  );

  CREATE TABLE IF NOT EXISTS clues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    clue_text TEXT NOT NULL,
    clue_type TEXT NOT NULL CHECK(clue_type IN ('culture','food','geography','landmark','history','language','festival','wildlife')),
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard')),
    FOREIGN KEY (state_id) REFERENCES states(id)
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    game_mode TEXT NOT NULL CHECK(game_mode IN ('classic','rapid')),
    time_taken INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Alter table scores to add user_id column if not exists (for existing database schemas)
try {
  db.exec('ALTER TABLE scores ADD COLUMN user_id INTEGER REFERENCES users(id)');
} catch (e) {
  // Column already exists, ignore error
}

// ──────────────────────────────────────────────
// Prepared statements
// ──────────────────────────────────────────────

const stmts = {
  getAllStates: db.prepare('SELECT * FROM states ORDER BY name'),
  getStateById: db.prepare('SELECT * FROM states WHERE id = ?'),
  getRandomStates: db.prepare('SELECT * FROM states ORDER BY RANDOM() LIMIT ?'),
  getRandomStatesByDifficulty: db.prepare(`
    SELECT DISTINCT s.* FROM states s
    INNER JOIN clues c ON c.state_id = s.id
    WHERE c.difficulty = ?
    ORDER BY RANDOM()
    LIMIT ?
  `),
  getCluesForState: db.prepare(`
    SELECT * FROM clues
    WHERE state_id = ?
    ORDER BY
      CASE difficulty
        WHEN 'easy' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'hard' THEN 3
      END
  `),
  getCluesForStateWithLimit: db.prepare(`
    SELECT * FROM clues
    WHERE state_id = ?
    ORDER BY
      CASE difficulty
        WHEN 'easy' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'hard' THEN 3
      END
    LIMIT ?
  `),
  insertScore: db.prepare(`
    INSERT INTO scores (player_name, score, game_mode, time_taken, user_id)
    VALUES (?, ?, ?, ?, ?)
  `),
  getLeaderboard: db.prepare(`
    SELECT * FROM scores
    WHERE game_mode = ?
    ORDER BY score DESC, time_taken ASC
    LIMIT ?
  `),
  countHigherScores: db.prepare(`
    SELECT COUNT(*) AS count FROM scores
    WHERE game_mode = ? AND score > ?
  `),
  searchStates: db.prepare(`
    SELECT * FROM states
    WHERE name LIKE ?
    ORDER BY name
  `),
  insertUser: db.prepare(`
    INSERT INTO users (username, password_hash)
    VALUES (?, ?)
  `),
  getUserByUsername: db.prepare(`
    SELECT * FROM users
    WHERE username = ?
  `),
};

// ──────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────

/**
 * Retrieves random states from the database.
 * @param {number} count - Number of random states to retrieve
 * @param {string} [difficulty] - Optional difficulty filter ('easy', 'medium', 'hard'). If 'mixed' or omitted, returns from all states.
 * @returns {Object[]} Array of state objects
 */
function getRandomStates(count, difficulty) {
  if (difficulty && difficulty !== 'mixed') {
    return stmts.getRandomStatesByDifficulty.all(difficulty, count);
  }
  return stmts.getRandomStates.all(count);
}

/**
 * Retrieves clues for a specific state, ordered by difficulty (easy → hard).
 * @param {number} stateId - The state's database ID
 * @param {number} [limit] - Optional maximum number of clues to return
 * @returns {Object[]} Array of clue objects
 */
function getCluesForState(stateId, limit) {
  if (limit) {
    return stmts.getCluesForStateWithLimit.all(stateId, limit);
  }
  return stmts.getCluesForState.all(stateId);
}

/**
 * Retrieves all states ordered alphabetically by name.
 * @returns {Object[]} Array of all state objects
 */
function getAllStates() {
  return stmts.getAllStates.all();
}

/**
 * Retrieves a single state by its database ID.
 * @param {number} id - The state's database ID
 * @returns {Object|undefined} The state object, or undefined if not found
 */
function getStateById(id) {
  return stmts.getStateById.get(id);
}

/**
 * Saves a player's score to the database.
 * @param {string} playerName - The player's display name
 * @param {number} score - The score achieved
 * @param {string} gameMode - The game mode ('classic' or 'rapid')
 * @param {number} [timeTaken] - Optional time taken in seconds
 * @param {number} [userId] - Optional associated user ID
 * @returns {number} The ID of the newly inserted score record
 */
function saveScore(playerName, score, gameMode, timeTaken, userId) {
  const result = stmts.insertScore.run(playerName, score, gameMode, timeTaken || null, userId || null);
  return result.lastInsertRowid;
}

/**
 * Creates a new user record in the database.
 * @param {string} username - Unique username
 * @param {string} passwordHash - Hashed password
 * @returns {number} The ID of the newly created user
 */
function createUser(username, passwordHash) {
  const result = stmts.insertUser.run(username, passwordHash);
  return result.lastInsertRowid;
}

/**
 * Retrieves a user record by username.
 * @param {string} username - The username to query
 * @returns {Object|undefined} The user record, or undefined if not found
 */
function getUserByUsername(username) {
  return stmts.getUserByUsername.get(username);
}

/**
 * Retrieves the leaderboard for a specific game mode.
 * Results are ordered by score descending, then time ascending.
 * @param {string} gameMode - The game mode ('classic' or 'rapid')
 * @param {number} [limit=10] - Maximum number of entries to return
 * @returns {Object[]} Array of score objects
 */
function getLeaderboard(gameMode, limit = 10) {
  return stmts.getLeaderboard.all(gameMode, limit);
}

/**
 * Searches states by name (case-insensitive partial match).
 * @param {string} searchTerm - The search query
 * @returns {Object[]} Array of matching state objects
 */
function searchStates(searchTerm) {
  return stmts.searchStates.all(`%${searchTerm}%`);
}

/**
 * Counts scores higher than a given score for ranking purposes.
 * @param {string} gameMode - The game mode to check
 * @param {number} score - The score to compare against
 * @returns {number} The count of higher scores
 */
function countHigherScores(gameMode, score) {
  const result = stmts.countHigherScores.get(gameMode, score);
  return result.count;
}

module.exports = {
  db,
  getRandomStates,
  getCluesForState,
  getAllStates,
  getStateById,
  saveScore,
  getLeaderboard,
  searchStates,
  countHigherScores,
  createUser,
  getUserByUsername,
};
