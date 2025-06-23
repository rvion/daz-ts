import * as THREE from 'three'
import { DazCharacter } from '../../core/DazFileCharacter.js'
import { CameraController } from '../CameraController.js'

let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let cameraController: CameraController
const characterMeshes: THREE.Mesh[] = []

export async function initSceneGenesis9(character: DazCharacter) {
   camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
   // Initial camera position will be updated after character is loaded
   camera.position.set(0, 200, 200)
   camera.lookAt(0, 200, 0)

   scene = new THREE.Scene()
   scene.background = new THREE.Color(0x87ceeb) // Sky blue background

   const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
   scene.add(ambientLight)
   const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
   directionalLight.position.set(5, 10, 7.5)
   scene.add(directionalLight)

   characterMeshes.length = 0 // Clear previous meshes

   for (const nodeRef of character.nodesRefs.values()) {
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

                     // const randomColor = Math.random() * 0xffffff // Random color for each mesh
                     const randomColor = 0xdddddd // Random color for each mesh
                     const material = new THREE.MeshStandardMaterial({
                        color: randomColor, // 0xdddddd
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

      // Clean up camera controller to prevent memory leaks
      if (cameraController) cameraController.dispose()

      renderer.dispose() // Dispose old renderer
   }

   renderer = new THREE.WebGLRenderer({ antialias: true })
   renderer.setPixelRatio(window.devicePixelRatio)
   renderer.setSize(window.innerWidth, window.innerHeight)
   renderer.setAnimationLoop(animate)
   document.body.appendChild(renderer.domElement)

   // Initialize camera controller for scene navigation
   cameraController = new CameraController(camera, renderer.domElement)

   // Frame the character to ensure it's fully visible
   frameCharacter()

   window.addEventListener('resize', onWindowResize)
}

/** Frames the character in the camera view by calculating bounds and positioning the camera to ensure the entire character is visible. */
function frameCharacter() {
   if (characterMeshes.length === 0) return

   // Create a bounding box that encompasses all character meshes
   const boundingBox = new THREE.Box3()
   characterMeshes.forEach((mesh) => {
      mesh.geometry.computeBoundingBox()
      boundingBox.expandByObject(mesh)
   })

   // Calculate the center and size of the bounding box
   const center = new THREE.Vector3()
   boundingBox.getCenter(center).add(new THREE.Vector3(0, 50, 0)) // Adjust for character height

   const size = new THREE.Vector3()
   boundingBox.getSize(size)

   // Update the orbit controls target to the center of the character
   if (cameraController) cameraController.controls.target.copy(center)
}

function onWindowResize() {
   if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
   }
}

function animate() {
   if (renderer && scene && camera) {
      if (cameraController) cameraController.update()
      characterMeshes.forEach((mesh) => void (mesh.rotation.y += 0.003))
      renderer.render(scene, camera)
   }
}
