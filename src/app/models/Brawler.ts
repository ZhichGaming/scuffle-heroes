import { CSS2DObject } from "three/examples/jsm/Addons.js";
import GameObject from "./GameObject";
import * as THREE from "three";

export enum BrawlerType {
    PIPER
}

export enum BrawlerSpeed {
    IMMOBILE,
    VERY_SLOW,
    SLOW,
    NORMAL,
    FAST,
    VERY_FAST,
}

export enum BrawlerEffect {
    NONE,
    POISON,
    BURN,
    SLOW,
    STUN,
}

export enum BrawlerAttackShape {
    RECTANGLE,
}

export enum BrawlerAttackType {
    NORMAL,
    THROW,
}

export enum BrawlerModelAnimation {
    IDLE = "idle",
    WALK = "walk",
    ATTACK = "attack",
    WIN = "win",
    LOSE = "lose",
}

export type BrawlerProperties = {
    brawlerType: BrawlerType;

    name: string;
    maxHealth: number;
    speed: BrawlerSpeed;
    id: string;

    attackName: string;
    attackProjectileCount: number;
    attackProjectile: BrawlerProjectileProperties;
    reloadSpeed: number;

    superName: string;
    superProjectileCount: number;
    superProjectile: BrawlerProjectileProperties;

    // Path to the model file.
    // modelsProperties: { [key in BrawlerModelAnimation]: string | undefined };
    models: { [key in BrawlerModelAnimation]: THREE.Object3D | undefined };
    modelsAnimations: { [key in BrawlerModelAnimation]: THREE.AnimationClip | undefined };
}

export type BrawlerProjectileProperties = {
    getProjectileDamage: (object: BrawlerProjectile) => number;
    appliedEffects: BrawlerEffect[];
    appliedEffectDuration: number;

    speed: number;

    attackShape: BrawlerAttackShape;
    // If attackShape is RECTANGLE, this is the height of the rectangle. 
    // If attackShape is CIRCLE, this is the radius of the circle. 
    // If attackShape is FAN, this is the radius of the fan.
    attackRange: number; 
    
    // If attackShape is RECTANGLE, this is the width of the rectangle.
    // If attackShape is FAN, this is the arc length.
    attackWidth: number; 
    attackType: BrawlerAttackType;

    // As a decimal, how much the super charge meter increases per hit.
    superChargePerHit: number;
}

export default class Brawler extends GameObject {
    brawlerProperties: BrawlerProperties;
    
    team: number = 0;
    id = Math.random().toString(36).substring(7);
    state: BrawlerModelAnimation = BrawlerModelAnimation.IDLE;
    
    aiming: boolean = false;
    aimAttackMesh?: THREE.Mesh;
    aimingSuper: boolean = false;
    aimSuperMesh?: THREE.Mesh;

    projectiles: BrawlerProjectile[] = [];

    infoBarUI?: CSS2DObject;

    constructor(brawlerProperties: BrawlerProperties) {
        super();

        this.brawlerProperties = brawlerProperties;
        this.health = brawlerProperties.maxHealth;
    }

    shootProjectile(angle: number, superShot: boolean = false): BrawlerProjectile {
        const projectileProperties = superShot ? this.brawlerProperties.superProjectile : this.brawlerProperties.attackProjectile;

        const projectile = new BrawlerProjectile(projectileProperties);
        projectile.position.copy(this.position);
        projectile.position.y = 0.5;
        projectile.rotation.y = angle;
        projectile.startPosition = this.position.clone();
        projectile.parentBrawler = this;
        projectile.velocity = new THREE.Vector3(Math.sin(angle + Math.PI / 2), 0, Math.cos(angle + Math.PI / 2)).normalize().multiplyScalar(projectileProperties.speed);

        this.projectiles.push(projectile);

        return projectile;
    }
}

export class BrawlerProjectile extends GameObject {
    brawlerProjectileProperties: BrawlerProjectileProperties;

    parentBrawler?: Brawler;

    startPosition?: THREE.Vector3;

    constructor(brawlerProjectileProperties: BrawlerProjectileProperties) {
        super();

        this.brawlerProjectileProperties = brawlerProjectileProperties;

        this.model = new THREE.Mesh(new THREE.IcosahedronGeometry(brawlerProjectileProperties.attackWidth / 1.5, 0), new THREE.MeshStandardMaterial({ color: 0x7FC8FF }));
    }

    getDistanceTraveled(): number {
        if (!this.startPosition) {
            return 0;
        }

        return this.position.distanceTo(this.startPosition);
    }
}
