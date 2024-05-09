import * as THREE from 'three';
import { nita } from "./models/brawlers/Nita";
import { EffectComposer, RenderPass, OutputPass, GLTFLoader, OrbitControls, UnrealBloomPass, GlitchPass, ShaderPass, RoomEnvironment } from 'three/examples/jsm/Addons.js';
import { fragmentShader } from './shaders/FragmentShader';
import { vertexShader } from './shaders/VertexShader';
import { GameInfo } from './models/GameInfo';
import { minicity } from './models/maps/minicity';
import { GameMap } from './models/GameMap';
import { BrawlerProperties } from './models/Brawler';
import { starrpark } from './models/maps/starrpark';
import getMiddlePoint from './utils/getMiddlePoint';
import { get } from 'http';
import GameObstacle, { GameObstacleProperties } from './models/GameObstacle';
import { bush } from './models/obstacles/bush';
import { woodenBox } from './models/obstacles/woodenBox';
import { woodenBarrel } from './models/obstacles/woodenBarrel';
import { powerCubeBox } from './models/obstacles/powerCubeBox';
import { skulls } from './models/obstacles/skulls';
import { unbreakableWall } from './models/obstacles/unbreakableWall';
import { gemSpawner } from './models/obstacles/gemSpawner';

export const brawlers: BrawlerProperties[] = [
    nita,
]

export const maps: GameMap[] = [
    minicity,
    starrpark
]

export const obstacles: GameObstacleProperties[] = [
    woodenBox,
    woodenBarrel,
    bush,
    powerCubeBox,
    skulls,
    unbreakableWall,
    gemSpawner
]

const BLOOM_SCENE = 1;

export default class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private finalComposer: EffectComposer
    private renderScene: RenderPass
    private outputPass: OutputPass
    private loader: GLTFLoader;
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

    stopped = false;
    private handleEnd: () => void;

    currentGame?: GameInfo;

    constructor(handleEnd: () => void) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.loader = new GLTFLoader();
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

        // const gridHelper = new THREE.GridHelper(100, 100);
        // this.scene.add( gridHelper );

        

        this.loader.load('/items/source/brawl/Project Name.gltf', (gltf) => {
            gltf.scene.position.set(0, 0, 0);
            gltf.scene.scale.set(100, 100, 100);
            gltf.scene.translateZ(10)

            const itemIndexes = [11]

            for (let i = gltf.scene.children.length - 1; i >= 0; i--) {
                // const index = gltf.scene.children.length - i - 1;
                const child = gltf.scene.children[i];

                if (!itemIndexes.includes(i))
                    child.removeFromParent();
            }

            // const box = new THREE.Box3().setFromObject(gltf.scene);
            // const helper = new THREE.Box3Helper(box, 0xffff00);
            // this.scene.add(helper);

            this.scene.add(gltf.scene);
        });

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
        // const helper = new THREE.DirectionalLightHelper(directionalLight);
        // this.scene.add(helper);

        // const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, emissiveIntensity: 1 }));
        // sphere1.position.set(game.map.firstCorner.x, game.map.firstCorner.y, game.map.firstCorner.z);
        // this.scene.add(sphere1);
        // const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, emissiveIntensity: 1 }));
        // sphere2.position.set(game.map.secondCorner.x, game.map.secondCorner.y, game.map.secondCorner.z);
        // this.scene.add(sphere2);
        // this.camera.lookAt(sphere2.position);
        // this.controls.target = sphere2.position;
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
        
        

        this.controls.update();

        this.scene.traverse(this.nonBloomed.bind(this));
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial.bind(this));
        this.finalComposer.render();

        this.frameCount++;

        if (!this.stopped) requestAnimationFrame(this.animate.bind(this));
    }
}
