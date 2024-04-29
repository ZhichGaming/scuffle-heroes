import * as THREE from 'three';

export default class GameObject {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    rotation: THREE.Quaternion;
    health: number;

    constructor() {
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.rotation = new THREE.Quaternion();
        this.health = -1;
    }
}
