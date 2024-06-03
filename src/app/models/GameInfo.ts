import Brawler from "./Brawler";
import { GameMap } from "./GameMap";

export enum GameMode {
    SHOWDOWN = "Affrontement",
    GEM_GRAB = "Attrape-gemmes",
    BRAWL_BALL = "Balle éclate",
    SIEGE = "Siège",
    BOUNTY = "Prime",
    KNOCKOUT = "K.O.",
}

export const gameModeDescriptions = {
    [GameMode.SHOWDOWN]: "Survivez sur une carte qui rétrécit et soyez le dernier debout!",
    [GameMode.GEM_GRAB]: "Collectez des gemmes et gardez-les aussi longtemps que possible!",
    [GameMode.BRAWL_BALL]: "Marquez des buts avec votre équipe pour gagner!",
    [GameMode.SIEGE]: "Collectez des boulons pour faire apparaître un robot et détruire la base ennemie!",
    [GameMode.BOUNTY]: "Battez les adversaires pour gagner des étoiles, mais ne vous faites pas battre!",
    [GameMode.KNOCKOUT]: "Battez l'équipe ennemie pour gagner la manche!",
}

export type GameInfo = {
    id: string;
    gameMode: GameMode;
    map: GameMap;
    brawlers: Brawler[];
    duration: number;
    respawnDuration: number;
};
