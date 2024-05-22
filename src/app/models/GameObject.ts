import * as THREE from 'three';
import { BrawlerProperties } from './Brawler';

export default class GameObject {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    rotation: THREE.Quaternion;
    
    width?: number;
    height?: number;

    health: number;
    isEntity: boolean;

    model?: THREE.Object3D;

    constructor() {
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.rotation = new THREE.Quaternion();
        this.health = -1;
        this.isEntity = false;
    }

    update(delta: number) {
        this.position.add(this.velocity.clone().multiplyScalar(delta * 60));
        this.velocity.add(this.acceleration.clone().multiplyScalar(delta * 60));
    }
}
