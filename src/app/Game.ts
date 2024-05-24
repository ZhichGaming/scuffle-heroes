import * as THREE from 'three';
import { EffectComposer, RenderPass, OutputPass, GLTFLoader, OrbitControls, UnrealBloomPass, ShaderPass, RoomEnvironment } from 'three/examples/jsm/Addons.js';
import { fragmentShader } from './shaders/FragmentShader';
import { vertexShader } from './shaders/VertexShader';
import { GameInfo } from './models/GameInfo';
import { minicity } from './models/maps/minicity';
import { GameMap } from './models/GameMap';
import Brawler, { BrawlerModelAnimation, BrawlerProperties, BrawlerType } from './models/Brawler';
import { starrpark } from './models/maps/starrpark';
import getMiddlePoint from './utils/getMiddlePoint';
import { GameObstacleBiome, GameObstacleProperties, GameObstacleType } from './models/GameObstacle';
import { bush } from './models/obstacles/bush';
import { wBox } from './models/obstacles/woodenBox';
import { wBar } from './models/obstacles/woodenBarrel';
import { cBox } from './models/obstacles/powerCubeBox';
import { skul } from './models/obstacles/skulls';
import { uWal } from './models/obstacles/unbreakableWall';
import { gemS } from './models/obstacles/gemSpawner';
import { piper } from './models/brawlers/Piper';
import getValues from './utils/getValues';
import { Controller } from './Controller';

export const brawlers: { [key in BrawlerType]: BrawlerProperties } = {
    [BrawlerType.PIPER]: piper
}

export const maps: GameMap[] = [
    minicity,
    starrpark
]

export const obstacles: { [key in GameObstacleType]: GameObstacleProperties } = {
    [GameObstacleType.WOODEN_BOX]: wBox,
    [GameObstacleType.WOODEN_BARREL]: wBar,
    [GameObstacleType.BUSH]: bush,
    [GameObstacleType.POWER_CUBE_BOX]: cBox,
    [GameObstacleType.SKULLS]: skul,
    [GameObstacleType.UNBREAKABLE_WALL]: uWal,
    [GameObstacleType.GEM_SPAWNER]: gemS
}

const BLOOM_SCENE = 1;

export default class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private finalComposer: EffectComposer
    private renderScene: RenderPass
    private outputPass: OutputPass
    private gltfLoader: GLTFLoader;
    private textureLoader: THREE.TextureLoader;
    private controls: OrbitControls;
    private clock: THREE.Clock;
    private frameCount = 0;

    private bloomPass: UnrealBloomPass;
    private bloomComposer: EffectComposer;
    private mixPass: any;
    private bloomLayer: THREE.Layers;
    private materials: any;
    private bloomParams: any;

    private directionalLight?: THREE.DirectionalLight;
    private obstaclesModel?: THREE.Object3D;

    stopped = false;
    private handleEnd: () => void;

    private controller: Controller;

    currentGame?: GameInfo;

    constructor(handleEnd: () => void) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.gltfLoader = new GLTFLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.clock = new THREE.Clock();
        this.materials = [];

        this.handleEnd = handleEnd;

        // const gui = new GUI();

        this.renderScene = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0, 0.85);

        this.bloomParams = {
            bloomStrength: this.bloomPass.strength,
            bloomThreshold: this.bloomPass.threshold,
            bloomRadius: this.bloomPass.radius,
        };

        this.bloomComposer = new EffectComposer( this.renderer );
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass(this.renderScene);
        this.bloomComposer.addPass(this.bloomPass);
                
        this.mixPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                defines: {}
            }), "baseTexture"
        );
        this.mixPass.needsSwap = true;

        this.outputPass = new OutputPass();

        this.finalComposer = new EffectComposer( this.renderer );

        this.finalComposer.addPass(this.renderScene);
        // this.finalComposer.addPass(this.glitchPass);
        this.finalComposer.addPass(this.mixPass);
        this.finalComposer.addPass(this.outputPass);

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = Math.pow(0.68, 5.0);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set(BLOOM_SCENE);

        const environment = new RoomEnvironment( this.renderer );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );

        this.scene.environment = pmremGenerator.fromScene( environment ).texture;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        this.loadSkybox();
        this.loadModels();

        this.controller = new Controller();

        // const gridHelper = new THREE.GridHelper(100, 100);
        // this.scene.add( gridHelper );

        this.camera.position.z = 5;

        // const path = "/brawlers/piper/piper_idle.gltf";
        // this.gltfLoader.load(path, (collada) => {
        //     const model = collada.scene;

        //     model.position.set(0, 0, 0);
        //     model.scale.set(0, 0, 0)

        //     this.scene.add(model);
        // });
        
        // setTimeout(() => {
        //     this.renderer.render(this.scene, this.camera);
        // }, 5000);

        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    public start() {
        this.animate();
    }

    public stop() {
        this.renderer.dispose();
        this.stopped = true;
    }

    public loadGame(game: GameInfo) {
        this.currentGame = game;

        this.gltfLoader.load(game.map.backgroundObjectPath, (gltf) => {
            gltf.scene.position.set(0, 0, 0);
            this.scene.add(gltf.scene);
        });

        this.camera.position.set(getMiddlePoint(game.map).x, 50, 40);
        this.camera.lookAt(getMiddlePoint(game.map).x, 0, 0);
        this.controls.target = new THREE.Vector3(getMiddlePoint(game.map).x, 0, 0);

        const wasExisting = this.directionalLight !== undefined;
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 20);
        this.directionalLight.position.set(getMiddlePoint(game.map).x, 5, 0);
        this.directionalLight.target.position.set(getMiddlePoint(game.map).x, 0, getMiddlePoint(game.map).z);

        if (!wasExisting) {
            this.scene.add(this.directionalLight);
        }

        // const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, emissiveIntensity: 1 }));
        // sphere1.position.set(game.map.firstCorner.x, game.map.firstCorner.y, game.map.firstCorner.z);
        // this.scene.add(sphere1);
        // const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, emissiveIntensity: 1 }));
        // sphere2.position.set(game.map.secondCorner.x, game.map.secondCorner.y, game.map.secondCorner.z);
        // this.scene.add(sphere2);
        // this.camera.lookAt(sphere2.position);
        // this.controls.target = sphere2.position;

        const obstaclesScene = new THREE.Scene();

        game.map.gameObstacles.forEach((obstacle) => {
            const model = getValues(obstacles).find((o) => o.obstacleType === obstacle.obstacleType)?.models[0]?.clone();

            if (model === undefined) throw new Error("Obstacle model is undefined");

            obstacle.model = model;
            // I'm not sure why I have to add 0.5 to the x and 1 to the z, but centers it
            model.position.set(obstacle.position.x + 0.5, 0, obstacle.position.z + 1);

            const boundingBox = new THREE.Box3().setFromObject(model)
            const size = boundingBox.getSize(new THREE.Vector3()); 
            const xScaleFactor = obstacle.width! / size.x;
            const zScaleFactor = obstacle.height! / size.z;
            model.scale.set(xScaleFactor, xScaleFactor, zScaleFactor);

            obstaclesScene.add(model);
        });

        // obstaclesScene.position.set(0.5, 0, 1);
        this.scene.add(obstaclesScene);

        for (const brawler of game.brawlers) {
            for (const key in BrawlerModelAnimation) {
                const model = brawlers[brawler.brawlerProperties.brawlerType].models[key.toLowerCase() as BrawlerModelAnimation];
                // const model = brawlers[brawler.brawlerProperties.brawlerType].models[BrawlerModelAnimation.IDLE]?.clone();

                if (model === undefined) {
                    console.error("Model is undefined");
                    continue;
                }

                model.position.set(brawler.position.x, 0, brawler.position.z);
                model.scale.set(0.15, 0.15, 0.15);
            }

            brawler.state = BrawlerModelAnimation.IDLE;
            this.setModel(brawler, BrawlerModelAnimation.IDLE);
        }
    }

    private loadModels() {
        this.gltfLoader.load("/items/source/brawl/Project Name.gltf", (gltf) => {
            this.obstaclesModel = gltf.scene;

            getValues(obstacles).forEach((obstacle) => {
                for (const key in obstacle.modelsProperties) {
                    const properties = obstacle.modelsProperties[parseInt(key) as GameObstacleBiome];

                    if (properties?.childIndex !== undefined) {
                        const newScene = new THREE.Scene();
                        const obstacleModel = this.obstaclesModel!.children[properties.childIndex].clone();

                        obstacleModel.position.set(0, 0, 0);
                        newScene.add(obstacleModel);

                        obstacle.models[parseInt(key) as GameObstacleBiome] = newScene;
                    }                    
                }
            });
        });

        for (const key in brawlers) {
            const brawler = brawlers[parseInt(key) as BrawlerType];

            for (const key in BrawlerModelAnimation) {
                const path = "/brawlers/" + brawler.id + "/" + brawler.id + "_" + key.toLowerCase() + ".gltf";

                this.gltfLoader.load(path, (gltf) => {
                    // TODO: Fix textures
                    const texture = this.textureLoader.load("/brawlers/" + brawler.id + "/" + brawler.id + "_tex.png");
                    // texture.flipY = false;
                    texture.colorSpace = THREE.SRGBColorSpace;

                    const mesh = gltf.scene.children[0] as THREE.Mesh;
                    mesh.material = new THREE.MeshBasicMaterial({ map: texture });
                    
                    brawler.models[key.toLowerCase() as BrawlerModelAnimation] = gltf.scene;
                    if (gltf.animations.length > 0)
                        brawler.modelsAnimations[key.toLowerCase() as BrawlerModelAnimation] = gltf.animations[0];
                });
                // const geo = new THREE.BoxGeometry(10, 10);
                // const material = new THREE.MeshBasicMaterial();
                // const mesh = new THREE.Mesh(geo, material)

                // brawler.models[key.toLowerCase() as BrawlerModelAnimation] = mesh;
            }
        }
    }

    private loadSkybox() {
        const sphereGeometry = new THREE.SphereGeometry( 500, 60, 40 );
        // invert the geometry on the x-axis so that all of the faces point inward
        sphereGeometry.scale( -1, 1, 1 );
        sphereGeometry.rotateY(-Math.PI / 2);

        // Skybox
        const sphereTexture = new THREE.TextureLoader().load('/Ggenebrush_HDRI1.png');
        sphereTexture.colorSpace = THREE.SRGBColorSpace;
        // sphereTexture.
        const sphereMaterial = new THREE.MeshStandardMaterial( { map: sphereTexture, envMapIntensity: 5 } );

        const mesh = new THREE.Mesh( sphereGeometry, sphereMaterial );

        this.scene.add( mesh );
    }

    private setModel(brawler: Brawler, animation: BrawlerModelAnimation) {
        const oldModel = brawler.model;
        if (oldModel) this.scene.remove(oldModel);

        brawler.model = brawlers[brawler.brawlerProperties.brawlerType].models[animation];
        brawler.model?.position.set(brawler.position.x, 0, brawler.position.z);
        brawler.model?.rotation.copy(oldModel?.rotation ?? new THREE.Euler(0, 0, 0));

        brawler.mixer = new THREE.AnimationMixer(brawler.model!);
        brawler.mixer.clipAction(brawler.brawlerProperties.modelsAnimations[animation]!).play();

        this.scene.add(brawler.model!);
    }
    
    private nonBloomed(obj: any) {
        if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
            this.materials[obj.uuid] = obj.material;
            obj.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        }
    }

    private restoreMaterial(obj: any) {
        if (this.materials[obj.uuid]) {
            obj.material = this.materials[obj.uuid];
            delete this.materials[obj.uuid];
        }
    }

    private getUncollidingVelocity(brawler: Brawler, direction: THREE.Vector3): THREE.Vector3 {
        const boundingBox = new THREE.Box3().setFromObject(brawler.model!);
        const brawlerSize = boundingBox.getSize(new THREE.Vector3());

        const newPosition = brawler.model!.position.clone().add(direction);

        const finalDirection = direction.clone();

        for (const obstacle of this.currentGame?.map.gameObstacles ?? []) {
            if (obstacle.getObstacleProperties().collision === false) continue;
            if (obstacle.model === undefined) continue;

            const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle.model);
            const obstacleSize = obstacleBoundingBox.getSize(new THREE.Vector3());

            if (newPosition.x < obstacle.model.position.x + obstacleSize.x &&
                newPosition.x + brawlerSize.x > obstacle.model.position.x &&
                newPosition.z < obstacle.model.position.z + obstacleSize.z &&
                newPosition.z + brawlerSize.z > obstacle.model.position.z) {
                
                // Collision
                finalDirection.x = 0;
                finalDirection.z = 0;
            }
        }

        return finalDirection;
    }

    private animate() {
        const delta = this.clock.getDelta()

        const character = this.currentGame?.brawlers.find((brawler) => brawler.id === this.currentGame?.playerID);

        if (character !== undefined) {
            const speed = character.brawlerProperties.speed * delta * 60 / 30;

            const movementVector = new THREE.Vector3();

            if (this.controller.keys.up.pressed) {
                movementVector.z -= 1;
            }
            if (this.controller.keys.down.pressed) {
                movementVector.z += 1;
            }
            if (this.controller.keys.left.pressed) {
                movementVector.x -= 1;
            }
            if (this.controller.keys.right.pressed) {
                movementVector.x += 1;
            }
            
            movementVector.normalize();
            movementVector.multiplyScalar(speed);

            character.velocity = this.getUncollidingVelocity(character, movementVector);

            character.update(delta);

            const prevCameraTarget = this.controls.target.clone();
            const newCameraTarget = new THREE.Vector3(prevCameraTarget.x, prevCameraTarget.y, character.position.z);
            this.camera.position.setZ(character.position.z + 50)
            this.camera.lookAt(newCameraTarget);
            this.controls.target = newCameraTarget
        }
        
        for (const brawler of this.currentGame?.brawlers ?? []) {
            const model = brawler.model;
            
            if (model === undefined) continue;
            
            if (brawler.state !== BrawlerModelAnimation.WALK && brawler.velocity.length() > 0) {
                this.setModel(brawler, BrawlerModelAnimation.WALK);
                brawler.state = BrawlerModelAnimation.WALK;
            } else if (brawler.state !== BrawlerModelAnimation.IDLE && brawler.velocity.length() === 0) {
                this.setModel(brawler, BrawlerModelAnimation.IDLE);
                brawler.state = BrawlerModelAnimation.IDLE;
            }

            model.position.set(brawler.position.x, 0, brawler.position.z);

            // Rotate the character
            if (brawler.velocity.length() > 0) {
                // model.rotation.y = Math.atan2(brawler.velocity.x, brawler.velocity.z);
                
                // Quaternion rotation
                const quaternion = new THREE.Quaternion();
                quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), brawler.velocity.normalize());
                model.quaternion.slerp(quaternion, 0.2);
            }


            brawler.mixer?.update(delta);
        }

        this.controls.update();

        this.scene.traverse(this.nonBloomed.bind(this));
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial.bind(this));
        this.finalComposer.render();

        this.frameCount++;

        if (!this.stopped) requestAnimationFrame(this.animate.bind(this));
    }
}
