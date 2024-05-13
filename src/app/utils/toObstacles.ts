import { Vector3 } from "three";
import GameObstacle, { GameObstacleProperties } from "../models/GameObstacle";

export default function toObstacles(map: (GameObstacleProperties | null)[][], firstCorner: Vector3, secondCorner: Vector3): GameObstacle[] {
    let obstacles: GameObstacle[] = [];

    const mapWidth = secondCorner.x - firstCorner.x;
    const mapHeight = secondCorner.z - firstCorner.z;

    const obstacleWidth = mapWidth / map[0].length;
    const obstacleHeight = mapHeight / map.length;

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (map[i][j] !== null) {
                const obstacle = new GameObstacle(map[i][j]!.obstacleType);

                obstacle.position.x = j * obstacleWidth;
                obstacle.position.z = i * obstacleHeight;
                obstacle.width = obstacleWidth;
                obstacle.height = obstacleHeight;

                obstacles.push(obstacle);
            }
        }
    }

    return obstacles;
}
