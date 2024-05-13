import { GameObstacleBiome, GameObstacleProperties, GameObstacleType } from "../GameObstacle";

export let wBar: GameObstacleProperties = {
    obstacleType: GameObstacleType.WOODEN_BARREL,
    collision: true,
    unbreakable: false,
    breakable: false,
    modelsProperties: {
        [GameObstacleBiome.GREEN]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 21 },
        [GameObstacleBiome.YELLOW]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 21 },
        [GameObstacleBiome.CYAN]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 20 },
        [GameObstacleBiome.WHITE]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 20 },
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
