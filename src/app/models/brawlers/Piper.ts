import { BrawlerProperties, BrawlerAttackShape, BrawlerAttackType, BrawlerSpeed, BrawlerType, BrawlerModelAnimation } from "../Brawler";

// Wiki: https://brawlstars.fandom.com/wiki/Piper
export let piper: BrawlerProperties = {
    brawlerType: BrawlerType.PIPER,

    name: "Piper",
    maxHealth: 2300,
    speed: BrawlerSpeed.NORMAL,
    id: "piper",

    attackName: "Gunbrella",
    attackProjectileCount: 1,
    attackProjectile: {
        getProjectileDamage: (object) => 420 + (object.getDistanceTraveled() * 1.4),
        appliedEffects: [],
        appliedEffectDuration: 0,
        attackShape: BrawlerAttackShape.RECTANGLE,
        attackRange: 10,
        attackWidth: 0.67,
        attackType: BrawlerAttackType.NORMAL,
        superChargePerHit: 0.41225,
        speed: 0.4,
    },
    reloadSpeed: 2.3,

    superName: "Poppin'",
    superProjectileCount: 4,
    superProjectile: {
        getProjectileDamage: () => 900,
        appliedEffects: [],
        appliedEffectDuration: 0,
        attackShape: BrawlerAttackShape.RECTANGLE,
        attackRange: 10,
        attackWidth: 8.67,
        attackType: BrawlerAttackType.THROW,
        superChargePerHit: 0.2025,
        speed: 1,
    },
    models: {
        [BrawlerModelAnimation.IDLE]: undefined,
        [BrawlerModelAnimation.WALK]: undefined,
        [BrawlerModelAnimation.ATTACK]: undefined,
        [BrawlerModelAnimation.WIN]: undefined,
        [BrawlerModelAnimation.LOSE]: undefined,
    },
    modelsAnimations: {
        [BrawlerModelAnimation.IDLE]: undefined,
        [BrawlerModelAnimation.WALK]: undefined,
        [BrawlerModelAnimation.ATTACK]: undefined,
        [BrawlerModelAnimation.WIN]: undefined,
        [BrawlerModelAnimation.LOSE]: undefined
    }
}
