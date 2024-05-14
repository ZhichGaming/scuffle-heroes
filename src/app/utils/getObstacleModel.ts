import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

let obstaclesModel: THREE.Object3D | null = null;

export async function getObstacleModel(itemIndex: number): Promise<THREE.Object3D> {
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

        if (i !== itemIndex)
            child.removeFromParent();
    }

    return model;
}
