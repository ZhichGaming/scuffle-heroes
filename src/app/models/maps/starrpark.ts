import { GameMap } from "../GameMap";
import * as THREE from "three";
import { bush } from "../obstacles/bush";
import { wBox } from "../obstacles/woodenBox";
import { wBar } from "../obstacles/woodenBarrel";
import { skul } from "../obstacles/skulls";
import { uWal } from "../obstacles/unbreakableWall";
import toObstacles from "@/app/utils/toObstacles";

const starrparkObstacles = [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, bush, bush, null],
    [wBox, wBox, wBox, null, null, null, null, null, null, null, null, null, null, null, bush, bush, null],
    [wBox, wBar, null, null, null, null, null, null, null, null, null, null, wBar, wBox, wBox, wBox, null],
    [null, null, null, null, null, skul, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, wBox, wBox, bush, bush, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, wBox, wBox, bush, bush, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, bush, bush, wBox, wBox, wBox, wBox],
    [null, null, null, bush, bush, bush, bush, bush, bush, null, null, bush, bush, wBox, wBox, wBox, wBox],
    [null, null, null, bush, bush, bush, bush, bush, bush, null, null, null, null, null, null, null, null],
    [null, null, null, bush, bush, uWal, uWal, uWal, bush, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, bush, uWal, uWal, uWal, bush, bush, null, null, null],
    [null, null, null, null, null, null, null, null, bush, bush, bush, bush, bush, bush, null, null, null], 
    [wBox, wBox, wBox, wBox, bush, bush, null, null, bush, bush, bush, bush, bush, bush, null, null, null], 
    [wBox, wBox, wBox, wBox, bush, bush, null, null, null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null, bush, bush, wBox, wBox, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null, bush, bush, wBox, wBox, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null, null, null, skul, null, null, null, null, null], 
    [null, wBox, wBox, wBox, wBar, null, null, null, null, null, null, null, null, null, null, wBar, wBox], 
    [null, bush, bush, null, null, null, null, null, null, null, null, null, null, null, wBox, wBox, wBox], 
    [null, bush, bush, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],

];

export const starrpark: GameMap = {
    gameObstacles: toObstacles(starrparkObstacles, new THREE.Vector3(0, 0, 0), new THREE.Vector3(17, 0, 33)),
    gameEntities: [],
    
    backgroundObjectPath: "maps/environment-training-cave/scene.gltf",
    backgroundObject: null,

    bannerImageFileName: "banner_map_8b.png",

    firstCorner: new THREE.Vector3(0, 0, 0),
    secondCorner: new THREE.Vector3(17, 0, 33),
    xBlockAmount: 17,
    zBlockAmount: 33,
}
