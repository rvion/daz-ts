import * as THREE from 'three'
import { DazCharacter } from '../../core/DazFileCharacter.js'
// import { DazNodeRef } from '../../core/DazNodeRef.js'; // Not directly used in function signatures
import { DazFigure } from '../../core/DazFileFigure.js'
import { DazGeometryRef } from '../../core/DazGeometryRef.js'
import { $$point3d, $$point6d, asDazId } from '../../spec.js'
import { parseUrl } from '../../utils/parseDazUrl.js'

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
               const mesh = await createMeshFromGeometryRef(character, geometryRef)
               if (mesh) {
                  scene.add(mesh)
                  characterMeshes.push(mesh)
               }
            } catch (error) {
               console.error(
                  `Failed to create mesh for geometry ${geometryRef.dazId} (${geometryRef.data.name}):`,
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

async function createMeshFromGeometryRef(
   character: DazCharacter,
   geometryRef: DazGeometryRef,
): Promise<THREE.Mesh | null> {
   const urlParseResult = parseUrl(geometryRef.url)
   if (!urlParseResult || !urlParseResult.pathname || !urlParseResult.hash) {
      // Adjusted to use URL properties
      console.error(`Could not parse URL or get path/id_in_file from geometryRef URL: ${geometryRef.url}`)
      return null
   }

   // Extract path and ID from the parsed URL object
   // Pathname usually starts with a '/', remove it.
   // Hash usually starts with a '#', remove it.
   const dsfPath = urlParseResult.pathname.startsWith('/')
      ? urlParseResult.pathname.substring(1).replace(/%20/g, ' ')
      : urlParseResult.pathname.replace(/%20/g, ' ')

   const geometryIdInDsf = asDazId(
      urlParseResult.hash.startsWith('#') //
         ? urlParseResult.hash.substring(1)
         : urlParseResult.hash,
   )

   if (!dsfPath || !geometryIdInDsf) {
      console.error(`Could not extract dsfPath or geometryIdInDsf from URL: ${geometryRef.url}`)
      return null
   }

   const dsfFile = await character.mgr.loadFull_FromRelPath(dsfPath)

   if (!dsfFile || !('geometryInfs' in dsfFile) || !(dsfFile.geometryInfs instanceof Map)) {
      console.error(
         `Loaded file for ${dsfPath} (type: ${dsfFile?.constructor?.name}) does not contain a valid geometryInfs map.`,
      )
      return null
   }

   const geometryInf = (dsfFile as DazFigure).geometryInfs.get(geometryIdInDsf)

   if (!geometryInf) {
      console.error(`Geometry ID ${geometryIdInDsf} not found in DSF file ${dsfPath}`)
      if ((dsfFile as DazFigure).geometryInfs) {
         console.log(`Available geometry IDs in ${dsfPath}:`, Array.from((dsfFile as DazFigure).geometryInfs.keys()))
      }
      return null
   }

   if (!geometryInf.data.vertices?.values || !geometryInf.data.polylist?.values) {
      console.error(`Geometry data (vertices or polylist) missing for ${geometryIdInDsf} in ${dsfPath}`)
      return null
   }

   const verticesRaw = geometryInf.data.vertices.values
   const polylistRaw = geometryInf.data.polylist.values

   const threeVertices: number[] = []
   verticesRaw.forEach((v: $$point3d) => threeVertices.push(v[0], v[1], v[2]))

   const threeIndices: number[] = []
   polylistRaw.forEach((poly: $$point6d) => {
      // Assuming poly is [meta1, meta2, v0_idx, v1_idx, v2_idx, v3_idx] for a quad.
      // Daz Studio primarily uses quads. Triangulate quad (v0,v1,v2,v3) into (v0,v1,v2) and (v0,v2,v3).
      // Vertex indices from poly: poly[2], poly[3], poly[4], poly[5]
      threeIndices.push(poly[2], poly[3], poly[4]) // Triangle 1: (v0, v1, v2)
      threeIndices.push(poly[2], poly[4], poly[5]) // Triangle 2: (v0, v2, v3)
   })

   if (threeVertices.length === 0 || threeIndices.length === 0) {
      console.warn(`No vertices or indices processed for geometry ${geometryIdInDsf} from ${dsfPath}`)
      return null
   }

   const geometry = new THREE.BufferGeometry()
   geometry.setAttribute('position', new THREE.Float32BufferAttribute(threeVertices, 3))
   geometry.setIndex(threeIndices)
   geometry.computeVertexNormals()

   const material = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      wireframe: false,
      side: THREE.DoubleSide,
   })

   return new THREE.Mesh(geometry, material)
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
      characterMeshes.forEach((mesh) => {
         mesh.rotation.y += 0.003
      })
      renderer.render(scene, camera)
   }
}
