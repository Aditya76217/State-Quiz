/**
 * @fileoverview Request validation middleware using express-validator.
 * Provides validation chains for quiz answers, scores, and quiz start parameters.
 * @module middleware/validate
 */

const { body, query, param, validationResult } = require('express-validator');

/**
 * Validation chain for score submission.
 * Validates playerName, score, gameMode, and optional timeTaken.
 * @type {import('express-validator').ValidationChain[]}
 */
const validateScore = [
  body('playerName')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Player name must be 1-30 characters')
    .matches(/^[a-zA-Z0-9 ]+$/)
    .withMessage('Player name must be alphanumeric with spaces only'),
  body('score')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Score must be between 0 and 1000'),
  body('gameMode')
    .isIn(['classic', 'rapid'])
    .withMessage('Game mode must be classic or rapid'),
  body('timeTaken')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time taken must be a positive integer'),
];

/**
 * Validation chain for quiz start parameters.
 * Validates optional mode and difficulty query parameters.
 * @type {import('express-validator').ValidationChain[]}
 */
const validateQuizStart = [
  query('mode')
    .optional()
    .isIn(['classic', 'rapid'])
    .withMessage('Mode must be classic or rapid'),
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'mixed'])
    .withMessage('Difficulty must be easy, medium, hard, or mixed'),
];

/**
 * Validation chain for quiz answer submission.
 * Validates sessionId (UUID) and answer (non-empty string).
 * @type {import('express-validator').ValidationChain[]}
 */
const validateAnswer = [
  body('sessionId')
    .isUUID()
    .withMessage('Invalid session ID'),
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required'),
];

/**
 * Middleware to handle validation errors from express-validator chains.
 * Returns a 400 response with structured error details if validation fails.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      errors: formattedErrors,
      details: formattedErrors,
    });
  }
  next();
};

module.exports = {
  validateScore,
  validateQuizStart,
  validateAnswer,
  handleValidationErrors,
};
