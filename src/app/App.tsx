"use client";

import { useEffect, useState } from "react";
import Game, { maps } from "./Game";
import React from "react";
import { GameInfo, GameMode } from "./models/GameInfo";
import { GameMap } from "./models/GameMap";
import Brawler from "./models/Brawler";
import { piper } from "./models/brawlers/Piper";
import MainMenu from "./MainMenu";

export let game: Game;

export default function App() {
    const handlePressStart = () => {
        setTimeout(() => {
            if (!gameInfo) return;

            game.loadGame(gameInfo)
            game.start()
        }, 2000)
    }

    const handleGameEnd = () => {

    }

    const [gameInfo, setGameInfo] = useState<GameInfo>();

    useEffect(() => {
        const playerCharacter = new Brawler(piper);
        const gameInfo: GameInfo = {
            gameMode: GameMode.KNOCKOUT,
            map: maps[1],
            playerID: playerCharacter.id,
            brawlers: [playerCharacter],
            duration: 120,
            respawnDuration: 5,
        }

        setGameInfo(gameInfo);

        game = new Game(handleGameEnd);
    }, [])
    
    return (
        <div>
            <MainMenu gameInfo={gameInfo} handlePressStart={handlePressStart}/>
            <canvas id="canvas"></canvas>
        </div>
    );
}
