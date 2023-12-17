import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import { Chess } from "chess.js";

const outputFolder = process.argv[2];
if (!outputFolder) {
  console.log("Usage: pnpm esrun index.ts <output-folder>");
  process.exit(1);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const country = faker.location.country();
const eventName = `${faker.company.name()} Invitational`;
const location = `${faker.location.city()} ${country}`;

const date = faker.date.recent();
const pgnDate = `${date.getFullYear()}.${
  date.getMonth() + 1
}.${date.getDate()}`;

const games = new Map<number, Chess>();

for (let i = 1; i <= 6; i++) {
  const game = new Chess();

  game.header("Event", eventName);
  game.header("Site", location);
  game.header("Date", pgnDate);
  game.header("Round", faker.number.int(10).toString());
  game.header("TimeControl", "15 min/game + 10 sec/move");
  game.header("White", faker.person.fullName());
  game.header("Black", faker.person.fullName());
  game.header(
    "WhiteElo",
    faker.number.int({ min: 1000, max: 2700 }).toString(),
  );
  game.header(
    "BlackElo",
    faker.number.int({ min: 1000, max: 2700 }).toString(),
  );
  game.header("Result", "*");

  for (const title of ["WhiteTitle", "BlackTitle"]) {
    faker.helpers.maybe(
      () => {
        game.header(title, faker.helpers.arrayElement(["GM", "IM", "FM"]));
      },
      {
        probability: 0.2,
      },
    );
  }

  games.set(i, game);
}

while (games.size > 0) {
  const i = faker.helpers.arrayElement(Array.from(games.keys()));
  const game = games.get(i) as Chess;

  const moves = game.moves();
  const move = faker.helpers.arrayElement(moves);
  game.move(move);

  writeToFile(i, game.pgn());
  await sleep(faker.number.int({ min: 100, max: 3000 }));

  if (game.isGameOver()) {
    const result = game.isDraw()
      ? "1/2-1/2"
      : game.turn() === "w"
        ? "1-0"
        : "0-1";
    game.header("Result", result);
    writeToFile(i, game.pgn());

    games.delete(i);
  }
}

function writeToFile(filename: number, pgn: string) {
  const filePath = path.join(outputFolder, `game-${filename}.pgn`);
  fs.writeFile(filePath, pgn, () => {
    console.log(`Wrote ${filePath}`);
  });
}
