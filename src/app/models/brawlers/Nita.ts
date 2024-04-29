import { Brawler, BrawlerAttackShape, BrawlerAttackType, BrawlerSpeed } from "../Brawler";

// Wiki: https://brawlstars.fandom.com/wiki/Nita
export const nita: Brawler = {
    name: "Nita",
    maxHealth: 4000,
    speed: BrawlerSpeed.NORMAL,

    attackName: "Rupture",
    attackProjectileCount: 1,
    attackProjectile: {
        projectileDamage: 960,
        appliedEffects: [],
        appliedEffectDuration: 0,
        attackShape: BrawlerAttackShape.RECTANGLE,
        attackRange: 6,
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
