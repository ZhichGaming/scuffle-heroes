import * as THREE from 'three';
import GameObject from './GameObject';

export enum GameObstacleType {
    // Normal obstacles
    WALL,
    CACTUS,
    WOODEN_BOX,
    WOODEN_BARREL,

    // Bushes
    BUSH,

    // Breakable obstacles
    POWER_CUBE_BOX,

    // Special obstacles
    WATER,
    UNBREAKABLE_WALL,
}

export default class GameObstacle extends GameObject {
    objectType: GameObstacleType;

    constructor(objectType: GameObstacleType) {
        super();
        this.objectType = objectType;
    }
}
