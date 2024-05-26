import React from 'react';
import { GameInfo, gameModeDescriptions } from './models/GameInfo';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

export default function MainMenu({ gameInfo, handlePressStart }: { gameInfo: GameInfo | undefined, handlePressStart: () => void }) {
    const onPressStart = () => {
        console.log('Pressed start');
        handlePressStart();

        setTimeout(() => {
            document.getElementById('game-container')?.classList.add('displayed');
            document.getElementById('game-container')?.classList.remove('undisplayed');
            document.getElementById('menu-container')?.classList.add('undisplayed');
            document.getElementById('menu-container')?.classList.remove('displayed');
        }, 1500)

        const appContainer = document.getElementById('app-container');
        appContainer?.classList.add('animate_tv');

        setTimeout(() => {
            appContainer?.classList.remove('animate_tv');
        }, 3200);
    }

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
                <button className={`bg-gray-700 w-80 h-20 rounded-md text-white border-black border shadow-md bg-cover bg-center`} style={{ backgroundImage: `linear-gradient(rgba(55, 65, 81, 0.5), rgba(55, 65, 81, 0.9)), url("/banners/${gameInfo?.map.bannerImageFileName || ''}")` }}>
                    <span className='text-lg font-bold'>{gameInfo?.gameMode || <Skeleton width={100} containerClassName="flex-1"/>}</span>
                    {gameInfo?.gameMode && <br/>}
                    <span className='text-sm text-gray-300'>{gameInfo?.gameMode && gameModeDescriptions[gameInfo.gameMode] || <Skeleton width={300} containerClassName="flex-1"/>}</span>
                </button>
                <button className='bg-yellow-500 w-64 h-20 rounded-md font-bold text-white text-3xl border-black border shadow-md' onClick={onPressStart}>
                    <span className='font-outline-1'>PLAY</span>
                </button>
            </div>
        </div>
    );
};
