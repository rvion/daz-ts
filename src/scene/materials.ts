import * as THREE from 'three'
import { getFallbackMaterial } from './misc.js'

export const meshStandardMaterial1 = new THREE.MeshStandardMaterial({
   color: 0xdddddd,
   wireframe: true,
   transparent: true,
   opacity: 0.3,
   side: THREE.DoubleSide,
})

export const fallbackMesh = () => {
   // Approximate human proportions in cm
   const geometry = new THREE.BoxGeometry(50, 170, 30)
   const material = getFallbackMaterial()
   const mesh = new THREE.Mesh(geometry, material)
   mesh.name = 'FallbackMesh'
   mesh.position.y = 85 // Half height to place on ground
   mesh.castShadow = true
   mesh.receiveShadow = true
   return mesh
}
