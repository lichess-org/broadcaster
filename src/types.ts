import { components, operations } from './lichess';

export type LichessMyRound = operations['broadcastMyRoundsGet']['responses']['200']['content']['application/x-ndjson'];
export type AccessTokenResponse = operations['apiToken']['responses']['200']['content']['application/json'];
export type LichessUser = operations['accountMe']['responses']['200']['content']['application/json'];
export type LichessRound = operations['broadcastRoundGet']['responses']['200']['content']['application/json'];

export type BroadcastRoundInfo = components['schemas']['BroadcastRoundInfo'];
export type BroadcastPgnPushTags = components['schemas']['BroadcastPgnPushTags'];

type LichessPushResponse = components['schemas']['BroadcastPgnPush'];

export interface PgnPushResult {
  response: LichessPushResponse;
  files: string[];
}
