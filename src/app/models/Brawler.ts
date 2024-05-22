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
    CIRCLE,
    FAN,
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
    attackProjectile: BrawlerAttackProperties;
    reloadSpeed: number;

    superName: string;
    superProjectileCount: number;
    superProjectile: BrawlerAttackProperties;

    // Path to the model file.
    // modelsProperties: { [key in BrawlerModelAnimation]: string | undefined };
    models: { [key in BrawlerModelAnimation]: THREE.Object3D | undefined };
}

export type BrawlerAttackProperties = {
    projectileDamage: number;
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
    
    aiming: boolean = false;
    aimAttackMesh?: THREE.Mesh;

    aimingSuper: boolean = false;
    aimSuperMesh?: THREE.Mesh;

    id = Math.random().toString(36).substring(7);

    constructor(brawlerProperties: BrawlerProperties) {
        super();

        this.brawlerProperties = brawlerProperties;
    }

    aimAttack(vector: THREE.Vector3, scene: THREE.Scene) {
        if (!this.aimAttackMesh) {
            // Draw a rectangle, circle, or fan from the brawler to the vector.
            switch (this.brawlerProperties.attackProjectile.attackShape) {
                case BrawlerAttackShape.RECTANGLE: {
                    const attackWidth = this.brawlerProperties.attackProjectile.attackWidth;
                    const attackHeight = this.brawlerProperties.attackProjectile.attackRange;
                    const attackCenter = vector.clone().sub(this.position);

                    const plane = new THREE.PlaneGeometry(attackWidth, attackHeight);
                    const material = new THREE.MeshBasicMaterial({ 
                        opacity: 0.25, 
                        transparent: true, 
                        side: THREE.DoubleSide, 
                        depthWrite: false,
                        color: 0xffffff
                    });
                    const mesh = new THREE.Mesh(plane, material);

                    mesh.position.copy(attackCenter);

                    this.aimAttackMesh = mesh;
                }
                case BrawlerAttackShape.CIRCLE: {
                    const attackRadius = this.brawlerProperties.attackProjectile.attackRange;
                    const attackCenter = vector.clone().sub(this.position);

                    const circle = new THREE.CircleGeometry(attackRadius, 32);
                    const material = new THREE.MeshBasicMaterial({ 
                        opacity: 0.25, 
                        transparent: true, 
                        side: THREE.DoubleSide, 
                        depthWrite: false,
                        color: 0xffffff
                    });
                    const mesh = new THREE.Mesh(circle, material);

                    mesh.position.copy(attackCenter);

                    this.aimAttackMesh = mesh;
                }
                case BrawlerAttackShape.FAN: {
                    const attackRadius = this.brawlerProperties.attackProjectile.attackRange;
                    const attackWidth = this.brawlerProperties.attackProjectile.attackWidth;
                    const attackCenter = vector.clone().sub(this.position);

                    const fan = new THREE.Shape();
                    fan.moveTo(0, 0);
                    fan.arc(0, 0, attackRadius, -attackWidth / 2, attackWidth / 2);

                    const geometry = new THREE.ShapeGeometry(fan);
                    const material = new THREE.MeshBasicMaterial({ 
                        opacity: 0.25, 
                        transparent: true, 
                        side: THREE.DoubleSide, 
                        depthWrite: false,
                        color: 0xffffff
                    });
                    const mesh = new THREE.Mesh(geometry, material);

                    mesh.position.copy(attackCenter);

                    this.aimAttackMesh = mesh;
                }
            }

            scene.add(this.aimAttackMesh);
        }

        this.aimAttackMesh.position.copy(vector.clone().sub(this.position));

        if (!this.aiming) {
            this.aimAttackMesh.visible = false;
        } else {
            this.aimAttackMesh.visible = true;
        }
    }
}
