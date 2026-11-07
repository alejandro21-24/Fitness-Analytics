const path = require('path');
const fs = require('fs/promises');
const { readHealthData, healthMetricsCounter } = require('./healthReader');

const TEST_FILE = path.join(__dirname, 'test-health.json');
const BAD_FILE = path.join(__dirname, 'test-health-bad.json');

const testData = {
  user: 'TestUser',
  entries: [
    { date: '2026-01-01', sleep_hours: 7 },
    { date: '2026-01-02', sleep_hours: 8 },
    { date: '2026-01-03', sleep_hours: 6 }
  ]
};

beforeAll(async () => {
  await fs.writeFile(TEST_FILE, JSON.stringify(testData));
  await fs.writeFile(BAD_FILE, '{ this is not valid json');
});

afterAll(async () => {
  try {
    await fs.unlink(TEST_FILE);
    await fs.unlink(BAD_FILE);
  } catch {
    // It's okay if the files are already gone
  }
});

describe('readHealthData', () => {
  test('reads a valid JSON file', async () => {
    const data = await readHealthData(TEST_FILE);
    expect(data.user).toBe('TestUser');
    expect(data.entries).toHaveLength(3);
  });

  test('throws when the file is missing', async () => {
    await expect(readHealthData('missing.json')).rejects.toThrow();
  });
});

describe('healthMetricsCounter', () => {
  test('counts the health entries in a valid file', async () => {
    const result = await healthMetricsCounter(TEST_FILE);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('totalEntries');
    expect(result.totalEntries).toBe(3);
  });

  test('returns null when the file is missing', async () => {
    const result = await healthMetricsCounter('missing.json');
    expect(result).toBeNull();
  });

  test('returns null when the JSON is invalid', async () => {
    const result = await healthMetricsCounter(BAD_FILE);
    expect(result).toBeNull();
  });
});