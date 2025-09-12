import { faker } from '@faker-js/faker';
import { Chess } from 'chess.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const action = process.argv[2] as 'games' | 'errors' | 'multigame';
const outputFolder = process.argv[3];

if (!action || !outputFolder) {
  throw new Error('Usage: pnpx tsx index.ts <games|errors> <output-folder>');
}

function writeToFile(filename: string, contents: string) {
  const filePath = join(outputFolder, filename);
  writeFileSync(filePath, contents);
  console.log(`Wrote ${filePath}`);
}

function newGame(): Chess {
  const eventName = `${faker.company.name()} Invitational`;
  const location = `${faker.location.city()} ${faker.location.country()}`;
  const date = faker.date.recent();
  const pgnDate = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

  const game = new Chess();

  game.setHeader('Event', eventName);
  game.setHeader('Site', location);
  game.setHeader('Date', pgnDate);
  game.setHeader('Round', faker.number.int(10).toString());
  game.setHeader('TimeControl', '15 min/game + 10 sec/move');
  game.setHeader('White', faker.person.fullName());
  game.setHeader('Black', faker.person.fullName());
  game.setHeader('WhiteElo', faker.number.int({ min: 1000, max: 2700 }).toString());
  game.setHeader('BlackElo', faker.number.int({ min: 1000, max: 2700 }).toString());
  for (const title of ['WhiteTitle', 'BlackTitle']) {
    faker.helpers.maybe(
      () => {
        game.setHeader(title, faker.helpers.arrayElement(['GM', 'IM', 'FM']));
      },
      {
        probability: 0.2,
      },
    );
  }
  game.setHeader('Result', '*');

  return game;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const result = (game: Chess) => {
  if (game.isCheckmate() && game.turn() === 'w') {
    return '0-1';
  } else if (game.isCheckmate() && game.turn() === 'b') {
    return '1-0';
  } else {
    return '1/2-1/2';
  }
};

if (action === 'games') {
  const games = new Map<number, Chess>();

  for (let i = 1; i <= 16; i++) {
    games.set(i, newGame());
  }

  await Promise.all(
    Array.from(games.keys()).map(async i => {
      const game = games.get(i) as Chess;

      while (!game.isGameOver() && (game.history().length <= 100 * 2 || faker.datatype.boolean(0.9))) {
        const moves = game.moves();
        if (moves.length === 0) break;

        const move = faker.helpers.arrayElement(moves);
        game.move(move);

        console.log(`Game ${i}: ${move}`);

        writeToFile(`game-${i}.pgn`, game.pgn());
        await sleep(faker.number.int({ min: 500, max: 2_000 }));
      }

      game.setHeader('Result', result(game));
      writeToFile(`game-${i}.pgn`, game.pgn());
    }),
  );
} else if (action === 'multigame') {
  // This will write both individual game files AND the combined games file (games.pgn)
  // The app should only send the games.pgn file and ignore the others
  const games = new Map<number, Chess>();

  for (let i = 1; i <= 2; i++) {
    const game = newGame();
    games.set(i, game);
    writeToFile(`game-${i}.pgn`, game.pgn());
  }

  writeToFile(
    'games.pgn',
    Array.from(games.values())
      .map(game => game.pgn())
      .join('\n\n'),
  );
} else if (action === 'errors') {
  // 3 types of errors: empty file, non-pgn string, illegal moves
  writeToFile('empty.pgn', '');
  await sleep(1200);
  writeToFile('not-pgn.pgn', 'This is not PGN');
  await sleep(1200);
  writeToFile('illegal-moves.pgn', newGame().pgn().replace(' *', '\n1. Kh3 *'));
} else {
  throw new Error('Action must be one of: games, errors, multigame');
}

console.log('Done');
