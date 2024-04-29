"use client";

import { useEffect } from "react";
import Game from "./Game";

export let game: Game;

export default function App() {
    const handleGameEnd = () => {

    }

    useEffect(() => {
        game = new Game(handleGameEnd);
    }, [])
    
    return (
        <div>
            <canvas id="canvas"></canvas>
        </div>
    );
}
