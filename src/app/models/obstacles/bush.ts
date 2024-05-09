import { GameObstacleBiome, GameObstacleProperties, GameObstacleType } from "../GameObstacle";

export let bush: GameObstacleProperties = {
    objectType: GameObstacleType.BUSH,
    collision: true,
    unbreakable: false,
    breakable: false,
    modelsProperties: {
        [GameObstacleBiome.GREEN]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 1 },
        [GameObstacleBiome.YELLOW]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 0 },
        [GameObstacleBiome.CYAN]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 2 },
        [GameObstacleBiome.WHITE]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 4 },
        [GameObstacleBiome.PURPLE]: { location: '/items/source/brawl/Project Name.gltf', childIndex: 3 }
    },
    models: {
        [GameObstacleBiome.GREEN]: undefined,
        [GameObstacleBiome.YELLOW]: undefined,
        [GameObstacleBiome.CYAN]: undefined,
        [GameObstacleBiome.WHITE]: undefined,
        [GameObstacleBiome.PURPLE]: undefined
    }
}
