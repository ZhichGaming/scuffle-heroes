import { GameMap } from "../GameMap";
import * as THREE from "three";

export const minicity: GameMap = {
    gameObstacles: [],
    gameEntities: [],
    
    backgroundObjectPath: "maps/bgr_minicity/scene.gltf",
    backgroundObject: null,

    firstCorner: new THREE.Vector3(0, 0, 0),
    secondCorner: new THREE.Vector3(21, 0, 33),
    xBlockAmount: 17,
    zBlockAmount: 33,
}
