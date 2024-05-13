import { GameObstacleBiome, GameObstacleProperties, GameObstacleType } from "../GameObstacle";

export let wBox: GameObstacleProperties = {
    obstacleType: GameObstacleType.WOODEN_BOX,
    collision: true,
    unbreakable: false,
    breakable: false,
    modelsProperties: {
        [GameObstacleBiome.GREEN]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 16 },
        [GameObstacleBiome.YELLOW]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 15 },
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
