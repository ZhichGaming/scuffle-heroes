"use client";

import { useEffect, useState } from "react";
import Game, { maps } from "../Game";
import React from "react";
import { GameInfo, GameMode } from "../models/GameInfo";
import { GameMap } from "../models/GameMap";
import Brawler, { BrawlerType } from "../models/Brawler";
import MainMenu from "./MainMenu";
import "../styles/transition.css";
import nipplejs, { JoystickManager, JoystickManagerOptions } from 'nipplejs';
import InfoBar from "./InfoBar";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, onDisconnect, ref, set, update, push, onValue, DataSnapshot, DatabaseReference, remove } from "firebase/database";
import Player, { PlayerState } from "../models/Player";
import getMiddlePoint from "../utils/getMiddlePoint";
import GameOverMenu from "./GameOverMenu";

export let game: Game;
export let movementJoystickManager: JoystickManager;
export let aimJoystickManager: JoystickManager;

export let playerRef: DatabaseReference | undefined = undefined;
export let playersRef: DatabaseReference | undefined = undefined;
export let gameRef: DatabaseReference | undefined = undefined;
export let gamesRef: DatabaseReference | undefined = undefined;

let gameInfo: GameInfo | undefined;

export default function App() {
    const [gameMode, setGameMode] = useState<GameMode>();
    const [gameMap, setGameMap] = useState<GameMap>();
    const [brawlers, setBrawlers] = useState<Brawler[]>([]);
    const [playerBrawler, setPlayerBrawler] = useState<Brawler>(new Brawler(BrawlerType.PIPER));

    let won = false;

    const [player, setPlayer] = useState<Player>(new Player('Player', 0, 0));

    const handlePressStart = () => {
        const newPlayerState = player?.playerState === PlayerState.MATCHMAKING ? PlayerState.MENU : PlayerState.MATCHMAKING;

        if (player?.playerState === PlayerState.MATCHMAKING) {
            setPlayer({ ...player, playerState: PlayerState.MENU });
        } else if (player?.playerState === PlayerState.MENU) {
            setPlayer({ ...player, playerState: PlayerState.MATCHMAKING });
        }

        if (playerRef) {
            update(playerRef, { playerState: newPlayerState });
        }

        if (playersRef) {
            onValue(playersRef, (snapshot) => {
                if (checkRequiredPlayers(snapshot)) {
                    const players = snapshot.val();
                    const playersArray = Object.values(players) as Player[];
                    const opponent = playersArray.find((player: Player) => player.playerState === PlayerState.MATCHMAKING && player.id !== playerBrawler.id);

                    if (opponent?.id) {
                        console.log('Match found');
                        handleCreateGame(opponent.id);
                        handleGameFound();
                    } else {
                        console.error('Failed to find opponent');
                    }
                } else {
                    console.log('Not enough players. Waiting for more players to join.');

                    if (gamesRef) {
                        const unsubscribe = onValue(gamesRef, (snapshot) => {
                            const games = snapshot.val();

                            if (!games) {
                                return;
                            }

                            const gamesArray = Object.values(games) as GameInfo[];

                            for (const game of gamesArray) {
                                if (game.brawlers) {
                                    game.brawlers = Array.from(Object.values(game.brawlers))
                                }
                            }

                            const gameFound = gamesArray.find((game: GameInfo) => game.brawlers?.find((brawler) => brawler.id === player.id));

                            if (!gameFound?.brawlers) {
                                return;
                            }

                            gameRef = ref(getDatabase(), 'games/' + gameFound?.id);

                            console.log('Game found', gameFound);

                            if (gameFound) {
                                gameInfo = gameFound;
                                gameInfo.brawlers = gameInfo.brawlers.map((brawler) => {
                                    const newBrawler = new Brawler(brawler.brawlerType);
                                    newBrawler.id = brawler.id;
                                    newBrawler.team = brawler.team;
                                    newBrawler.position.set(brawler.position.x, brawler.position.y, brawler.position.z);
                                    return newBrawler;
                                });
                                setBrawlers(gameInfo.brawlers);

                                const currentPlayer = player;
                                currentPlayer.playerState = PlayerState.IN_GAME;
                                currentPlayer.currentGameID = gameRef!.key!;

                                setPlayer(currentPlayer);

                                if (playerRef) {
                                    set(playerRef, currentPlayer);
                                } else {
                                    console.error('Failed to update player state');
                                }
                                
                                handleGameFound();
                                unsubscribe();
                            }
                        });
                    }
                }
            }, { onlyOnce: true });
        }
    }

    const checkRequiredPlayers = (snapshot: DataSnapshot) => {
        const players = snapshot.val();
        const playersArray = Object.values(players) as Player[];

        const matchmakingCount = playersArray.filter((player: Player) => player.playerState === PlayerState.MATCHMAKING);
        if (matchmakingCount.length >= 2) {
            return true;
        }

        return false;
    }

    const handleCreateGame = (enemyID: string) => {
        if (gamesRef) {
            gameRef = push(gamesRef);

            if (gameRef.key === null) throw new Error('Failed to create game, key is null');

            gameInfo = {
                id: gameRef.key,
                gameMode: gameMode ?? GameMode.KNOCKOUT,
                map: gameMap ?? maps[1],
                brawlers: [],
                duration: 120,
                respawnDuration: 5,
            };

            playerBrawler.position.set(getMiddlePoint(gameInfo.map).x - 0.5, getMiddlePoint(gameInfo.map).y, 2);

            const enemyBrawler = new Brawler(BrawlerType.PIPER);
            enemyBrawler.id = enemyID;
            enemyBrawler.team = 1;
            enemyBrawler.position.set(getMiddlePoint(gameInfo.map).x, getMiddlePoint(gameInfo.map).y, gameInfo.map.secondCorner.z - 3);

            console.log('Game created', gameInfo);

            set(gameRef, gameInfo);

            const brawlersDict = {
                [playerBrawler.id!]: playerBrawler,
                [enemyID]: enemyBrawler,
            };

            gameInfo.brawlers = Object.values(brawlersDict);
            setBrawlers(gameInfo.brawlers);

            const brawlersRef = ref(getDatabase(), 'games/' + gameRef.key + '/brawlers');
            set(brawlersRef, brawlersDict);
        }

        const currentPlayer = player;
        currentPlayer.playerState = PlayerState.IN_GAME;
        currentPlayer.currentGameID = gameRef!.key!;

        setPlayer(currentPlayer);

        if (playerRef) {
            set(playerRef, currentPlayer);
        } else {
            console.error('Failed to update player state');
        }
    }

    const handleGameFound = () => {
        setTimeout(() => {
            if (!gameInfo) return;

            game.loadGame(gameInfo, player.id)
            game.start()
        }, 2000)

        setTimeout(() => {
            document.getElementById('game-container')?.classList.add('displayed');
            document.getElementById('game-container')?.classList.remove('undisplayed');
            document.getElementById('menu-container')?.classList.add('undisplayed');
            document.getElementById('menu-container')?.classList.remove('displayed');
            document.getElementById('gameover-container')?.classList.add('undisplayed');
            document.getElementById('gameover-container')?.classList.remove('displayed');
        }, 1500)

        const appContainer = document.getElementById('app-container');
        appContainer?.classList.add('animate_tv');

        setTimeout(() => {
            appContainer?.classList.remove('animate_tv');
        }, 3200);
    }

    const handleGameEnd = (win: boolean) => {
        game.stop();

        remove(gameRef!);

        document.getElementById('gameover-menu')!.style.backgroundImage = `url('/${win ? "win-bg" : "lose-bg"}.webp')`
        document.getElementById('gameover-menu-title')!.innerText = win ? 'VICTOIRE!' : 'DÉFAITE';

        setTimeout(() => {
            document.getElementById('game-container')?.classList.add('undisplayed');
            document.getElementById('game-container')?.classList.remove('displayed');
            document.getElementById('menu-container')?.classList.add('undisplayed');
            document.getElementById('menu-container')?.classList.remove('displayed');
            document.getElementById('gameover-container')?.classList.add('displayed');
            document.getElementById('gameover-container')?.classList.remove('undisplayed');
        }, 1500)

        const appContainer = document.getElementById('app-container');
        appContainer?.classList.add('animate_tv');

        setTimeout(() => {
            appContainer?.classList.remove('animate_tv');
        }, 3200);
    }

    const handlePressMainMenu = () => {
        if (playerRef) {
            remove(playerRef);
        }

        location.reload();
    }

    useEffect(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyDVAU4BflPNhAxYZsoj0dMbRax4gLWLX2w",
            authDomain: "scuffle-heroes.firebaseapp.com",
            databaseURL: "https://scuffle-heroes-default-rtdb.firebaseio.com",
            projectId: "scuffle-heroes",
            storageBucket: "scuffle-heroes.appspot.com",
            messagingSenderId: "639759947255",
            appId: "1:639759947255:web:cc8be5aefccb2fa12bcaf2",
            measurementId: "G-65715K4X75"
        };
        
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const database = getDatabase();

        const auth = getAuth();
        signInAnonymously(auth)
            .then(() => {
                console.log('Signed in anonymously');
            })
            .catch((error) => {
                console.error('Failed to sign in anonymously', error);
            });

        auth.onAuthStateChanged((user) => {
            if (user) {
                const player = new Player('Player', 0, 0, user.uid);
                setPlayer(player);

                const newPlayerBrawler = playerBrawler;
                newPlayerBrawler.id = user.uid;
                setPlayerBrawler(newPlayerBrawler);

                playerRef = ref(database, 'players/' + user.uid);
                playersRef = ref(database, 'players');
                gamesRef = ref(database, 'games');

                set(playerRef, player);

                onDisconnect(playerRef).remove();
            } else {
                console.log('User is signed out');
            }
        });

        setGameMode(GameMode.KNOCKOUT);
        setGameMap(maps[1]);
        
        const movementJoystickOptions: JoystickManagerOptions = {
            zone: document.getElementById('movement-joystick') as HTMLElement,
            mode: 'semi',
            color: '#7CB9E8',
        };
        const aimJoystickOptions: JoystickManagerOptions = {
            zone: document.getElementById('aim-joystick') as HTMLElement,
            mode: 'semi',
            color: '#A52A2A',
        };
        import('nipplejs').then((nipplejs) => {
            movementJoystickManager = nipplejs.create(movementJoystickOptions);
            aimJoystickManager = nipplejs.create(aimJoystickOptions);

            game = new Game(handleGameEnd);
        });
    }, [])
    
    return (
        <div className="bg-black w-screen h-screen">
            <div id="app-container" className="w-full h-full">
                <div id="gameover-container" className="absolute undisplayed w-full h-full">
                    <GameOverMenu handlePressMainMenu={handlePressMainMenu} brawler={playerBrawler}/>
                </div>
                <div id="menu-container" className="absolute displayed w-full h-full">
                    <MainMenu gameMode={gameMode} gameMap={gameMap} handlePressStart={handlePressStart} player={player}/>
                </div>
                <div id="game-container" className="absolute undisplayed w-full h-full">
                    <canvas id="canvas" className="absolute"></canvas>
                    <div className="absolute flex w-full h-full">
                        <div id="movement-joystick" className="h-full flex-1"></div>
                        <div id="aim-joystick" className="h-full flex-1"></div>
                    </div>
                </div>
                <div id='infobars' className='hidden'>
                    {
                        brawlers.map((brawler) => (
                            <InfoBar brawler={brawler} playerBrawler={playerBrawler} key={brawler.id}/>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
