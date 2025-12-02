import Database from 'better-sqlite3';
import { faker } from '@faker-js/faker';
import { homedir } from 'node:os';
import { join } from 'node:path';

const dbPath = join(homedir(), '.config/org.lichess.broadcaster/lichess-broadcaster.db');

console.log(`Connecting to database at: ${dbPath}`);

const db = new Database(dbPath);

function generateId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Message generators
function generateInfoMessage(): string {
  const templates = [
    () => `Uploaded ${faker.number.int({ min: 1, max: 50 })} games, ${faker.number.int({ min: 10, max: 500 })} moves`,
    () => 'Resetting round and re-uploading PGNs',
    () => `Starting folder watch for round ${generateId(8)}`,
    () => `PGN file modified: game-${faker.number.int({ min: 1, max: 16 })}.pgn`,
    () => 'Multi-game PGN detected, using games.pgn',
    () => `Connected to Lichess API`,
    () => `Round started`,
    () => `Watching folder: ${faker.system.directoryPath()}`,
    () => `Processing ${faker.number.int({ min: 1, max: 16 })} PGN files`,
    () => `Successfully synced game ${faker.number.int({ min: 1, max: 16 })}`,
  ];

  return faker.helpers.arrayElement(templates)();
}

function generateErrorMessage(): string {
  const statusCodes = [400, 401, 403, 404, 429, 500, 502, 503];
  const templates = [
    () =>
      `Failed to upload: ${faker.helpers.arrayElement(statusCodes)} ${faker.helpers.arrayElement(['Bad Request', 'Unauthorized', 'Forbidden', 'Not Found', 'Rate Limited', 'Internal Server Error', 'Bad Gateway', 'Service Unavailable'])}`,
    () => `Invalid PGN in game-${faker.number.int({ min: 1, max: 16 })}.pgn`,
    () =>
      `File system error: ${faker.helpers.arrayElement(['Permission denied', 'File not found', 'Directory not accessible'])}`,
    () => 'API rate limit exceeded',
    () => 'Connection timeout',
    () =>
      `Failed to parse PGN: ${faker.helpers.arrayElement(['Invalid move notation', 'Missing headers', 'Illegal position'])}`,
    () => `Upload failed: ${faker.helpers.arrayElement(['Network error', 'Timeout', 'Invalid response'])}`,
    () => `Round not found`,
    () => `Tournament not found`,
    () => `Authentication failed`,
  ];

  return faker.helpers.arrayElement(templates)();
}

// Prepare insert statement
const insert = db.prepare(`
  INSERT INTO logs (timestamp, type, message, broadcast_tournament_id, round_id, game_id)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// Type definition for log entry
type LogEntry = {
  timestamp: number;
  type: 'info' | 'error';
  message: string;
  broadcast_tournament_id: string | null;
  round_id: string | null;
  game_id: string | null;
};

// Generate and insert logs
console.log('Generating 5000 log entries...');

const logs: LogEntry[] = [];

// Generate 5000 logs with timestamps spread over the last 30 days
for (let i = 0; i < 5000; i++) {
  const isError = faker.datatype.boolean(0.2); // 20% errors, 80% info
  const timestamp = faker.date.recent({ days: 30 }).getTime();

  logs.push({
    timestamp,
    type: isError ? 'error' : 'info',
    message: isError ? generateErrorMessage() : generateInfoMessage(),
    broadcast_tournament_id: faker.datatype.boolean(0.3) ? generateId(8) : null,
    round_id: faker.datatype.boolean(0.4) ? generateId(8) : null,
    game_id: faker.datatype.boolean(0.2) ? `${faker.number.int({ min: 1, max: 16 })}` : null,
  });
}

// Sort by timestamp for chronological order
logs.sort((a, b) => a.timestamp - b.timestamp);

// Insert in a transaction for better performance
const insertMany = db.transaction((logsToInsert: LogEntry[]) => {
  for (let i = 0; i < logsToInsert.length; i++) {
    const log = logsToInsert[i];
    insert.run(log.timestamp, log.type, log.message, log.broadcast_tournament_id, log.round_id, log.game_id);

    if ((i + 1) % 1000 === 0) {
      console.log(`Inserted ${i + 1}/5000...`);
    }
  }
});

insertMany(logs);

console.log('Done! Inserted 5000 log entries');

db.close();
