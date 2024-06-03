import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import Brawler, { BrawlerModelAnimation } from "../models/Brawler";
import * as THREE from 'three';

export default function MenuBrawler({ animation }: { animation: BrawlerModelAnimation }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current as HTMLCanvasElement, alpha: true, antialias: true });
        // renderer.setSize( window.innerWidth, window.innerHeight );

        // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // const cube = new THREE.Mesh( geometry, material );
        // scene.add( cube );
        const light = new THREE.AmbientLight();
        scene.add(light)

        const pointLight = new THREE.PointLight(0xffffff, 10);
        pointLight.position.set(0, 5, 5)
        scene.add(pointLight)

        const clock = new THREE.Clock()

        let mixer: THREE.AnimationMixer | undefined;

        new GLTFLoader().load(`/brawlers/piper/piper_${animation.toLowerCase()}.gltf`, (gltf) => {
            const mesh = gltf.scene.children[0] as THREE.Mesh;
            const scale = 0.5
            mesh.scale.set(scale, scale, scale)
            mesh.position.setY(-2.5)
            scene.add(mesh)

            mixer = new THREE.AnimationMixer(mesh);
            mixer.clipAction(gltf.animations[0]).play()
        });

        camera.position.z = 5;

        function animate() {
            requestAnimationFrame( animate );
            const delta = clock.getDelta()

            mixer?.update(delta)

            renderer.render( scene, camera );
        }

        animate();
    }, [])

    return (
        <canvas ref={canvasRef} className='h-[30rem] w-[30rem] p-12'></canvas>
    );
}