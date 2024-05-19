import Brawler from "./Brawler";
import { GameMap } from "./GameMap";

export enum GameMode {
    SHOWDOWN = "Showdown",
    GEM_GRAB = "Gem Grab",
    BRAWL_BALL = "Brawl Ball",
    SIEGE = "Siege",
    BOUNTY = "Bounty",
    KNOCKOUT = "Knockout",
}

export const gameModeDescriptions = {
    [GameMode.SHOWDOWN]: "Survive in a shrinking map and be the last one standing!",
    [GameMode.GEM_GRAB]: "Collect gems and hold them for as long as possible!",
    [GameMode.BRAWL_BALL]: "Score goals with your team to win!",
    [GameMode.SIEGE]: "Collect bolts to spawn a robot and destroy the enemy's base!",
    [GameMode.BOUNTY]: "Defeat opponents to earn stars, but don't get defeated!",
    [GameMode.KNOCKOUT]: "Defeat the enemy team to win the round!",
}

export type GameInfo = {
    gameMode: GameMode;
    map: GameMap;
    playerID?: string;
    brawlers: Brawler[];
    duration: number;
    respawnDuration: number;
};
