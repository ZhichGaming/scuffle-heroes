import Brawler from "./Brawler";
import { GameMap } from "./GameMap";

export enum GameMode {
    SHOWDOWN = 'showdown',
    KNOCKOUT = 'knockout',
};

export type GameInfo = {
    gameMode: GameMode;
    map: GameMap;
    playerID?: string;
    brawlers: Brawler[];
    duration: number;
    respawnDuration: number;
};
