import { components, operations } from '@lichess-org/types';

export type AccessTokenResponse = operations['apiToken']['responses']['200']['content']['application/json'];

export type LichessPaginatedBroadcasts =
  operations['broadcastsByUser']['responses']['200']['content']['application/json'];
export type LichessBroadcastByUser = components['schemas']['BroadcastByUser'];
export type LichessBroadcastWithRounds = components['schemas']['BroadcastWithRounds'];
export type BroadcastRoundInfo = components['schemas']['BroadcastRoundInfo'];
export type BroadcastPgnPushTags = components['schemas']['BroadcastPgnPushTags'];
export type BroadcastRound = components['schemas']['BroadcastRound'];

export type DeepLink = {
  scheme: string;
  path: string;
};
