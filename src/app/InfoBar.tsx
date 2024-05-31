import { useEffect, useState } from "react";
import Brawler from "./models/Brawler";
import { brawlers } from "./Game";

export default function InfoBar( { brawler, playerBrawler }: { brawler: Brawler, playerBrawler: Brawler }) {
    const isPlayer = brawler.id === playerBrawler.id;
    const isAlly = brawler.team === playerBrawler.team;

    const color = isPlayer ? "#6FFF64" : isAlly ? "#10DFFE" : "#D12754";

    return (
        <div id={"infobar-" + brawler.id} className="flex flex-wrap flex-col justify-center content-center w-24">
            <p className="font-outline-1 text-center" style={{ color: color }}>{brawler?.getbrawlerProperties().name}</p>
            <div className="relative w-full h-6 bg-gray-800 text-white rounded-full border-black border-2 overflow-clip">
                <div className="healthbar h-full rounded-full" style={{ backgroundColor: color }}/>
                <h1 className="health absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-outline-1">{brawler?.health}</h1>
            </div>
        </div>
    );
}
