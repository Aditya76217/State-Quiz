const request = require('supertest');
const app = require('../server');
const { db } = require('../database/db');
const { seed } = require('../database/seed');

describe('API Integration Tests', () => {
  let sessionId;
  let stateId;
  let stateName;

  beforeAll(() => {
    // Ensure database has seed data before running API tests
    const count = db.prepare('SELECT COUNT(*) AS count FROM states').get().count;
    if (count === 0) {
      seed();
    }
    
    // Get a state for testing details and answers
    const testState = db.prepare('SELECT * FROM states LIMIT 1').get();
    stateId = testState.id;
    stateName = testState.name;
  });

  afterAll(() => {
    db.close();
  });

  test('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  test('GET /api/states returns all states', async () => {
    const res = await request(app).get('/api/states');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBeDefined();
    expect(res.body[0].capital).toBeDefined();
  });

  test('GET /api/states/:id returns details of a state', async () => {
    const res = await request(app).get(`/api/states/${stateId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(stateId);
    expect(res.body.name).toBe(stateName);
    expect(Array.isArray(res.body.clues)).toBe(true);
    expect(res.body.clues.length).toBeGreaterThan(0);
  });

  test('GET /api/states/999 returns 404', async () => {
    const res = await request(app).get('/api/states/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('State not found');
  });

  test('GET /api/states/invalid-id returns 400', async () => {
    const res = await request(app).get('/api/states/abc');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('State ID must be a valid integer');
  });

  test('GET /api/quiz/start creates a session', async () => {
    const res = await request(app).get('/api/quiz/start');
    expect(res.statusCode).toBe(200);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.mode).toBe('classic');
    expect(res.body.totalQuestions).toBe(10);
    
    // Save for subsequent tests
    sessionId = res.body.sessionId;
  });

  test('GET /api/quiz/start?mode=rapid starts rapid mode', async () => {
    const res = await request(app).get('/api/quiz/start?mode=rapid');
    expect(res.statusCode).toBe(200);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.mode).toBe('rapid');
    expect(res.body.totalQuestions).toBe(20);
  });

  test('GET /api/quiz/question/:sessionId returns current question', async () => {
    const res = await request(app).get(`/api/quiz/question/${sessionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.questionNumber).toBe(1);
    expect(res.body.clue).toBeDefined();
    expect(res.body.clueType).toBeDefined();
    expect(Array.isArray(res.body.options)).toBe(true);
    expect(res.body.options.length).toBe(4);
    expect(res.body.pointsAvailable).toBe(100);
  });

  test('POST /api/quiz/hint reveals the next clue', async () => {
    const res = await request(app)
      .post('/api/quiz/hint')
      .send({ sessionId });
    expect(res.statusCode).toBe(200);
    expect(res.body.clue).toBeDefined();
    expect(res.body.clueNumber).toBe(2);
    expect(res.body.pointsAvailable).toBe(80);
  });

  test('POST /api/quiz/answer submits answer', async () => {
    // Note: Since options include the correct state name, we check that submitting
    // some answer gets a 200 response with correct, correctAnswer and stateInfo.
    const res = await request(app)
      .post('/api/quiz/answer')
      .send({ sessionId, answer: stateName }); // Can be correct or incorrect depending on which state was picked
    
    expect(res.statusCode).toBe(200);
    expect(res.body.correct).toBeDefined();
    expect(res.body.correctAnswer).toBeDefined();
    expect(res.body.stateInfo).toBeDefined();
    expect(res.body.stateInfo.capital).toBeDefined();
  });

  test('POST /api/scores with valid data saves score', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({
        playerName: 'John Doe',
        score: 500,
        gameMode: 'classic',
        timeTaken: 120
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.rank).toBeDefined();
  });

  test('POST /api/scores with invalid data returns 400 validation error', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({
        playerName: 'Invalid_Player!!', // violates alphanumeric + spaces
        score: 9999, // exceeds 1000
        gameMode: 'invalid-mode'
      });
    expect(res.statusCode).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('GET /api/leaderboard returns ordered high scores', async () => {
    const res = await request(app).get('/api/leaderboard?mode=classic&limit=5');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0].player_name).toBeDefined();
      expect(res.body[0].score).toBeDefined();
    }
  });

  describe('Authentication API Tests', () => {
    let authCookie;
    const testUsername = 'user_' + Date.now().toString().slice(-6);

    test('POST /api/auth/register registers new user and returns cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: testUsername, password: 'password123' });
      expect(res.statusCode).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe(testUsername);
      
      const cookie = res.headers['set-cookie'];
      expect(cookie).toBeDefined();
      authCookie = cookie[0];
    });

    test('POST /api/auth/register with duplicate username returns 409', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: testUsername, password: 'password123' });
      expect(res.statusCode).toBe(409);
    });

    test('POST /api/auth/login with correct credentials returns 200', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: testUsername, password: 'password123' });
      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe(testUsername);
    });

    test('POST /api/auth/login with wrong password returns 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: testUsername, password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
    });

    test('GET /api/auth/me returns user details when cookie is set', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie);
      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe(testUsername);
    });

    test('POST /api/auth/logout clears session', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(200);
      const cookie = res.headers['set-cookie'];
      expect(cookie[0]).toContain('Max-Age=0');
    });

    test('GET /api/auth/me returns null after logout', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeNull();
    });
  });
});
