import { GameObstacleBiome, GameObstacleProperties, GameObstacleType } from "../GameObstacle";

export let cBox: GameObstacleProperties = {
    obstacleType: GameObstacleType.POWER_CUBE_BOX,
    collision: true,
    unbreakable: false,
    breakable: false,
    health: 6000,
    modelsProperties: {
        [GameObstacleBiome.GREEN]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 16 },
        [GameObstacleBiome.YELLOW]: undefined,
        [GameObstacleBiome.CYAN]: undefined,
        [GameObstacleBiome.WHITE]: undefined,
        [GameObstacleBiome.PURPLE]: undefined
    },
    models: {
        [GameObstacleBiome.GREEN]: undefined,
        [GameObstacleBiome.YELLOW]: undefined,
        [GameObstacleBiome.CYAN]: undefined,
        [GameObstacleBiome.WHITE]: undefined,
        [GameObstacleBiome.PURPLE]: undefined
    }
}
