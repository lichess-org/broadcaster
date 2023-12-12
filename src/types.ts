export interface Broadcast {
    tour: Tournament
    rounds: Round[]
}

export interface Tournament {
    id: string
    name: string
    slug: string
    url: string
    description: string
}

export interface Round {
    id: string
    name: string
    slug: string
    url: string
    description: string
}
