export interface LichessBroadcast {
  tour: Tournament;
  round: Round;
  study: Study;
}

interface Tournament {
  id: string;
  name: string;
  slug: string;
  description: string;
  official?: boolean;
}

interface Round {
  id: string;
  name: string;
  slug: string;
  url: string;
  delay?: number;
  finished?: boolean;
  ongoing?: boolean;
  startsAt?: number;
}

interface Study {
  writeable: boolean;
}

export interface FolderContentsChangedEvent {
  kind: string;
  paths: string[];
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
  id: string;
  name: string;
  slug: string;
  startsAt: number;
  url: string;
  games: Game[];
}

interface Game {
  id: string;
  name: string;
  ongoing?: boolean;
  res?: string;
  url: string;
}
