const {
  db,
  getRandomStates,
  getCluesForState,
  getAllStates,
  getStateById,
  saveScore,
  getLeaderboard,
  searchStates,
  countHigherScores
} = require('../database/db');

describe('Database Module Tests', () => {
  // Clear scores before tests
  beforeEach(() => {
    db.prepare('DELETE FROM scores').run();
  });

  afterAll(() => {
    db.close();
  });

  test('Database is initialized and schema exists', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = tables.map(t => t.name);
    expect(tableNames).toContain('states');
    expect(tableNames).toContain('clues');
    expect(tableNames).toContain('scores');
  });

  test('getAllStates returns empty initially or populated array', () => {
    const states = getAllStates();
    expect(Array.isArray(states)).toBe(true);
  });

  test('saveScore and getLeaderboard processes scores correctly', () => {
    const scoreId1 = saveScore('Alice', 100, 'classic', 45);
    const scoreId2 = saveScore('Bob', 250, 'classic', 30);
    const scoreId3 = saveScore('Charlie', 250, 'classic', 25); // higher rank due to less time
    const scoreId4 = saveScore('Dave', 80, 'rapid', 10);

    expect(Number(scoreId1)).toBeGreaterThan(0);

    const classicLeaderboard = getLeaderboard('classic');
    expect(classicLeaderboard.length).toBe(3);
    expect(classicLeaderboard[0].player_name).toBe('Charlie'); // 250 pts, 25s
    expect(classicLeaderboard[1].player_name).toBe('Bob');     // 250 pts, 30s
    expect(classicLeaderboard[2].player_name).toBe('Alice');   // 100 pts, 45s

    const rapidLeaderboard = getLeaderboard('rapid');
    expect(rapidLeaderboard.length).toBe(1);
    expect(rapidLeaderboard[0].player_name).toBe('Dave');
  });

  test('countHigherScores returns correct rank count', () => {
    saveScore('Alice', 100, 'classic', 45);
    saveScore('Bob', 200, 'classic', 30);
    saveScore('Charlie', 300, 'classic', 25);

    expect(countHigherScores('classic', 150)).toBe(2); // Bob and Charlie are higher
    expect(countHigherScores('classic', 50)).toBe(3);  // All are higher
    expect(countHigherScores('classic', 350)).toBe(0); // None are higher
  });
});
