import createClient from 'openapi-fetch';
import { faker } from '@faker-js/faker';
import type { components, paths } from '@lichess-org/types';

const lichess = 'http://localhost:8080';
const token = 'lip_admin';

const client = createClient<paths>({ baseUrl: lichess, headers: { Authorization: `Bearer ${token}` } });

const handleRequestError = (error: Response) => {
  console.error(`${error.status} ${error.statusText} at ${error.url}`);
  process.exit(1);
};

for (let i = 1; i <= 100; i++) {
  const name = [
    faker.helpers.arrayElement([faker.person.lastName(), faker.location.city(), faker.location.country()]),
    faker.helpers.arrayElement(['Cup', 'Championship', 'Open', 'Festival', 'Invitational', 'Classic', 'Rapid']),
  ].join(' ');

  const broadcast: components['schemas']['BroadcastForm'] = {
    name,
    showScores: faker.datatype.boolean(0.2),
    showRatingDiffs: faker.datatype.boolean(0.2),
    markdown: faker.lorem.text(),
    'info.fideTc': faker.helpers.arrayElement(['rapid', 'blitz', 'standard']),
    'info.timeZone': faker.helpers.arrayElement(['UTC', 'America/New_York', 'Europe/Paris']),
    'info.website': faker.internet.url(),
  };

  if (faker.datatype.boolean(0.3)) {
    broadcast.tier = faker.helpers.arrayElement([3, 4, 5, -1]);
  }

  const broadcastResponse = await client.POST('/broadcast/new', { body: broadcast });

  if (!broadcastResponse.response.ok) {
    handleRequestError(broadcastResponse.response);
  }

  console.log(broadcastResponse.data);

  for (let j = 1; j <= faker.number.int({ min: 0, max: 10 }); j++) {
    const round: components['schemas']['BroadcastRoundForm'] = {
      name: `Round ${j}`,
      startsAt: faker.date.future().getTime(),
      status: faker.helpers.arrayElement(['new', 'started', 'finished']),
      delay: 60 * faker.helpers.arrayElement([0, 1, 5, 10, 15]),
    };

    const roundResponse = await client.POST('/broadcast/{broadcastTournamentId}/new', {
      params: { path: { broadcastTournamentId: broadcastResponse.data!.tour.id } },
      body: round,
    });

    if (!roundResponse.response.ok) {
      handleRequestError(roundResponse.response);
    }

    console.log(roundResponse.data);
  }
}
