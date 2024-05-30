import React from 'react';
import { GameInfo, GameMode, gameModeDescriptions } from './models/GameInfo';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import Player, { PlayerState } from './models/Player';
import { GameMap } from './models/GameMap';

export default function MainMenu({ gameMode, gameMap, handlePressStart, player }: { gameMode: GameMode | undefined, gameMap: GameMap | undefined, handlePressStart: () => void, player: Player | undefined }) {

    return (
        <div className='bg-[url("/Regular.webp")] h-full w-full bg-cover flex flex-col'>
            <div className='flex justify-center items-center space-x-6 mt-10'>
                <div className='bg-gray-700 w-1/2 h-10 rounded-md font-bold text-white text-3xl border-black border shadow-md flex justify-center items-center'>
                    <p className='text-sm'>0 Wins</p>
                </div>
            </div>
            <div className='flex justify-center items-center space-x-6 flex-grow'>
                <p>To be added.</p>
            </div>
            <div className='flex justify-center items-center space-x-6 mb-10'>
                <button className={`bg-gray-700 w-80 h-20 rounded-md text-white border-black border shadow-md bg-cover bg-center`} style={{ backgroundImage: `linear-gradient(rgba(55, 65, 81, 0.5), rgba(55, 65, 81, 0.9)), url("/banners/${gameMap?.bannerImageFileName || ''}")` }}>
                    <span className='text-lg font-bold'>{gameMode || <Skeleton width={100} containerClassName="flex-1"/>}</span>
                    {gameMode && <br/>}
                    <span className='text-sm text-gray-300'>{gameMode && gameModeDescriptions[gameMode] || <Skeleton width={300} containerClassName="flex-1"/>}</span>
                </button>
                <button className='w-64 h-20 rounded-md font-bold text-white text-3xl border-black border shadow-md' style={{ backgroundColor: player?.playerState === PlayerState.MATCHMAKING ? "rgb(239, 68, 68)" : "rgb(234, 179, 8)" }} onClick={handlePressStart}>
                    <span className='font-outline-1'>{ player?.playerState === PlayerState.MATCHMAKING ? "CANCEL" : "PLAY" }</span>
                </button>
            </div>
        </div>
    );
};
