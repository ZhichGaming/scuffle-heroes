import { GameObstacleBiome, GameObstacleProperties, GameObstacleType } from "../GameObstacle";

export let uWal: GameObstacleProperties = {
    obstacleType: GameObstacleType.SKULLS,
    collision: true,
    unbreakable: true,
    breakable: false,
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
