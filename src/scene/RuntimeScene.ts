import GUI from 'lil-gui'
import * as THREE from 'three'
import { CameraController } from '../web/CameraController.js'
import { RVCharacter } from './Character.js'

export class RuntimeScene {
   gui: GUI | null = null
   public scene: THREE.Scene
   public camera: THREE.PerspectiveCamera
   public renderer: THREE.WebGLRenderer
   public cameraController!: CameraController

   private characters: RVCharacter[] = []
   private animationId: number | null = null
   private isDisposed = false

   constructor() {
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
      this.renderer = new THREE.WebGLRenderer({ antialias: true })

      this.setupScene()
      this.setupRenderer()
      this.setupCamera()
      this.setupLights()
      this.setupEventListeners()
   }

   private setupScene(): void {
      this.scene.background = new THREE.Color(0x87ceeb) // Sky blue background
   }

   private setupRenderer(): void {
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
   }

   private setupCamera(): void {
      this.camera.position.set(0, 200, 200)
      this.camera.lookAt(0, 200, 0)
      this.cameraController = new CameraController(this.camera, this.renderer.domElement)
   }

   private setupLights(): void {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      this.scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 10, 7.5)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      this.scene.add(directionalLight)
   }

   private setupEventListeners(): void {
      window.addEventListener('resize', this.onWindowResize.bind(this))
   }

   private onWindowResize(): void {
      if (this.isDisposed) return

      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
   }

   addCharacter(character: RVCharacter): void {
      this.characters.push(character)
      this.scene.add(character.group)
   }

   removeCharacter(character: RVCharacter): void {
      const index = this.characters.indexOf(character)
      if (index > -1) {
         this.characters.splice(index, 1)
         this.scene.remove(character.group)
      }
   }

   get allCharacters(): readonly RVCharacter[] {
      return this.characters
   }

   start(): void {
      if (this.isDisposed) return

      // Remove existing canvas if present
      const existingCanvas = document.querySelector('canvas')
      if (existingCanvas) {
         existingCanvas.remove()
      }

      document.body.appendChild(this.renderer.domElement)
      this.animate()
   }

   private animate = (): void => {
      if (this.isDisposed) return

      this.animationId = requestAnimationFrame(this.animate)

      // Update camera controller
      this.cameraController?.update()

      // Update characters
      for (const character of this.characters) {
         character.update()
      }

      this.renderer.render(this.scene, this.camera)
   }

   dispose(): void {
      if (this.isDisposed) return

      this.isDisposed = true

      // Stop animation loop
      if (this.animationId !== null) {
         cancelAnimationFrame(this.animationId)
         this.animationId = null
      }

      // Remove canvas
      if (document.body.contains(this.renderer.domElement)) {
         document.body.removeChild(this.renderer.domElement)
      }

      // Dispose characters
      for (const character of this.characters) {
         character.dispose()
      }
      this.characters.length = 0

      // Dispose camera controller
      this.cameraController?.dispose()

      // Dispose renderer
      this.renderer.dispose()

      // Remove event listeners
      window.removeEventListener('resize', this.onWindowResize.bind(this))

      console.log('RuntimeScene disposed')
   }
}
