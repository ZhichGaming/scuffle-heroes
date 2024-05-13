import { GameObstacleBiome, GameObstacleProperties, GameObstacleType } from "../GameObstacle";

export let skul: GameObstacleProperties = {
    obstacleType: GameObstacleType.SKULLS,
    collision: true,
    unbreakable: false,
    breakable: true,
    modelsProperties: {
        [GameObstacleBiome.GREEN]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 17 },
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
