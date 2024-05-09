import { GameObstacleBiome, GameObstacleProperties, GameObstacleType } from "../GameObstacle";

export let gemSpawner: GameObstacleProperties = {
    objectType: GameObstacleType.GEM_SPAWNER,
    collision: true,
    unbreakable: false,
    breakable: false,
    health: 6000,
    modelsProperties: {
        [GameObstacleBiome.GREEN]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 23 },
        [GameObstacleBiome.YELLOW]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 22 },
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
