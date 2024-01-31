import { faker } from '@faker-js/faker';
import { Chess } from 'chess.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const action = process.argv[2] as 'games' | 'errors';
const outputFolder = process.argv[3];

if (!action || !outputFolder) {
  throw new Error('Usage: pnpm esrun index.ts <games|errors> <output-folder>');
}

function writeToFile(filename: string | number, contents: string) {
  const filePath = join(outputFolder, `game-${filename}.pgn`);
  writeFileSync(filePath, contents);
  console.log(`Wrote ${filePath}`);
}

function newGame(): Chess {
  const eventName = `${faker.company.name()} Invitational`;
  const location = `${faker.location.city()} ${faker.location.country()}`;
  const date = faker.date.recent();
  const pgnDate = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

  const game = new Chess();

  game.header('Event', eventName);
  game.header('Site', location);
  game.header('Date', pgnDate);
  game.header('Round', faker.number.int(10).toString());
  game.header('TimeControl', '15 min/game + 10 sec/move');
  game.header('White', faker.person.fullName());
  game.header('Black', faker.person.fullName());
  game.header('WhiteElo', faker.number.int({ min: 1000, max: 2700 }).toString());
  game.header('BlackElo', faker.number.int({ min: 1000, max: 2700 }).toString());
  for (const title of ['WhiteTitle', 'BlackTitle']) {
    faker.helpers.maybe(
      () => {
        game.header(title, faker.helpers.arrayElement(['GM', 'IM', 'FM']));
      },
      {
        probability: 0.2,
      },
    );
  }
  game.header('Result', '*');

  return game;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

        writeToFile(i, game.pgn());
        await sleep(faker.number.int({ min: 500, max: 2_000 }));
      }

      const result = game.isDraw() ? '1/2-1/2' : game.turn() === 'w' ? '0-1' : '1-0';
      game.header('Result', result);
      writeToFile(i, game.pgn());
    }),
  );
} else if (action === 'errors') {
  // 3 types of errors: empty file, non-pgn string, illegal moves
  writeToFile('empty', '');
  await sleep(1200);
  writeToFile('non-pgn', 'This is not PGN');
  await sleep(1200);
  writeToFile('illegal', newGame().pgn().replace(' *', '\n1. Kh3 *'));
} else {
  throw new Error('Action must be "games" or "errors"');
}

console.log('Done');
