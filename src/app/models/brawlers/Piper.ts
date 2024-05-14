import { BrawlerProperties, BrawlerAttackShape, BrawlerAttackType, BrawlerSpeed, BrawlerType } from "../Brawler";

// Wiki: https://brawlstars.fandom.com/wiki/Piper
export const nita: BrawlerProperties = {
    brawlerType: BrawlerType.PIPER,

    name: "Piper",
    maxHealth: 2300,
    speed: BrawlerSpeed.NORMAL,

    attackName: "Gunbrella",
    attackProjectileCount: 1,
    attackProjectile: {
        projectileDamage: 960,
        appliedEffects: [],
        appliedEffectDuration: 0,
        attackShape: BrawlerAttackShape.RECTANGLE,
        attackRange: 10,
        attackWidth: 1.67,
        attackType: BrawlerAttackType.NORMAL,
        superChargePerHit: 0.209,
    },
    reloadSpeed: 1.1,

    superName: "Overpower",
    superProjectileCount: 1,
    superProjectile: {
        projectileDamage: 2000,
        appliedEffects: [],
        appliedEffectDuration: 0,
        attackShape: BrawlerAttackShape.CIRCLE,
        attackRange: 3.5,
        attackWidth: 0.5,
        attackType: BrawlerAttackType.THROW,
        superChargePerHit: 0.1,
    },
}
