import * as THREE from 'three'

export const getFallbackMaterial = () =>
   new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
   })
