import { GameMap } from "./GameMap";
import GameObject from "./GameObject";

export enum GameMode {
    SHOWDOWN = 'showdown',
    KNOCKOUT = 'knockout',
};

export type GameInfo = {
    gameMode: GameMode;
    map: GameMap;
    brawlers: GameObject[];
    duration: number;
    respawnDuration: number;
};
