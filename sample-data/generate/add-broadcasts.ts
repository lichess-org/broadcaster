import { faker } from "@faker-js/faker";

interface NewBroadcast {
  name: string;
  description: string;
  autoLeaderboard: boolean;
  markdown?: string;
  tier?: number;
  players?: string;
}

interface NewBroadcastRound {
  name: string;
  syncUrl?: string;
  startsAt?: number;
}

for (let i = 1; i <= 10; i++) {
  const broadcast: NewBroadcast = {
    name: `${faker.company.name()} Invitational`,
    description: faker.lorem.sentence(),
    autoLeaderboard: faker.datatype.boolean(0.2),
    markdown: faker.lorem.text(),
    tier: faker.number.int({ min: 3, max: 5 }),
  };

  const response = await fetch("http://localhost:8080/broadcast/new", {
    method: "POST",
    headers: {
      Authorization: "Bearer lip_admin",
      "Content-Type": "application/json",
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
    };

    const response = await fetch(
      `http://localhost:8080/broadcast/${broadcastResult.tour.id}/new`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer lip_admin",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(round),
      },
    );

    if (!response.ok) {
      console.error(response.statusText);
      process.exit(1);
    }

    const roundResult = await response.json();
    console.log(roundResult);
  }
}
