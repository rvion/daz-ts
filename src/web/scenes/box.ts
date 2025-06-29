import * as THREE from 'three'

let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let mesh: THREE.Mesh

export function initSceneBox() {
   camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100)
   camera.position.z = 2

   scene = new THREE.Scene()

   const texture = new THREE.TextureLoader().load('web/crate.gif')
   // const texture = new THREE.TextureLoader().load("textures/crate.gif")
   texture.colorSpace = THREE.SRGBColorSpace

   const geometry = new THREE.BoxGeometry()
   const material = new THREE.MeshBasicMaterial({ map: texture })

   mesh = new THREE.Mesh(geometry, material)
   scene.add(mesh)

   renderer = new THREE.WebGLRenderer({ antialias: true })
   renderer.setPixelRatio(window.devicePixelRatio)
   renderer.setSize(window.innerWidth, window.innerHeight)
   renderer.setAnimationLoop(animate)
   document.body.appendChild(renderer.domElement)

   //

   window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
   camera.aspect = window.innerWidth / window.innerHeight
   camera.updateProjectionMatrix()

   renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
   mesh.rotation.x += 0.005
   mesh.rotation.y += 0.01

   renderer.render(scene, camera)
}
