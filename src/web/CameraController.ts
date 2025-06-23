import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class CameraController {
   public controls: OrbitControls

   constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
      this.controls = new OrbitControls(camera, domElement)
      this.controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
      this.controls.dampingFactor = 0.05
      this.controls.screenSpacePanning = false
      this.controls.minDistance = 100
      this.controls.maxDistance = 500
      this.controls.maxPolarAngle = Math.PI / 2
   }

   public update() {
      this.controls.update()
   }

   public dispose() {
      this.controls.dispose()
   }
}
