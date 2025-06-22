import * as THREE from 'three'
import { DazCharacter } from '../../core/DazFileCharacter.js'
// import { DazNodeRef } from '../../core/DazNodeRef.js'; // Not directly used in function signatures
import { DazGeometryRef } from '../../core/DazGeometryRef.js'

// No other core/* or spec.js imports should be needed here for geometry processing
// DazGeometryInf is used implicitly via geometryRef.resolvedGeometryInf

// import { DazGeometryInf } from '../../core/DazGeometryInf.js'; // Type is inferred

let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
const characterMeshes: THREE.Mesh[] = []

export async function initSceneGenesis9(character: DazCharacter) {
   camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
   camera.position.set(
      // Adjusted for character height and view
      100 /* LR: 0 => centered */,
      100 /* HEIGHT (meters): height are 1m high */,
      100 /* FB */,
   )
   camera.lookAt(0, 100, 0) // Look at the character's approximate center

   scene = new THREE.Scene()
   scene.background = new THREE.Color(0x87ceeb) // Sky blue background

   const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
   scene.add(ambientLight)
   const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
   directionalLight.position.set(5, 10, 7.5)
   scene.add(directionalLight)

   characterMeshes.length = 0 // Clear previous meshes

   for (const nodeRef of character.nodes.values()) {
      if (nodeRef.geometryRefs) {
         for (const geometryRef of nodeRef.geometryRefs.values()) {
            try {
               const resolvedInf = geometryRef.resolvedGeometryInf
               if (resolvedInf) {
                  const vertices = resolvedInf.verticesForThree
                  const indices = resolvedInf.indicesForThree

                  if (vertices && indices && vertices.length > 0 && indices.length > 0) {
                     const threeGeometry = new THREE.BufferGeometry()
                     threeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
                     threeGeometry.setIndex(indices)
                     threeGeometry.computeVertexNormals()

                     const material = new THREE.MeshStandardMaterial({
                        color: 0xdddddd,
                        wireframe: false,
                        side: THREE.DoubleSide,
                     })
                     const mesh = new THREE.Mesh(threeGeometry, material)
                     scene.add(mesh)
                     characterMeshes.push(mesh)
                  } else {
                     console.warn(
                        `No vertex or index data found for resolved geometry ${resolvedInf.dazId} from ref ${geometryRef.dazId}`,
                     )
                  }
               } else {
                  console.warn(
                     `Geometry reference ${geometryRef.dazId} (${geometryRef.data.name}) did not resolve to a DazGeometryInf.`,
                  )
               }
            } catch (error) {
               console.error(
                  `Failed to create mesh for geometry reference ${geometryRef.dazId} (${geometryRef.data.name}):`,
                  error,
               )
            }
         }
      }
   }

   if (characterMeshes.length === 0) {
      console.warn('No meshes were created for the character. Adding a fallback box.')
      const fallbackGeo = new THREE.BoxGeometry(0.5, 1.7, 0.5) // Approx human size
      const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xcccccc })
      const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat)
      fallbackMesh.position.y = 1.7 / 2
      scene.add(fallbackMesh)
      characterMeshes.push(fallbackMesh)
   }

   if (document.body.contains(renderer?.domElement)) {
      renderer.setAnimationLoop(null) // Stop previous loop
      document.body.removeChild(renderer.domElement) // Remove old canvas
      renderer.dispose() // Dispose old renderer
   }

   renderer = new THREE.WebGLRenderer({ antialias: true })
   renderer.setPixelRatio(window.devicePixelRatio)
   renderer.setSize(window.innerWidth, window.innerHeight)
   renderer.setAnimationLoop(animate)
   document.body.appendChild(renderer.domElement)

   window.addEventListener('resize', onWindowResize)
}

// Removed createMeshFromGeometryRef function as its logic is now in DazGeometryRef.toThreeMesh()

function onWindowResize() {
   if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
   }
}

function animate() {
   if (renderer && scene && camera) {
      characterMeshes.forEach((mesh) => {
         mesh.rotation.y += 0.003
      })
      renderer.render(scene, camera)
   }
}
