import { useEffect, useState } from "react";
import Brawler from "./models/Brawler";
import { brawlers } from "./Game";

export default function InfoBar( { brawler }: { brawler: Brawler }) {
    return (
        <div id={"infobar-" + brawler.id} className="flex flex-wrap flex-col justify-center content-center w-24">
            <p className="text-lime-500 font-outline-1 text-center">{brawler?.brawlerProperties.name}</p>
            <div className="relative w-full h-6 bg-gray-800 text-white rounded-full border-black border-2 overflow-clip">
                <div className="h-full bg-lime-500 rounded-full"/>
                <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-outline-1">{brawler?.health}</h1>
            </div>
        </div>
    );
}
