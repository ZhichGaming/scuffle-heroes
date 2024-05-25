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
    getProjectileDamage: () => number;
    appliedEffects: BrawlerEffect[];
    appliedEffectDuration: number;

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

    state: BrawlerModelAnimation = BrawlerModelAnimation.IDLE;
    
    aiming: boolean = false;
    aimAttackMesh?: THREE.Mesh;

    aimingSuper: boolean = false;
    aimSuperMesh?: THREE.Mesh;

    projectiles: BrawlerProjectile[] = [];

    id = Math.random().toString(36).substring(7);

    constructor(brawlerProperties: BrawlerProperties) {
        super();

        this.brawlerProperties = brawlerProperties;
    }
}

export class BrawlerProjectile extends GameObject {
    brawlerProjectileProperties: BrawlerProjectileProperties;

    parentBrawler?: Brawler;

    startPosition?: THREE.Vector3;

    constructor(brawlerProjectileProperties: BrawlerProjectileProperties) {
        super();

        this.brawlerProjectileProperties = brawlerProjectileProperties;
    }
}
