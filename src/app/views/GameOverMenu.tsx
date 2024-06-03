import Brawler, { BrawlerModelAnimation } from "../models/Brawler";
import MenuBrawler from "./MenuBrawler";

export default function GameOverMenu({ handlePressMainMenu, brawler }: { handlePressMainMenu: () => void, brawler: Brawler | undefined }) {
    return (
        <div id="gameover-menu" className='h-full w-full bg-cover flex flex-col'>
            <div className='flex justify-center items-center space-x-6 mt-10'>
                <p id="gameover-menu-title" className='text-5xl text-white font-outline-1'></p>
            </div>
            <div className='flex justify-center items-center space-x-6 flex-grow'>
                <MenuBrawler animation={BrawlerModelAnimation.WIN}/>
            </div>
            <div className='flex justify-end items-center space-x-2 mb-10 mx-10'>
                <button className='w-40 h-8 rounded-md font-bold text-white text-md border-black border shadow-md bg-blue-700' onClick={handlePressMainMenu}>
                    <span className='font-outline-0-5'>MENU</span>
                </button>
            </div>
        </div>
    );
}
