"use client";

import { useEffect } from "react";
import Game, { maps } from "./Game";
import React from "react";
import { GameInfo, GameMode } from "./models/GameInfo";
import { GameMap } from "./models/GameMap";

export let game: Game;

export default function App() {
    const handleGameEnd = () => {

    }

    useEffect(() => {
        const gameInfo: GameInfo = {
            gameMode: GameMode.SHOWDOWN,
            map: maps[0],
            brawlers: [],
            duration: 120,
            respawnDuration: 5,
        }

        game = new Game(handleGameEnd);
        game.loadGame(gameInfo)
        game.start()
    }, [])
    
    return (
        <div>
            <canvas id="canvas"></canvas>
        </div>
    );
}
