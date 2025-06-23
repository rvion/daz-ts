import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class CameraController {
   controls: OrbitControls

   constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
      this.controls = new OrbitControls(camera, domElement)
      this.controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
      this.controls.dampingFactor = 0.05
      this.controls.screenSpacePanning = false
      this.controls.minDistance = 10
      this.controls.maxDistance = 800
   }

   /** Sets the distance limits based on the size of the viewed object */
   setDistanceLimits(
      /** The approximate size of the object being viewed */
      size: number,
   ) {
      // Set reasonable min/max distance limits based on object size
      this.controls.minDistance = size * 0.2
      this.controls.maxDistance = size * 2
   }

   update = () => this.controls.update()
   dispose = () => this.controls.dispose()
}
