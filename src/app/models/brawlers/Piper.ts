import { BrawlerProperties, BrawlerAttackShape, BrawlerAttackType, BrawlerSpeed, BrawlerType, BrawlerModelAnimation } from "../Brawler";

// Wiki: https://brawlstars.fandom.com/wiki/Piper
export let piper: BrawlerProperties = {
    brawlerType: BrawlerType.PIPER,

    name: "Piper",
    maxHealth: 2300,
    speed: BrawlerSpeed.NORMAL,

    attackName: "Gunbrella",
    attackProjectileCount: 1,
    attackProjectile: {
        projectileDamage: 1700,
        appliedEffects: [],
        appliedEffectDuration: 0,
        attackShape: BrawlerAttackShape.RECTANGLE,
        attackRange: 10,
        attackWidth: 0.67,
        attackType: BrawlerAttackType.NORMAL,
        superChargePerHit: 0.41225,
    },
    reloadSpeed: 2.3,

    superName: "Poppin'",
    superProjectileCount: 4,
    superProjectile: {
        projectileDamage: 900,
        appliedEffects: [],
        appliedEffectDuration: 0,
        attackShape: BrawlerAttackShape.CIRCLE,
        attackRange: 10,
        attackWidth: 8.67,
        attackType: BrawlerAttackType.THROW,
        superChargePerHit: 0.2025,
    },
    modelsProperties: {
        [BrawlerModelAnimation.GEO]: "piper_lunar/geo.glb",
        [BrawlerModelAnimation.IDLE]: "piper_lunar/idle.glb",
        [BrawlerModelAnimation.WALK]: "piper_lunar/walk.glb",
        [BrawlerModelAnimation.ATTACK]: "piper_lunar/attack.glb",
        [BrawlerModelAnimation.WIN]: undefined,
        [BrawlerModelAnimation.LOSE]: undefined,
        [BrawlerModelAnimation.PUSHBACK]: "piper_lunar/pushback.glb",
    },
    models: {
        [BrawlerModelAnimation.GEO]: undefined,
        [BrawlerModelAnimation.IDLE]: undefined,
        [BrawlerModelAnimation.WALK]: undefined,
        [BrawlerModelAnimation.ATTACK]: undefined,
        [BrawlerModelAnimation.WIN]: undefined,
        [BrawlerModelAnimation.LOSE]: undefined,
        [BrawlerModelAnimation.PUSHBACK]: undefined,
    }
}
