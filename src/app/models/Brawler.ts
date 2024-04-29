export enum BrawlerSpeed {
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

export type Brawler = {
    name: string;
    maxHealth: number;
    speed: BrawlerSpeed;

    attackName: string;
    attackProjectileCount: number;
    attackProjectile: BrawlerAttack;
    reloadSpeed: number;

    superName: string;
    superProjectileCount: number;
    superProjectile: BrawlerAttack;
}

export type BrawlerAttack = {
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
