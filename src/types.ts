import { components, operations } from '@lichess-org/types';

export type AccessTokenResponse = operations['apiToken']['responses']['200']['content']['application/json'];
export type LichessUser = operations['accountMe']['responses']['200']['content']['application/json'];
export type LichessRound = operations['broadcastRoundGet']['responses']['200']['content']['application/json'];

export type LichessBroadcastWithRounds = components['schemas']['BroadcastWithRounds'];
export type LichessBroadcastByUser = components['schemas']['BroadcastByUser'];
export type BroadcastRoundInfo = components['schemas']['BroadcastRoundInfo'];
export type BroadcastPgnPushTags = components['schemas']['BroadcastPgnPushTags'];
export type BroadcastRoundGame = components['schemas']['BroadcastRoundGame'];

export interface PgnPushResult {
  response: components['schemas']['BroadcastPgnPush'];
  files: string[];
}
