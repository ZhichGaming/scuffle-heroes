"use client";

import { useEffect, useState } from "react";
import Game, { maps } from "./Game";
import React from "react";
import { GameInfo, GameMode } from "./models/GameInfo";
import { GameMap } from "./models/GameMap";
import Brawler from "./models/Brawler";
import { piper } from "./models/brawlers/Piper";
import MainMenu from "./MainMenu";
import "./transition.css";
import nipplejs, { JoystickManager, JoystickManagerOptions } from 'nipplejs';

export let game: Game;
export let joystickManager: JoystickManager;

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
        var joystickOptions: JoystickManagerOptions = {
            zone: document.getElementById('game-container') as HTMLElement,
            mode: 'semi',
        };
        joystickManager = nipplejs.create(joystickOptions);

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
        <div className="bg-black w-screen h-screen">
            <div id="app-container" className="w-full h-full">
                <div id="menu-container" className="absolute displayed w-full h-full">
                    <MainMenu gameInfo={gameInfo} handlePressStart={handlePressStart}/>
                </div>
                <div id="game-container" className="absolute undisplayed w-full h-full">
                    <canvas id="canvas" className="absolute"></canvas>
                </div>
            </div>
        </div>
    );
}
