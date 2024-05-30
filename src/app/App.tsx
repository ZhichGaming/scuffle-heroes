"use client";

import { useEffect, useState } from "react";
import Game, { maps } from "./Game";
import React from "react";
import { GameInfo, GameMode } from "./models/GameInfo";
import { GameMap } from "./models/GameMap";
import Brawler, { BrawlerType } from "./models/Brawler";
import MainMenu from "./MainMenu";
import "./transition.css";
import nipplejs, { JoystickManager, JoystickManagerOptions } from 'nipplejs';
import InfoBar from "./InfoBar";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, onDisconnect, ref, set, update, push, onValue, DataSnapshot, DatabaseReference } from "firebase/database";
import Player, { PlayerState } from "./models/Player";

export let game: Game;
export let joystickManager: JoystickManager;

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
                                    setBrawlers(game.brawlers);
                                }
                            }

                            const gameFound = gamesArray.find((game: GameInfo) => game.brawlers?.find((brawler) => brawler.id === player.id));

                            if (!gameFound?.brawlers) {
                                return;
                            }

                            gameRef = ref(getDatabase(), 'games/' + gameFound?.id);

                            if (gameFound) {
                                gameInfo = gameFound;
                                gameInfo.brawlers = gameInfo.brawlers.map((brawler) => {
                                    const newBrawler = new Brawler(brawler.brawlerType);
                                    newBrawler.id = brawler.id;
                                    newBrawler.team = brawler.team;
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

            const enemyBrawler = new Brawler(BrawlerType.PIPER);
            enemyBrawler.id = enemyID;
            enemyBrawler.team = 1;

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
        }, 1500)

        const appContainer = document.getElementById('app-container');
        appContainer?.classList.add('animate_tv');

        setTimeout(() => {
            appContainer?.classList.remove('animate_tv');
        }, 3200);
    }

    const handleGameEnd = () => {

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

        var joystickOptions: JoystickManagerOptions = {
            zone: document.getElementById('game-container') as HTMLElement,
            mode: 'semi',
        };
        import('nipplejs').then((nipplejs) => {
            joystickManager = nipplejs.create(joystickOptions);
        });

        setGameMode(GameMode.KNOCKOUT);
        setGameMap(maps[1]);

        game = new Game(handleGameEnd);
    }, [])
    
    return (
        <div className="bg-black w-screen h-screen">
            <div id="app-container" className="w-full h-full">
                <div id="menu-container" className="absolute displayed w-full h-full">
                    <MainMenu gameMode={gameMode} gameMap={gameMap} handlePressStart={handlePressStart} player={player}/>
                </div>
                <div id="game-container" className="absolute undisplayed w-full h-full">
                    <canvas id="canvas" className="absolute"></canvas>
                </div>
                <div id='infobars' className='hidden'>
                    {
                        brawlers.map((brawler) => (
                            <InfoBar brawler={brawler} isEnemy={brawler.team !== playerBrawler?.team} isPlayer={brawler.id === playerBrawler?.id} key={brawler.id}/>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
