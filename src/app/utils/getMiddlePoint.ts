import { GameMap } from "../models/GameMap";

export default function getMiddlePoint(map: GameMap) {
    const averageX = (map.firstCorner.x + map.secondCorner.x) / 2;
    const averageZ = (map.firstCorner.z + map.secondCorner.z) / 2;
    
    return { x: averageX, z: averageZ };
}