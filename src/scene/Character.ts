/** biome-ignore-all lint/style/noNonNullAssertion: ... */
import * as THREE from 'three'
import { DazCharacter } from '../core/DazFileCharacter.js'
import { DazFigure } from '../core/DazFileFigure.js'
import { DazFilePose } from '../core/DazFilePose.js'
import { DazGeometryRef } from '../core/DazGeometryRef.js'
import { DazNode } from '../core/DazNode.js'
import { asDazId, string_DazId } from '../spec.js'
import { ASSERT_, bang, NUMBER_OR_CRASH } from '../utils/assert.js'
import { getFallbackMaterial } from './misc.js'

export class RVCharacter {
   group: THREE.Group
   meshes: THREE.Mesh[] = []
   skeleton: THREE.Skeleton | null = null
   skeletonHelper: THREE.SkeletonHelper | null = null
   bones: Map<string_DazId, THREE.Bone> = new Map()
   boneHierarchy: Map<string, string[]> = new Map() // parent -> children mapping

   get figure_orCrash(): DazFigure { return this.character.figure_orCrash } // biome-ignore format: misc

   constructor(public readonly character: DazCharacter) {
      this.group = new THREE.Group()
      this.group.name = `Character_${character.dazId}`
      this.buildMeshes()
      this.buildSkeleton()

      this.DEBUG_BONES()
      ASSERT_(this.skeleton != null, 'skeleton should not be null after buildSkeleton')
      ASSERT_(this.skeletonHelper != null, 'skeletonHelper should not be null after buildSkeleton')
   }

   DEBUG_BONES(): void {
      const fbm = getFallbackMaterial()
      for (const bone of this.bones.values()) {
         const vec = new THREE.Vector3()
         bone.getWorldPosition(vec)
         const helper = new THREE.SphereGeometry(2, 8, 8)
         const mesh = new THREE.Mesh(helper, fbm)
         mesh.position.copy(vec)
         mesh.name = `BoneHelper_${bone.name || bone.uuid}`
         this.group.add(mesh)
      }
   }

   private buildMeshes(): void {
      if (!this.character.figure) {
         console.warn(`[RVCharacter] No resolved figure for character ${this.character.dazId}`)
         this.createFallbackMesh()
         return
      }

      // Build meshes from character's node references
      for (const nodeRef of this.character.nodeRefs.values()) {
         if (!nodeRef.geometryRefs) continue

         for (const geometryRef of nodeRef.geometryRefs.values()) {
            const mesh = this.createMeshFromGeometryRef(geometryRef)
            if (mesh) {
               this.meshes.push(mesh)
               this.group.add(mesh)
            }
         }
      }

      if (this.meshes.length === 0) {
         console.warn(`[RVCharacter] No meshes created for character ${this.character.dazId}`)
         this.createFallbackMesh()
      }
   }

   private createMeshFromGeometryRef(geometryRef: DazGeometryRef): THREE.Mesh | null {
      const resolvedInf = geometryRef.resolvedGeometryInf
      if (!resolvedInf) return null

      const vertices = resolvedInf.verticesForThree
      const indices = resolvedInf.indicesForThree

      if (!vertices || !indices || vertices.length === 0 || indices.length === 0) {
         return null
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geometry.setIndex(indices)
      geometry.computeVertexNormals()

      const material = new THREE.MeshStandardMaterial({
         color: 0xdddddd,
         wireframe: true,
         transparent: true,
         opacity: 0.3,
         side: THREE.DoubleSide,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = `Mesh_${geometryRef.dazId}`
      mesh.castShadow = true
      mesh.receiveShadow = true

      return mesh
   }

   private createFallbackMesh(): void {
      const geometry = new THREE.BoxGeometry(50, 170, 30) // Approximate human proportions in cm
      const material = getFallbackMaterial()
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = 'FallbackMesh'
      mesh.position.y = 85 // Half height to place on ground
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.meshes.push(mesh)
      this.group.add(mesh)
   }

   private buildSkeleton(): void {
      // Build skeleton from figure's node_inf data
      const rootBones: THREE.Bone[] = []
      const figureNodes = [...this.figure_orCrash.nodes.values()]
      console.log(`❓ ---- buildSkeleton (${figureNodes.length} nodes)`)

      // Store absolute positions for relative calculation
      const absolutePositions = new Map<string, THREE.Vector3>()

      // ----- First pass: create all bones and store absolute positions -----
      for (const node of figureNodes) {
         if (node.data.type === 'bone') {
            const bone = this.createBoneFromNodeInf(node)
            this.bones.set(node.dazId, bone)

            // Store the absolute position for later relative calculation
            absolutePositions.set(node.dazId, bone.position.clone())
         } else console.log(`[buildSkeleton.fstPass] node '${node.dazId}' is not a bone => skipping`)
      }

      // ----- Second pass: build hierarchy and calculate relative positions -----
      for (const node of figureNodes) {
         if (node.data.type !== 'bone') {
            console.log(`[buildSkeleton.sndPass] node '${node.dazId}' is not a bone => skipping`)
            continue
         }
         const bone = bang(this.bones.get(node.dazId), `[🔶] bone not found !`)
         const parent = node.parent_orCrash
         if (parent.type !== 'bone') {
            console.log(`🔶SKIPPING] parent ${parent?.type}`)
            rootBones.push(bone)
            // Root bones keep their absolute position
            continue
         }

         const parentBone = this.bones.get(parent.dazId)
         if (parentBone == null) throw new Error(`Parent bone ${parent.dazId} not found for ${node.dazId}`)

         // Calculate relative position: child_absolute - parent_absolute
         const childAbsPos = bang(absolutePositions.get(node.dazId), `absolute position not found for ${node.dazId}`)
         const parentAbsPos = bang(
            absolutePositions.get(parent.dazId),
            `absolute position not found for ${parent.dazId}`,
         )
         const relativePos = childAbsPos.clone().sub(parentAbsPos)

         // Set the relative position before adding to parent
         bone.position.copy(relativePos)

         // Add to parent bone
         parentBone.add(bone)

         // Index the hierarchy
         const parentId = node.parentId_orCrash
         if (!this.boneHierarchy.has(parentId)) this.boneHierarchy.set(parentId, [])
         bang(this.boneHierarchy.get(parentId)).push(node.dazId)
      }

      ASSERT_(rootBones.length > 0 && this.bones.size > 0, 'not enough bones or root bones found')
      this.skeleton = new THREE.Skeleton(Array.from(this.bones.values()))

      // Create skeleton helper for debugging
      this.skeletonHelper = new THREE.SkeletonHelper(rootBones[0])
      this.skeletonHelper.visible = true // Visible by default
      this.group.add(this.skeletonHelper)
   }

   private createBoneFromNodeInf(node: DazNode): THREE.Bone {
      const bone = new THREE.Bone()
      bone.name = node.data.name || node.dazId

      // Set initial position/rotation from node data if available
      // This would need to be expanded based on your node_inf structure
      if (node.data.center_point) {
         const chans = node.data.center_point
         ASSERT_(chans.length === 3, 'center_point must have exactly 3 channels (x, y, z)')
         ASSERT_(chans[0].id === 'x', `chanel name should be x. (${JSON.stringify(chans[0])})`)
         ASSERT_(chans[1].id === 'y', `chanel name should be y. (${JSON.stringify(chans[1])})`)
         ASSERT_(chans[2].id === 'z', `chanel name should be z. (${JSON.stringify(chans[2])})`)
         const x = NUMBER_OR_CRASH(chans[0].value, 'x must be a number')
         const y = NUMBER_OR_CRASH(chans[1].value, 'y must be a number')
         const z = NUMBER_OR_CRASH(chans[2].value, 'z must be a number')
         bone.position.set(x, y, z)
      }

      return bone
   }

   // Position and transformation methods
   setPosition(x: number, y: number, z: number): void {
      this.group.position.set(x, y, z)
   }

   get x(): number {
      return this.group.position.x
   }
   set x(value: number) {
      this.group.position.x = value
   }

   get y(): number {
      return this.group.position.y
   }
   set y(value: number) {
      this.group.position.y = value
   }

   get z(): number {
      return this.group.position.z
   }
   set z(value: number) {
      this.group.position.z = value
   }

   // Animation and pose methods
   applyPose(pose: DazFilePose): void {
      if (!this.skeleton) {
         console.warn(`[RVCharacter] Cannot apply pose: no skeleton available for character ${this.character.dazId}`)
         return
      }

      for (const change of pose.changes) {
         this.applyPoseChange(change)
      }
   }

   private applyPoseChange(change: { url: string; value: number }): void {
      // Parse the pose URL to extract bone name and property
      // Example URL: "name://@selection/l_bigtoe2:?rotation/x/value"
      const urlMatch = change.url.match(/name:\/\/@selection\/([^:]+):\?([^/]+)\/([^/]+)\/value/)
      if (!urlMatch) return

      const [, boneName, property, axis] = urlMatch
      const bone = this.bones.get(asDazId(boneName))
      if (!bone) return

      // Apply the transformation based on property and axis
      if (property === 'rotation') {
         const radians = (change.value * Math.PI) / 180 // Convert degrees to radians
         switch (axis) {
            case 'x':
               bone.rotation.x = radians
               break
            case 'y':
               bone.rotation.y = radians
               break
            case 'z':
               bone.rotation.z = radians
               break
         }
      }
      // Add support for translation, scale, etc. as needed
   }

   // Debug and utility methods
   toggleBoneHelperVisibility(): void {
      if (this.skeletonHelper) {
         this.skeletonHelper.visible = !this.skeletonHelper.visible
      }
   }

   get boneHelperVisible(): boolean {
      return this.skeletonHelper?.visible ?? false
   }

   set boneHelperVisible(visible: boolean) {
      if (this.skeletonHelper) {
         this.skeletonHelper.visible = visible
      }
   }

   private applyToStandardMaterials(fn: (mat: THREE.MeshStandardMaterial) => void): void {
      for (const mesh of this.meshes) {
         const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
         materials.forEach((mat) => mat instanceof THREE.MeshStandardMaterial && fn(mat))
      }
   }

   private getFirstStandardMaterial(): THREE.MeshStandardMaterial | null {
      if (this.meshes.length === 0) return null
      const materials = Array.isArray(this.meshes[0].material) ? this.meshes[0].material : [this.meshes[0].material]
      return (materials.find((mat) => mat instanceof THREE.MeshStandardMaterial) as THREE.MeshStandardMaterial) || null
   }

   toggleWireframe(): void {
      this.applyToStandardMaterials((mat) => (mat.wireframe = !mat.wireframe))
   }

   get wireframeEnabled(): boolean {
      return this.getFirstStandardMaterial()?.wireframe ?? false
   }

   set wireframeEnabled(enabled: boolean) {
      this.applyToStandardMaterials((mat) => (mat.wireframe = enabled))
   }

   toggleGhostMode(): void {
      this.applyToStandardMaterials((mat) => {
         mat.transparent = !mat.transparent
         mat.opacity = mat.transparent ? 0.3 : 1.0
      })
   }

   get ghostModeEnabled(): boolean {
      return this.getFirstStandardMaterial()?.transparent ?? false
   }

   set ghostModeEnabled(enabled: boolean) {
      this.applyToStandardMaterials((mat) => {
         mat.transparent = enabled
         mat.opacity = enabled ? 0.3 : 1.0
      })
   }

   get skeletonHierarchyString(): string {
      if (this.bones.size === 0) return 'No skeleton available'
      console.log(`🟢`, this.bones.size, 'bones')

      const lines = ['=== Skeleton Hierarchy ===']
      const visited = new Set<string>()
      const worldPos = new THREE.Vector3()

      // Find root bones efficiently
      const rootBones = [...this.bones.keys()].filter(
         (boneId) => ![...this.boneHierarchy.values()].some((children) => children.includes(boneId)),
      )
      console.log(`🟢 root bones: ${rootBones.map((rb) => rb).join(', ')}`)
      const logBone = (boneId: string, depth = 0): void => {
         if (visited.has(boneId)) return
         visited.add(boneId)

         const bone = this.bones.get(asDazId(boneId))
         if (!bone) return

         const indent = '  '.repeat(depth)
         const { x: lx, y: ly, z: lz } = bone.position
         bone.getWorldPosition(worldPos)
         const { x: wx, y: wy, z: wz } = worldPos

         lines.push(
            `${indent}${bone.name || boneId}: local(${lx.toFixed(2)}, ${ly.toFixed(2)}, ${lz.toFixed(2)}) world(${wx.toFixed(2)}, ${wy.toFixed(2)}, ${wz.toFixed(2)})`,
         )

         // Recursively log children
         this.boneHierarchy.get(boneId)?.forEach((childId) => logBone(childId, depth + 1))
      }

      rootBones.forEach((rootBoneId) => logBone(rootBoneId))
      const result = lines.join('\n')
      console.log(result)
      return result
   }

   update(): void {
      // Update animations, bone transformations, etc.
      // This could include automatic animations like breathing, idle movements
      this.meshes.forEach((mesh) => {
         mesh.rotation.y += 0.003 // Simple rotation for now
      })
   }

   dispose(): void {
      // Dispose geometries and materials
      for (const mesh of this.meshes) {
         mesh.geometry.dispose()
         if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose())
         } else {
            mesh.material.dispose()
         }
      }

      // Remove from parent
      if (this.group.parent) {
         this.group.parent.remove(this.group)
      }

      // Clear arrays
      this.meshes.length = 0
      this.bones.clear()
   }
}
