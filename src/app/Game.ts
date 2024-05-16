import * as THREE from 'three';
import { EffectComposer, RenderPass, OutputPass, GLTFLoader, OrbitControls, UnrealBloomPass, ShaderPass, RoomEnvironment, ColladaLoader } from 'three/examples/jsm/Addons.js';
import { fragmentShader } from './shaders/FragmentShader';
import { vertexShader } from './shaders/VertexShader';
import { GameInfo } from './models/GameInfo';
import { minicity } from './models/maps/minicity';
import { GameMap } from './models/GameMap';
import { BrawlerModelAnimation, BrawlerProperties, BrawlerType } from './models/Brawler';
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
    private loader: ColladaLoader;
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
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.loader = new ColladaLoader();
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

        this.loader.load(game.map.backgroundObjectPath, (gltf) => {
            gltf.scene.position.set(0, 0, 0);
            this.scene.add(gltf.scene);
        });

        this.camera.position.set(getMiddlePoint(game.map).x, 1, 2 * getMiddlePoint(game.map).z);
        this.camera.lookAt(getMiddlePoint(game.map).x, 10, 0);
        this.controls.target = new THREE.Vector3(getMiddlePoint(game.map).x, 10, 0);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        this.directionalLight.position.set(getMiddlePoint(game.map).x, 5, 0);
        this.directionalLight.target.position.set(getMiddlePoint(game.map).x, 0, getMiddlePoint(game.map).z);
        this.scene.add(this.directionalLight);

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

            model.position.set(obstacle.position.x, 0, obstacle.position.z);

            const boundingBox = new THREE.Box3().setFromObject(model)
            const size = boundingBox.getSize(new THREE.Vector3()); 
            const xScaleFactor = obstacle.width! / size.x;
            const zScaleFactor = obstacle.height! / size.z;
            model.scale.set(xScaleFactor, xScaleFactor, zScaleFactor);

            obstaclesScene.add(model);
        });
        
        obstaclesScene.position.set(0.5, 0, 1);
        this.scene.add(obstaclesScene);

        for (const brawler of game.brawlers) {
            const model = brawler.brawlerProperties.models[BrawlerModelAnimation.IDLE]?.clone();

            if (model === undefined) throw new Error("Brawler model is undefined");

            model.position.set(brawler.position.x, 0, brawler.position.z);

            brawler.model = model;

            this.scene.add(model);
        }
    }

    private loadModels() {
        this.loadModel("/items/source/brawl/Project Name.gltf", (gltf) => {
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
                const path = "/brawlers/" + brawler.id + "/" + brawler.id + "_" + key.toLowerCase() + ".dae";
                console.log(path)

                if (path !== undefined) {
                    this.loadModel(path, (gltf) => {
                        const newScene = new THREE.Scene();

                        newScene.add(gltf.scene);

                        brawler.models[key as BrawlerModelAnimation] = newScene;
                    });
                }
            }
        }
    }

    private loadModel(path: string, callback: (gltf: any) => void) {
        this.loader.load(path, callback);
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

    private animate() {
        const delta = this.clock.getDelta()

        const character = this.currentGame?.brawlers.find((brawler) => brawler.id === this.currentGame?.playerID);

        if (character !== undefined) {
            if (this.controller.keys.up.pressed) {
                character.position.z += 1;
            }
            if (this.controller.keys.down.pressed) {
                character.position.z -= 1;
            }
            if (this.controller.keys.left.pressed) {
                character.position.x -= 1;
            }
            if (this.controller.keys.right.pressed) {
                character.position.x += 1;
            }
        }
        
        for (const brawler of this.currentGame?.brawlers ?? []) {
            const model = brawler.model;

            model?.position.set(brawler.position.x, 0, brawler.position.z);
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
