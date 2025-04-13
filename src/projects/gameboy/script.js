import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Base
 */
// Debug
// const gui = new GUI({
//     width: 200
// })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Gameboy
 */
let mixer = null
let openAnimationTop = null
let openAnimationScreen = null
let onButtonAnimation = null
let onLEDAnimation = null

// console.log(gltfLoader);


gltfLoader.load(
    '/models/gameboyWithAnimation.glb',
    (gltf) => {
      mixer = new THREE.AnimationMixer(gltf.scene)
      console.log(gltf);
      openAnimationTop = mixer.clipAction(gltf.animations[0]);
      openAnimationScreen = mixer.clipAction(gltf.animations[1]);
      // onButtonAnimation = mixer.clipAction(gltf.animations[3]);
      // onLEDAnimation = mixer.clipAction(gltf.animations[1]);
      openAnimationTop.loop = THREE.LoopOnce;
      openAnimationScreen.loop = THREE.LoopOnce;
      // onButtonAnimation.loop = THREE.LoopOnce;
      // onLEDAnimation.loop = THREE.LoopOnce;
      openAnimationTop.clampWhenFinished = true;
      openAnimationScreen.clampWhenFinished = true;
      // onButtonAnimation.clampWhenFinished = true;
      // onLEDAnimation.clampWhenFinished = true;
      openAnimationTop.play();
      openAnimationScreen.play();
      gltf.scene.rotateY(-2)
      gltf.scene.rotateX(-1)
      gltf.scene.position.y = -0.75

      scene.add(gltf.scene)

    }
  )

// Animation Controls
let isClosed = false;
let isOpened = true;
const animationControls = {
  playOpen: () => {
    if (!openAnimationTop || !openAnimationScreen || isOpened || openAnimationTop.isRunning() || openAnimationScreen.isRunning()) return;

    openAnimationTop.reset();
    openAnimationScreen.reset();
    openAnimationTop.timeScale = 1;
    openAnimationScreen.timeScale = 1;
    openAnimationTop.play();
    openAnimationScreen.play();

    isOpened = true;
    isClosed = false;
  },
  playClose: () => {
    if (!openAnimationTop || !openAnimationScreen || isClosed || openAnimationTop.isRunning() || openAnimationScreen.isRunning()) return;

    openAnimationTop.time = openAnimationTop.getClip().duration;
    openAnimationScreen.time = openAnimationScreen.getClip().duration;
    openAnimationTop.timeScale = -1;
    openAnimationScreen.timeScale = -1;
    openAnimationTop.paused = false;
    openAnimationScreen.paused = false;
    openAnimationTop.play();
    openAnimationScreen.play();

    isClosed = true;
    isOpened = false;

  },
  // playOn: () => {
  //   onButtonAnimation.reset();
  //   openAnimationScreen.reset();
  //   onButtonAnimation.timeScale = 1;
  //   openAnimationScreen.timeScale = 1;
  //   onButtonAnimation.play();
  //   openAnimationScreen.play();
  //   console.log(onButtonAnimation);

  //   onLEDAnimation.reset();
  //   openAnimationScreen.reset();
  //   onLEDAnimation.timeScale = 1;
  //   openAnimationScreen.timeScale = 1;
  //   onLEDAnimation.play();
  //   openAnimationScreen.play();
  //   console.log(onLEDAnimation);
  // },
};

// GUI Button
// const animationFolder = gui.addFolder('Animations');
// animationFolder.add(animationControls, 'playOpen').name('Open');
// animationFolder.add(animationControls, 'playClose').name('Close');

// Menu Buttons
const openBtn = document.querySelector(".open-btn");
const closeBtn = document.querySelector(".close-btn");
const onBtn = document.querySelector(".on-btn");
openBtn.onclick = () => {
  if(!openAnimationTop.isRunning() || !openAnimationScreen.isRunning()) {
  animationControls.playOpen()
    openBtn.classList.add("active")
    if(closeBtn.classList.contains("active")) {
      closeBtn.classList.remove("active")
    }
  }

}
closeBtn.onclick = () => {
  if(!openAnimationTop.isRunning() || !openAnimationScreen.isRunning()) {
  animationControls.playClose()
    closeBtn.classList.add("active")
    if(openBtn.classList.contains("active")) {
      openBtn.classList.remove("active")
    }
  }
}
onBtn.onclick = () => {
  // if(!openAnimationTop.isRunning() || !openAnimationScreen.isRunning()) {
  animationControls.playOn()
    // onBtn.classList.add("active")
    // if(openBtn.classList.contains("active")) {
    //   openBtn.classList.remove("active")
    // }
  // }
}

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
		const deltaTime = elapsedTime - previousTime
		previousTime = elapsedTime

		// Update mixer
		if (mixer !== null) {
			mixer.update(deltaTime)
		}

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


/**
 * Menu
 */
const menuButton = document.querySelector(".hamburger-menu");
const menu = document.querySelector(".menu");
if (menuButton) {
  menuButton.onclick = () => {
    menu.classList.toggle("open")
    menuButton.classList.toggle("open")
  }
}
