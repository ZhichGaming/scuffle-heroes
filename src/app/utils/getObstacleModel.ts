// 1-5 are bushes, yellow, green, blue, purple, white
// 6: ball
// 7: bolt
// 8: gem
// 9: energy drink
// 10: power cube
// 11: unbreakable wall
// 12: beans looking pouch
// 13: gift
// 14: tnt
// 15: pink box
// 16: normal box
// 18: power cube box
// 21-22: skull
// 30: fish barrel
// 32: blue barrel?
// 37: red barrel
// 39-40: wooden barrel
// 42: gem spawner
// 46: city gem spawner

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

let obstaclesModel: THREE.Object3D | null = null;

export async function getObstacleModel(itemIndexes: number): Promise<THREE.Object3D> {
    if (obstaclesModel === null) {
        await new Promise<void>((resolve) => {
            new GLTFLoader().load('/items/source/brawl/Project Name.gltf', (gltf) => {
                obstaclesModel = gltf.scene;
                resolve();
            });
        });
    }

    if (obstaclesModel === null)
        throw new Error('Obstacles model not loaded');

    const model = obstaclesModel.clone();

    for (let i = model.children.length - 1; i >= 0; i--) {
        const child = model.children[i];

        if (i !== itemIndexes)
            child.removeFromParent();
    }

    return model;
}
