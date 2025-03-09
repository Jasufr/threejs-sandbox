import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 400
})

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
 * Animated Slime
 */
let mixer = null
let idleAnimation = null
let jumpAnimation = null
let attackAnimation = null
let isPlaying = false

console.log(gltfLoader);


gltfLoader.load(
    '/models/slimeAnimated.glb',
    (gltf) => {
      mixer = new THREE.AnimationMixer(gltf.scene)

			idleAnimation = mixer.clipAction(gltf.animations[1]);
			jumpAnimation = mixer.clipAction(gltf.animations[2]);
			attackAnimation = mixer.clipAction(gltf.animations[0]);

			jumpAnimation.clampWhenFinished = true;
			jumpAnimation.loop = THREE.LoopOnce;
			attackAnimation.clampWhenFinished = true;
			attackAnimation.loop = THREE.LoopOnce;
			// attackAnimation.timeScale = 1.5
			// attackAnimation.timeScale = .5

			idleAnimation.play();
			console.log(gltf.animations)

			gltf.scene.scale.set(0.5, 0.5, 0.5)
      scene.add(gltf.scene)

    }
  )

	function playJump() {
    if (!jumpAnimation || !idleAnimation || isPlaying) return;

    isPlaying = true;

    idleAnimation.fadeOut(0.2)
    jumpAnimation.reset().fadeIn(0.2).play()

    jumpAnimation.getMixer().addEventListener('finished', (e) => {
			if (e.action === jumpAnimation) {
					isPlaying = false;

          jumpAnimation.fadeOut(0.2)
          idleAnimation.reset().fadeIn(0.2).play()
			}
	}, { once: true });
}

	function playAttack() {
    if (!attackAnimation || !idleAnimation || isPlaying) return;

    isPlaying = true;

    idleAnimation.fadeOut(0.2)
    attackAnimation.reset().fadeIn(0.2).play()

    attackAnimation.getMixer().addEventListener('finished', (e) => {
			if (e.action === attackAnimation) {
					isPlaying = false;

          attackAnimation.fadeOut(0.2)
          idleAnimation.reset().fadeIn(1).play()
			}
	}, { once: true });
}

// GUI Button
const animationFolder = gui.addFolder('Animations');
animationFolder.add({ playJump }, 'playJump').name('Jump');
animationFolder.add({ playAttack }, 'playAttack').name('Attack');

/**
 * Floor
 */
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10),
	new THREE.MeshStandardMaterial({
			color: '#4F7942',
			metalness: 0,
			roughness: 0.5
	})
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

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
