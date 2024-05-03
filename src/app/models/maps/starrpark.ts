import { GameMap } from "../GameMap";
import * as THREE from "three";

export const starrpark: GameMap = {
    gameObstacles: [],
    gameEntities: [],
    
    backgroundObjectPath: "maps/environment-training-cave/scene.gltf",
    backgroundObject: undefined,

    firstCorner: new THREE.Vector3(0, 0, 0),
    secondCorner: new THREE.Vector3(17, 0, 33),
    xBlockAmount: 17,
    zBlockAmount: 33,
}
