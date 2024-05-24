import * as THREE from 'three';
import GameObject from './GameObject';
import { obstacles } from '../Game';

export enum GameObstacleType {
    // Normal obstacles
    WOODEN_BOX,
    WOODEN_BARREL,

    // Bushes
    BUSH,

    // Breakable obstacles
    POWER_CUBE_BOX,
    SKULLS,

    // Special obstacles
    UNBREAKABLE_WALL,
    GEM_SPAWNER,
}

export enum GameObstacleBiome {
    GREEN,
    YELLOW,
    CYAN,
    WHITE,
    PURPLE,
}

export type GameObstacleProperties = {
    obstacleType: GameObstacleType;
    
    collision: boolean;
    unbreakable: boolean; // Whether the obstacle can be destroyed or not by breakable attacks
    breakable: boolean; // Whether the obstacle can be destroyed or not by normal attacks

    health?: number;
    
    modelsProperties: { [biome in GameObstacleBiome]: { location: string, childIndex?: number } | undefined };
    models: { [biome in GameObstacleBiome]: THREE.Object3D | undefined };
}

export const obstacleModelScale = 35;

export default class GameObstacle extends GameObject {
    obstacleType: GameObstacleType;

    constructor(obstacleType: GameObstacleType) {
        super();
        this.obstacleType = obstacleType;
    }

    getObstacleProperties(): GameObstacleProperties {
        return obstacles[this.obstacleType];
    }
}
