import React, { useEffect } from 'react';
import { GameInfo, GameMode, gameModeDescriptions } from '../models/GameInfo';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import Player from '../models/Player';
import { GameMap } from '../models/GameMap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export default function MainMenu({ gameMode, gameMap, handlePressStart, player }: { gameMode: GameMode | undefined, gameMap: GameMap | undefined, handlePressStart: () => void, player: Player | undefined }) {
    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );

        const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("menu-character") as HTMLCanvasElement, alpha: true, antialias: true });
        // renderer.setSize( window.innerWidth, window.innerHeight );

        // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // const cube = new THREE.Mesh( geometry, material );
        // scene.add( cube );
        const light = new THREE.AmbientLight();
        scene.add(light)

        const pointLight = new THREE.PointLight(0xffffff, 10);
        pointLight.position.set(0, 5, 5)
        scene.add(pointLight)

        const clock = new THREE.Clock()

        let mixer: THREE.AnimationMixer | undefined;

        new GLTFLoader().load("/brawlers/piper/piper_idle.gltf", (gltf) => {
            const mesh = gltf.scene.children[0] as THREE.Mesh;
            const scale = 0.5
            mesh.scale.set(scale, scale, scale)
            mesh.position.setY(-2.5)
            scene.add(mesh)

            mixer = new THREE.AnimationMixer(mesh);
            mixer.clipAction(gltf.animations[0]).play()
        });

        camera.position.z = 5;

        function animate() {
            requestAnimationFrame( animate );
            const delta = clock.getDelta()

            mixer?.update(delta)

            renderer.render( scene, camera );
        }

        animate();
    }, [])

    return (
        <div className='bg-[url("/Regular.webp")] h-full w-full bg-cover flex flex-col'>
            <div className='flex justify-center items-center space-x-6 mt-10'>
                <div className='bg-gray-700 w-1/2 h-10 rounded-md font-bold text-white text-3xl border-black border shadow-md flex justify-center items-center'>
                    <p className='text-sm'>0 Wins</p>
                </div>
            </div>
            <div className='flex justify-center items-center space-x-6 flex-grow'>
                <canvas id='menu-character' className='h-[30rem] w-[30rem] p-12'></canvas>
            </div>
            <div className='flex justify-center items-center space-x-6 mb-10'>
                <button className={`bg-gray-700 w-80 h-20 rounded-md text-white border-black border shadow-md bg-cover bg-center`} style={{ backgroundImage: `linear-gradient(rgba(55, 65, 81, 0.5), rgba(55, 65, 81, 0.9)), url("/banners/${gameMap?.bannerImageFileName || ''}")` }}>
                    <span className='text-lg font-bold'>{gameMode || <Skeleton width={100} containerClassName="flex-1"/>}</span>
                    {gameMode && <br/>}
                    <span className='text-sm text-gray-300'>{gameMode && gameModeDescriptions[gameMode] || <Skeleton width={300} containerClassName="flex-1"/>}</span>
                </button>
                <button className='bg-yellow-500 w-64 h-20 rounded-md font-bold text-white text-3xl border-black border shadow-md' onClick={handlePressStart}>
                    <span className='font-outline-1'>PLAY</span>
                </button>
            </div>
        </div>
    );
};
