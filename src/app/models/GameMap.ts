import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GameObject from './GameObject';
import GameObstacle from './GameObstacle';

export type GameMap = {
    gameObstacles: GameObstacle[];
    gameEntities: GameObject[];
    
    backgroundObjectPath: string;
    backgroundObject?: THREE.Object3D;

    bannerImageFileName?: string;

    firstCorner: THREE.Vector3;
    secondCorner: THREE.Vector3;
    xBlockAmount: number;
    zBlockAmount: number;
}
