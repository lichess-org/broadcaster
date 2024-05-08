export interface LichessBroadcast {
  tour: Tournament;
  round: Round;
  study: Study;
}

interface Tournament {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
  description: string;
  tier?: 'normal' | 'high' | 'best';
}

export interface Round {
  id: string;
  name: string;
  slug: string;
  url: string;
  createdAt: number;
  delay?: number;
  finished?: boolean;
  ongoing?: boolean;
  startsAt?: number;
}

interface Study {
  writeable: boolean;
}

export interface AccessTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

export interface LichessUser {
  username: string;
}

export interface RoundResponse {
  round: Round;
  tour: Tournament;
  study: Study;
  games: Game[];
}

interface Game {
  id: string;
  name: string;
  fen?: string;
  players?: Player[];
  lastMove?: string;
  thinkTime?: number;
  status?: '1-0' | '0-1' | '½-½' | '*';
}

interface Player {
  name: string;
  title?: string;
  rating?: number;
  clock?: number;
  fed?: string;
}

export type PgnTags = Record<string, string>;

interface LichessPushResponse {
  games: {
    moves?: number;
    error?: string;
    tags: PgnTags;
  }[];
}

export interface PgnPushResult {
  response: LichessPushResponse;
  files: string[];
}
