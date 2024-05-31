import * as THREE from 'three';
import { EffectComposer, RenderPass, OutputPass, GLTFLoader, OrbitControls, UnrealBloomPass, ShaderPass, RoomEnvironment, CSS2DObject, CSS2DRenderer, SkeletonUtils } from 'three/examples/jsm/Addons.js';
import { fragmentShader } from './shaders/FragmentShader';
import { vertexShader } from './shaders/VertexShader';
import { GameInfo } from './models/GameInfo';
import { minicity } from './models/maps/minicity';
import { GameMap } from './models/GameMap';
import Brawler, { BrawlerAttackShape, BrawlerModelAnimation, BrawlerProjectile, BrawlerProperties, BrawlerType } from './models/Brawler';
import { starrpark } from './models/maps/starrpark';
import getMiddlePoint from './utils/getMiddlePoint';
import GameObstacle, { GameObstacleBiome, GameObstacleProperties, GameObstacleType } from './models/GameObstacle';
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
import { joystickManager } from './App';
import { EventData, JoystickOutputData } from 'nipplejs';
import { DatabaseReference, getDatabase, onValue, ref, set, child, remove } from "firebase/database";

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
    private labelRenderer: CSS2DRenderer;
    // private controls: OrbitControls;
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
    brawlersRef?: DatabaseReference;
    brawlerRef?: DatabaseReference;

    private controller: Controller;

    currentGame?: GameInfo;
    playerID?: string;

    constructor(handleEnd: () => void) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.gltfLoader = new GLTFLoader();
        this.textureLoader = new THREE.TextureLoader();
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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

        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize (window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        document.getElementById("game-container")!.appendChild(this.labelRenderer.domElement);

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
            this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        joystickManager.on("move", this.onJoystickMove.bind(this));
        joystickManager.on("end", this.onJoystickRelease.bind(this));
    }

    public start() {
        this.animate();
    }

    public stop() {
        this.renderer.dispose();
        this.stopped = true;
    }

    public loadGame(game: GameInfo, playerID?: string) {
        this.currentGame = game;
        this.playerID = playerID;

        this.brawlersRef = ref(getDatabase(), 'games/' + this.currentGame?.id + '/brawlers');
        this.brawlerRef = ref(getDatabase(), 'games/' + this.currentGame?.id + '/brawlers/' + this.playerID);

        onValue(this.brawlersRef, (snapshot) => {
            const data = snapshot.val();
            if (data === null) return;

            // remove brawlers that are not in the data
            for (const brawler of this.currentGame?.brawlers ?? []) {
                if (data[brawler.id ?? ""] === undefined) {
                    this.scene.remove(brawler.model!);
                    this.scene.remove(brawler.infoBarUI!);
                    this.currentGame?.brawlers.splice(this.currentGame?.brawlers.indexOf(brawler), 1);
                }
            }

            for (const key in data) {
                if (key === this.playerID) continue;

                const brawler: Brawler = data[key];
                const brawlerInstance = this.currentGame?.brawlers.find((b) => b.id === key);

                if (brawlerInstance === undefined) continue;
                
                brawlerInstance?.setBrawlerHealth(brawler.health);
                
                brawlerInstance?.position.set(brawler.position.x, brawler.position.y, brawler.position.z);
                brawlerInstance?.velocity.set(brawler.velocity.x, brawler.velocity.y, brawler.velocity.z);
                brawlerInstance?.acceleration.set(brawler.acceleration.x, brawler.acceleration.y, brawler.acceleration.z);
                brawlerInstance?.rotation.set(brawler.rotation.x, brawler.rotation.y, brawler.rotation.z, brawler.rotation.w);

                brawlerInstance.aiming = brawler.aiming;
                brawlerInstance.aimingSuper = brawler.aimingSuper;
                
                // remove projectiles that are not in the data
                for (const projectile of brawlerInstance.projectiles) {
                    if (brawler.projectiles?.find((p) => p.id === projectile.id) === undefined) {
                        this.scene.remove(projectile.model!);
                        brawlerInstance.projectiles.splice(brawlerInstance.projectiles.indexOf(projectile), 1);
                    }
                }

                brawlerInstance.projectiles = brawler.projectiles?.map((p: any) => {
                    let currentProjectile = brawlerInstance.projectiles.find((proj) => proj.id === p.id);

                    if (currentProjectile === undefined) {
                        currentProjectile = new BrawlerProjectile(brawler.brawlerType, false)
                        currentProjectile.id = p.id;

                        this.scene.add(currentProjectile.model!);
                    }
                    
                    currentProjectile.position = new THREE.Vector3().add(p.position);
                    currentProjectile.velocity = new THREE.Vector3().add(p.velocity);
                    currentProjectile.acceleration = new THREE.Vector3().add(p.acceleration);
                    currentProjectile.rotation = new THREE.Quaternion().copy(p.rotation);
                    currentProjectile.startPosition = new THREE.Vector3().add(p.startPosition);
                    currentProjectile.parentBrawler = p.parentBrawler;

                    currentProjectile.model!.position.set(currentProjectile.position.x, 0.5, currentProjectile.position.z);
                    currentProjectile.model!.rotation.set(0, currentProjectile.rotation.y, 0);

                    return currentProjectile;
                }) ?? [];
                brawlerInstance.hitProjectileIDs = Array.from(brawler.hitProjectileIDs ?? []);
            }
        });

        this.gltfLoader.load(game.map.backgroundObjectPath, (gltf) => {
            gltf.scene.position.set(0, 0, 0);
            this.scene.add(gltf.scene);
        });

        this.camera.position.set(getMiddlePoint(game.map).x, 50, 40);
        this.camera.lookAt(getMiddlePoint(game.map).x, 0, 0);
        // this.controls.target = new THREE.Vector3(getMiddlePoint(game.map).x, 0, 0);

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
                const model = brawlers[brawler.brawlerType].models[key.toLowerCase() as BrawlerModelAnimation];

                if (model === undefined) {
                    console.error("Model is undefined");
                    continue;
                }

                model.position.set(brawler.position.x, 0, brawler.position.z);
                model.scale.set(0.15, 0.15, 0.15);
            }

            brawler.state = BrawlerModelAnimation.IDLE;
            this.setModel(brawler, BrawlerModelAnimation.IDLE);

            const infoBarHTML = document.getElementById(`infobar-${brawler.id}`);

            if (infoBarHTML) {
                const infoBar = new CSS2DObject(infoBarHTML);
                this.scene.add(infoBar);

                brawler.infoBarUI = infoBar;            
            }
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

        const newModel = brawlers[brawler.brawlerType].models[animation];

        if (newModel === undefined) return;

        const newClonedModel = SkeletonUtils.clone(newModel);

        brawler.model = newClonedModel;
        brawler.model?.position.set(brawler.position.x, 0, brawler.position.z);
        brawler.model?.rotation.copy(oldModel?.rotation ?? new THREE.Euler(0, 0, 0));

        brawler.mixer = new THREE.AnimationMixer(brawler.model!);
        brawler.mixer.clipAction(brawlers[brawler.brawlerType].modelsAnimations[animation]!).play();

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

    private latestJoystickData?: JoystickOutputData;

    private onJoystickMove(event: EventData, data: JoystickOutputData) {
        this.latestJoystickData = data;
        
        if (this.currentGame === undefined) return;

        const character = this.currentGame.brawlers.find((brawler) => brawler.id === this.playerID);

        if (character === undefined) return;

        if (character.aimAttackMesh === undefined) {
            // Draw a rectangle, circle, or fan from the brawler to the vector.
            switch (character.getbrawlerProperties().attackProjectile.attackShape) {
                case BrawlerAttackShape.RECTANGLE: {
                    const attackWidth = character.getbrawlerProperties().attackProjectile.attackWidth;
                    const attackHeight = character.getbrawlerProperties().attackProjectile.attackRange;
                    const attackCenter = character.position;

                    const plane = new THREE.PlaneGeometry(attackWidth, attackHeight);
                    const material = new THREE.MeshStandardMaterial({ 
                        opacity: 0.25, 
                        transparent: true, 
                        side: THREE.DoubleSide, 
                        // depthWrite: false,
                        color: 0xffffff
                    });
                    const mesh = new THREE.Mesh(plane, material);

                    mesh.rotateX(Math.PI / 2);
                    mesh.position.copy(attackCenter);

                    character.aimAttackMesh = mesh;
                    this.scene.add(character.aimAttackMesh);
                }
            }
        }

        this.positionAimAttackMesh(character, data);

        character.aiming = data.force > 0.3;

        if (!character.aiming) {
            character.aimAttackMesh.visible = false;
        } else {
            character.aimAttackMesh.visible = true;
        }
    }

    private positionAimAttackMesh(character: Brawler, data: JoystickOutputData) {
        if (character.aimAttackMesh === undefined) return;

        character.aimAttackMesh.position.copy(character.position);
        character.aimAttackMesh.position.y = 0.1;
        character.aimAttackMesh.position.x += character.getbrawlerProperties().attackProjectile.attackRange / 2 * Math.sin(data.angle.radian + Math.PI / 2);
        character.aimAttackMesh.position.z += character.getbrawlerProperties().attackProjectile.attackRange / 2 * Math.cos(data.angle.radian + Math.PI / 2);

        character.aimAttackMesh.rotation.z = -data.angle.radian + Math.PI / 2;
    }

    private onJoystickRelease() {
        if (this.currentGame === undefined) return;

        const character = this.currentGame.brawlers.find((brawler) => brawler.id === this.playerID);

        if (character === undefined) return;

        character.aiming = false;
        if (character.aimAttackMesh !== undefined) character.aimAttackMesh.visible = false;

        if (this.latestJoystickData?.force ?? 0 > 0.3) {
            const projectile = character.shootProjectile(this.latestJoystickData?.angle.radian ?? 0);

            this.scene.add(projectile.model!);

            if (this.brawlerRef) {
                character.sendBrawlerData(this.brawlerRef);
            }
        }
    }

    private checkObstacleCollision(object: THREE.Object3D, direction: THREE.Vector3): GameObstacle[] {
        const boundingBox = new THREE.Box3().setFromObject(object);
        const objectSize = boundingBox.getSize(new THREE.Vector3());

        const newPosition = object.position.clone().add(direction);

        const collidingObstacles: GameObstacle[] = [];

        for (const obstacle of this.currentGame?.map.gameObstacles ?? []) {
            if (obstacles[obstacle.obstacleType].collision === false) continue;
            if (obstacle.model === undefined) continue;

            const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle.model);
            const obstacleSize = obstacleBoundingBox.getSize(new THREE.Vector3());

            if (this.checkColliding(newPosition, obstacle.model.position, objectSize, obstacleSize)) {
                collidingObstacles.push(obstacle);
            }
        }

        return collidingObstacles;
    }

    private checkBrawlerCollision(object: THREE.Object3D, direction: THREE.Vector3): Brawler[] {
        const boundingBox = new THREE.Box3().setFromObject(object);
        const objectSize = boundingBox.getSize(new THREE.Vector3());

        const newPosition = object.position.clone().add(direction);

        const collidingBrawlers: Brawler[] = [];

        for (const brawler of this.currentGame?.brawlers ?? []) {
            if (brawler.model === undefined) continue;

            const brawlerBoundingBox = new THREE.Box3().setFromObject(brawler.model);
            const brawlerSize = brawlerBoundingBox.getSize(new THREE.Vector3());

            if (this.checkColliding(newPosition, brawler.model.position, objectSize, brawlerSize)) {
                collidingBrawlers.push(brawler);
            }
        }

        return collidingBrawlers;
    }

    private checkColliding(position1: THREE.Vector3, position2: THREE.Vector3, size1: THREE.Vector3, size2: THREE.Vector3): boolean {
        return (position1.x < position2.x + size2.x &&
            position1.x + size1.x > position2.x &&
            position1.z < position2.z + size2.z &&
            position1.z + size1.z > position2.z)
    }

    private animate() {
        const delta = this.clock.getDelta()

        const character = this.currentGame?.brawlers.find((brawler) => brawler.id === this.playerID);

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

            // Update projectiles
            for (const projectile of brawler.projectiles) {
                // seriously bro? rotation is the thing that breaks it? bullshit.
                this.scene.remove(projectile.model!);

                projectile.model = new THREE.Mesh(new THREE.IcosahedronGeometry(projectile.getBrawlerProjectileProperties().attackWidth / 1.5, 0), new THREE.MeshStandardMaterial({ color: 0x7FC8FF }))
                projectile.model!.position.set(projectile.position.x, 0.5, projectile.position.z);
                // projectile.model!.rotation.set(0, projectile.rotation.y, 0);
                this.scene.add(projectile.model!);

                const collidingCurrentBrawler = this.checkBrawlerCollision(projectile.model!, projectile.velocity).find((b) => b.id === brawler.id) !== undefined;

                if (brawler.id !== this.playerID && character !== undefined && character.hitProjectileIDs.indexOf(projectile.id) === -1 && collidingCurrentBrawler) {
                    const damage = projectile.getBrawlerProjectileProperties().getProjectileDamage(projectile);
                    character?.setBrawlerHealth(character.health - damage);
                    character.hitProjectileIDs.push(projectile.id);
    
                    if (this.brawlerRef) {
                        set(child(this.brawlerRef, "health"), character?.health);
                    }
                }
            }

            brawler.infoBarUI?.position.set(brawler.position.x, 3, brawler.position.z);
        }

        if (character !== undefined) {
            const speed = brawlers[character.brawlerType].speed * delta * 60 / 50;

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

            if (character.model) character.velocity = this.checkObstacleCollision(character.model, movementVector).length > 0 ? new THREE.Vector3() : movementVector;

            character.update(delta);

            const newCameraTarget = new THREE.Vector3(getMiddlePoint(this.currentGame!.map).x, getMiddlePoint(this.currentGame!.map).y, character.position.z);
            this.camera.position.setZ(character.position.z + 50)
            this.camera.lookAt(newCameraTarget);
            // this.controls.target = newCameraTarget

            if (this.latestJoystickData !== undefined)
                this.positionAimAttackMesh(character, this.latestJoystickData);

            for (const projectile of character.projectiles) {
                projectile.update(delta);

                projectile.model!.position.set(projectile.position.x, 0.5, projectile.position.z);
                projectile.model!.rotation.set(0, projectile.rotation.y, 0);

                projectile.rotation.y += 0.5;

                const collidingObstacles = this.checkObstacleCollision(projectile.model!, projectile.velocity);
                const collidingBrawlers = this.checkBrawlerCollision(projectile.model!, projectile.velocity);

                const collidingEnemyBrawlers = collidingBrawlers.filter((b) => b.team !== character.team);

                if (projectile.getDistanceTraveled() > projectile.getBrawlerProjectileProperties().attackRange || collidingObstacles.length > 0 || collidingEnemyBrawlers.length > 0) {
                    this.scene.remove(projectile.model!);
                    character.projectiles.splice(character.projectiles.indexOf(projectile), 1);
                }
            }

            if (this.brawlerRef) {
                character.sendBrawlerData(this.brawlerRef);
            }

            if (character.health <= 0) {
                this.scene.remove(character.model!);
                this.scene.remove(character.infoBarUI!);
                this.currentGame?.brawlers.splice(this.currentGame?.brawlers.indexOf(character), 1);

                if (this.brawlerRef) {
                    remove(this.brawlerRef);
                }
            }
        }
        
        if (this.currentGame?.brawlers.length === 1) {
            this.handleEnd();
        }

        // this.controls.update();

        this.scene.traverse(this.nonBloomed.bind(this));
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial.bind(this));
        this.finalComposer.render();

        this.labelRenderer.render(this.scene, this.camera);

        this.frameCount++;

        if (!this.stopped) requestAnimationFrame(this.animate.bind(this));
    }
}
