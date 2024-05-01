"use client";

import { useEffect } from "react";
import Game from "./Game";

export let game: Game;

export default function App() {
    const handleGameEnd = () => {

    }

    useEffect(() => {
        game = new Game(handleGameEnd);
        game.start()
    }, [])
    
    return (
        <div>
            <canvas id="canvas"></canvas>
        </div>
    );
}
