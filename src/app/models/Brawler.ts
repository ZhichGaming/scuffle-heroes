import { CSS2DObject } from "three/examples/jsm/Addons.js";
import GameObject from "./GameObject";
import * as THREE from "three";
import { brawlers } from "../Game";
import { DatabaseReference, set, update } from "firebase/database";

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
    brawlerType: BrawlerType;
    
    team: number = 0;
    id?: string;
    state: BrawlerModelAnimation = BrawlerModelAnimation.IDLE;
    
    aiming: boolean = false;
    aimAttackMesh?: THREE.Mesh;
    aimingSuper: boolean = false;
    aimSuperMesh?: THREE.Mesh;

    projectiles: BrawlerProjectile[] = [];

    infoBarUI?: CSS2DObject;

    constructor(brawlerPropertiesID: BrawlerType) {
        super();

        this.brawlerType = brawlerPropertiesID;
        this.health = this.getbrawlerProperties().maxHealth;
    }

    getbrawlerProperties(): BrawlerProperties {
        return brawlers[this.brawlerType];
    }

    shootProjectile(angle: number, superShot: boolean = false): BrawlerProjectile {
        const projectileProperties = superShot ? this.getbrawlerProperties().superProjectile : this.getbrawlerProperties().attackProjectile;

        const projectile = new BrawlerProjectile(this.brawlerType, superShot);
        projectile.position.copy(this.position);
        projectile.position.y = 0.5;
        projectile.rotation.y = angle;
        projectile.startPosition = this.position.clone();
        projectile.parentBrawler = this;
        projectile.velocity = new THREE.Vector3(Math.sin(angle + Math.PI / 2), 0, Math.cos(angle + Math.PI / 2)).normalize().multiplyScalar(projectileProperties.speed);

        this.projectiles.push(projectile);

        return projectile;
    }

    setBrawlerHealth(health: number) {
        this.health = Math.max(health, 0);

        if (this.infoBarUI) {
            const healthElement = this.infoBarUI.element.getElementsByClassName("health")[0];
            healthElement.innerHTML = this.health.toFixed();
            
            const healthbarElement = this.infoBarUI.element.getElementsByClassName("healthbar")[0] as HTMLElement;
            healthbarElement.style.width = (this.health / this.getbrawlerProperties().maxHealth * 100).toString() + "%";
        }
    }

    sendBrawlerData(ref: DatabaseReference) {
        const uploadBrawler = { ...this };

        delete uploadBrawler.model;
        delete uploadBrawler.mixer;
        delete uploadBrawler.infoBarUI;
        delete uploadBrawler.aimAttackMesh;
        delete uploadBrawler.aimSuperMesh;

        uploadBrawler.projectiles = this.projectiles.map((p) => {
            const uploadProjectile = { ...p } as BrawlerProjectile;

            delete uploadProjectile.model;
            delete uploadProjectile.parentBrawler;

            return uploadProjectile;
        });

        update(ref, uploadBrawler);
    }
}

export class BrawlerProjectile extends GameObject {
    brawlerPropertiesType: BrawlerType;
    isSuper: boolean = false;

    id: string = Math.random().toString(36).substring(7);
    parentBrawler?: Brawler;

    startPosition?: THREE.Vector3;

    constructor(brawlerPropertiesType: BrawlerType, isSuper: boolean = false) {
        super();

        this.brawlerPropertiesType = brawlerPropertiesType;
        this.isSuper = isSuper;

        this.model = new THREE.Mesh(new THREE.IcosahedronGeometry(this.getBrawlerProjectileProperties().attackWidth / 1.5, 0), new THREE.MeshStandardMaterial({ color: 0x7FC8FF }));
    }

    getBrawlerProjectileProperties(): BrawlerProjectileProperties {
        return this.isSuper ? brawlers[this.brawlerPropertiesType].superProjectile : brawlers[this.brawlerPropertiesType].attackProjectile;
    }

    getDistanceTraveled(): number {
        if (!this.startPosition) {
            return 0;
        }

        return this.position.distanceTo(this.startPosition);
    }
}
