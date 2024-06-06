import { faker } from '@faker-js/faker';
import { paths } from '@lichess-org/types';

type NewBroadcast = paths['/broadcast/new']['post']['requestBody']['content']['application/x-www-form-urlencoded'];
type NewBroadcastRound =
  paths['/broadcast/{broadcastTournamentId}/new']['post']['requestBody']['content']['application/x-www-form-urlencoded'];

const lichess = 'http://localhost:8080';
const token = 'lip_admin';

for (let i = 1; i <= 100; i++) {
  const broadcast: NewBroadcast = {
    name: `${faker.company.name()} Invitational`,
    description: faker.lorem.sentence(),
    autoLeaderboard: faker.datatype.boolean(0.2),
    markdown: faker.lorem.text(),
  };

  if (faker.datatype.boolean(0.3)) {
    broadcast.tier = faker.number.int({ min: 3, max: 5 });
  }

  const response = await fetch(`${lichess}/broadcast/new`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(broadcast),
  });

  if (!response.ok) {
    console.error(response.statusText);
    process.exit(1);
  }

  const broadcastResult = await response.json();
  console.log(broadcastResult);

  for (let j = 1; j <= 5; j++) {
    const round: NewBroadcastRound = {
      name: `Round ${j}`,
      startsAt: faker.date.future().getTime(),
      finished: faker.datatype.boolean(0.2),
    };

    const response = await fetch(`${lichess}/broadcast/${broadcastResult.tour.id}/new`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(round),
    });

    if (!response.ok) {
      console.error(response.statusText);
      process.exit(1);
    }

    const roundResult = await response.json();
    console.log(roundResult);
  }
}
