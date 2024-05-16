"use client";

import { useEffect } from "react";
import Game, { maps } from "./Game";
import React from "react";
import { GameInfo, GameMode } from "./models/GameInfo";
import { GameMap } from "./models/GameMap";
import Brawler from "./models/Brawler";
import { piper } from "./models/brawlers/Piper";

export let game: Game;

export default function App() {
    const handleGameEnd = () => {

    }

    useEffect(() => {
        const playerCharacter = new Brawler(piper);
        const gameInfo: GameInfo = {
            gameMode: GameMode.SHOWDOWN,
            map: maps[1],
            playerID: playerCharacter.id,
            brawlers: [playerCharacter],
            duration: 120,
            respawnDuration: 5,
        }

        game = new Game(handleGameEnd);
        setTimeout(() => {
            game.loadGame(gameInfo)
            game.start()
        }, 2000)
    }, [])
    
    return (
        <div>
            <canvas id="canvas"></canvas>
        </div>
    );
}
