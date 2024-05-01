import GameObject from "./GameObject";

enum GameMode {
    SHOWDOWN = 'showdown',
    KNOCKOUT = 'knockout',
};

export type GameInfo = {
    gameMode: GameMode;
    map: string;
    brawlers: GameObject[];
    duration: number;
    respawnDuration: number;
    
};
