import Brawler from "./Brawler";

export enum PlayerState {
    MENU,
    MATCHMAKING,
    IN_GAME,
}

export default class Player {
    id?: string;
    name: string;
    wins: number;
    losses: number;

    playerState: PlayerState = PlayerState.MENU;
    currentGameID?: string;

    constructor(name: string, wins: number, losses: number, id?: string) {
        this.id = id;
        this.name = name;
        this.wins = wins;
        this.losses = losses;
    }
}