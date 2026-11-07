const path = require('path');
const fs = require('fs');
const { readWorkoutData, workoutCalculator } = require('./workoutReader');

const TEST_CSV_FILE = path.join(__dirname, 'test-workouts.csv');
const BAD_CSV_FILE = path.join(__dirname, 'test-workouts-bad.csv');
const EMPTY_CSV_FILE = path.join(__dirname, 'test-workouts-empty.csv');

const testCsvData = `date,type,minutes
2026-01-01,Running,30
2026-01-02,Yoga,20
2026-01-03,Cycling,45`;

const badCsvData = `date,type,minutes
2026-01-01,Running,abc`;

const emptyCsvData = `date,type,minutes`;

beforeAll(async () => {
  fs.writeFileSync(TEST_CSV_FILE, testCsvData);
  fs.writeFileSync(BAD_CSV_FILE, badCsvData);
  fs.writeFileSync(EMPTY_CSV_FILE, emptyCsvData);
});

afterAll(async () => {
  try {
    fs.unlinkSync(TEST_CSV_FILE);
    fs.unlinkSync(BAD_CSV_FILE);
    fs.unlinkSync(EMPTY_CSV_FILE);
  } catch {
    // It's okay if files don't exist
  }
});

describe('readWorkoutData', () => {
  test('returns an array of row objects', async () => {
    const data = await readWorkoutData(TEST_CSV_FILE);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(3);
    expect(data[0]).toHaveProperty('date');
    expect(data[0]).toHaveProperty('type');
    expect(data[0]).toHaveProperty('minutes');
  });

  test('rejects when the file is missing', async () => {
    await expect(readWorkoutData('missing.csv')).rejects.toThrow();
  });
});

describe('workoutCalculator', () => {
  test('counts workouts and totals minutes for a valid file', async () => {
    const result = await workoutCalculator(TEST_CSV_FILE);
    expect(result).not.toBeNull();
    expect(result.totalWorkouts).toBe(3);
    expect(result.totalMinutes).toBe(95);
  });

  test('returns null when the file is missing', async () => {
    const result = await workoutCalculator('missing.csv');
    expect(result).toBeNull();
  });

  test('returns null when a minutes value is invalid', async () => {
    const result = await workoutCalculator(BAD_CSV_FILE);
    expect(result).toBeNull();
  });

  test('returns zero workouts and zero minutes for an empty file', async () => {
    const result = await workoutCalculator(EMPTY_CSV_FILE);
    expect(result).toEqual({ totalWorkouts: 0, totalMinutes: 0 });
  });
});