/** biome-ignore-all lint/style/noNonNullAssertion: ... */
import * as THREE from 'three'
import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { DazFileFigure } from '../core/DazFileFigure.js'
import { DazFilePose } from '../core/DazFilePose.js'
import { DazGeometryRef } from '../core/DazGeometryRef.js'
import { DazNode } from '../core/DazNode.js'
import { dazId, string_DazId } from '../spec.js'
import { Maybe } from '../types.js'
import { ASSERT_, bang, NUMBER_OR_CRASH } from '../utils/assert.js'
import { getFallbackMaterial } from './misc.js'

export class RVCharacter {
   group: THREE.Group
   meshes: (THREE.Mesh | THREE.SkinnedMesh)[] = []
   skeleton: THREE.Skeleton | null = null
   skeletonHelper: THREE.SkeletonHelper | null = null
   bones: Map<string_DazId, THREE.Bone> = new Map()
   boneHierarchy: Map<string, string[]> = new Map() // parent -> children mapping
   private boneNameToIndex: Map<string, number> = new Map() // bone name -> skeleton bone index

   // Debug getter for testing
   get boneNameToIndexMap(): ReadonlyMap<string, number> {
      return this.boneNameToIndex
   }

   get figure_orCrash(): DazFileFigure { return this.character.figure_orCrash } // biome-ignore format: misc

   constructor(public readonly character: DazFileCharacter) {
      this.group = new THREE.Group()
      this.group.name = `Character_${character.dazId}`

      // Build skeleton first so meshes can be properly bound
      this.buildSkeleton()
      this.buildMeshes()

      ASSERT_(this.skeleton != null, 'skeleton should not be null after buildSkeleton')
      ASSERT_(this.skeletonHelper != null, 'skeletonHelper should not be null after buildSkeleton')

      // Initial skeleton matrix update to ensure proper display
      this.updateSkeletonMatrices()
   }

   // DEBUG_BONES(): void {
   //    const fbm = getFallbackMaterial()
   //    for (const bone of this.bones.values()) {
   //       const vec = new THREE.Vector3()
   //       bone.getWorldPosition(vec)
   //       const helper = new THREE.SphereGeometry(2, 8, 8)
   //       const mesh = new THREE.Mesh(helper, fbm)
   //       mesh.position.copy(vec)
   //       mesh.name = `BoneHelper_${bone.name || bone.uuid}`
   //       this.group.add(mesh)
   //    }
   // }

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
   private createMeshFromGeometryRef(geometryRef: DazGeometryRef): THREE.Mesh | THREE.SkinnedMesh | null {
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

      const allowSkinning = true
      const allowRegular = false

      // Check if geometry has skin data and we have a skeleton
      if (allowSkinning && resolvedInf.hasSkinData(this.figure_orCrash) && this.skeleton) {
         const skinData = resolvedInf.getSkinWeightsForThree()
         if (skinData) {
            // Map bone names from skin data to skeleton bone indices
            const mappedBoneIndices = new Array(skinData.boneIndices.length)
            for (let i = 0; i < skinData.boneIndices.length; i++) {
               const boneNameIndex = skinData.boneIndices[i] // This is an index into boneNames array
               const boneName = skinData.boneNames[boneNameIndex]
               const skeletonBoneIndex = this.boneNameToIndex.get(boneName)
               if (skeletonBoneIndex === undefined) {
                  console.warn(`[RVCharacter] Bone '${boneName}' not found in skeleton, using index 0`)
                  mappedBoneIndices[i] = 0
               } else {
                  mappedBoneIndices[i] = skeletonBoneIndex
               }
            }

            // Add skinning attributes to geometry
            geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(mappedBoneIndices, 4))
            geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinData.boneWeights, 4))

            // Create skinned mesh
            const skinnedMesh = new THREE.SkinnedMesh(geometry, material)
            skinnedMesh.name = `SkinnedMesh_${geometryRef.dazId}`
            skinnedMesh.castShadow = true
            skinnedMesh.receiveShadow = true

            // Ensure skeleton is in bind pose before binding
            this.setSkeletonToBindPose()

            // Bind skeleton to mesh - this calculates the bind matrices automatically
            skinnedMesh.bind(this.skeleton)

            return skinnedMesh
         }
      } else if (allowRegular) {
         // Fallback to regular mesh if no skin data
         const mesh = new THREE.Mesh(geometry, material)
         mesh.name = `Mesh_${geometryRef.dazId}`
         mesh.castShadow = true
         mesh.receiveShadow = true

         return mesh
      }

      return null // Return null instead of throwing error
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
         }
      }

      // ----- Second pass: build hierarchy and calculate relative positions -----
      for (const node of figureNodes) {
         if (node.data.type !== 'bone') continue

         const bone = bang(this.bones.get(node.dazId), `bone not found for ${node.dazId}`)
         const parent = node.parent_orCrash

         if (parent.type !== 'bone') {
            // This is a root bone
            rootBones.push(bone)
            // Root bones keep their absolute position
            continue
         }

         const parentBone = this.bones.get(parent.dazId)
         if (!parentBone) {
            console.warn(`Parent bone ${parent.dazId} not found for ${node.dazId}, treating as root`)
            rootBones.push(bone)
            continue
         }

         // Calculate relative position: child_absolute - parent_absolute
         const childAbsPos = bang(absolutePositions.get(node.dazId), `absolute position not found for ${node.dazId}`)
         const parentAbsPos = bang(absolutePositions.get(parent.dazId), `missing absolute position for ${parent.dazId}`)
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

      // Create skeleton with bones in a consistent order
      const orderedBones = Array.from(this.bones.values())
      this.skeleton = new THREE.Skeleton(orderedBones)

      // Build bone name to index mapping for skinning
      this.skeleton.bones.forEach((bone, index) => {
         if (bone.name) {
            this.boneNameToIndex.set(bone.name, index)
         }
      })

      // Add root bones to the character group so they're positioned correctly
      for (const rootBone of rootBones) {
         this.group.add(rootBone)
      }

      // Create skeleton helper for debugging
      if (rootBones.length > 0) {
         this.skeletonHelper = new THREE.SkeletonHelper(rootBones[0])
         this.skeletonHelper.visible = true
         this.group.add(this.skeletonHelper)
      }
   }

   private assertXYZChanels(chans?: Maybe<{ id?: string; value?: unknown }[]>): { x: number; y: number; z: number } {
      if (chans == null) throw new Error('center_point must have channels')
      ASSERT_(chans.length === 3, 'center_point must have exactly 3 channels (x, y, z)')
      ASSERT_(chans[0].id === 'x', `channel name should be x. (${JSON.stringify(chans[0])})`)
      ASSERT_(chans[1].id === 'y', `channel name should be y. (${JSON.stringify(chans[1])})`)
      ASSERT_(chans[2].id === 'z', `channel name should be z. (${JSON.stringify(chans[2])})`)
      const x = NUMBER_OR_CRASH(chans[0].value, 'x must be a number')
      const y = NUMBER_OR_CRASH(chans[1].value, 'y must be a number')
      const z = NUMBER_OR_CRASH(chans[2].value, 'z must be a number')
      return { x, y, z }
   }

   private createBoneFromNodeInf(node: DazNode): THREE.Bone {
      const bone = new THREE.Bone()
      bone.name = node.data.name || node.dazId

      const _rotation = this.assertXYZChanels(node.data.rotation || [])
      if (_rotation.x !== 0 || _rotation.y !== 0 || _rotation.z !== 0) console.log(`[🔴] !!`, { _rotation })

      const _translation = this.assertXYZChanels(node.data.translation || [])
      if (_translation.x !== 0 || _translation.y !== 0 || _translation.z !== 0) console.log(`[🔴] !!`, { _translation })

      const _scale = this.assertXYZChanels(node.data.scale || [])
      if (_scale.x !== 1 || _scale.y !== 1 || _scale.z !== 1) console.log(`[🔴] !!`, JSON.stringify({ _scale }))
      // const _orientation = this.assertXYZChanels(node.data.orientation || [])
      // if (_orientation.x !== 0 || _orientation.y !== 0 || _orientation.z !== 0) console.log(`[🔴] !!`, { _orientation })

      // Set initial position/rotation from node data if available
      // This would need to be expanded based on your node_inf structure
      if (node.data.center_point) {
         const chans = node.data.center_point
         const { x, y, z } = this.assertXYZChanels(chans)
         bone.position.set(x, y, z)
      }

      return bone
   }

   private setSkeletonToBindPose(): void {
      if (!this.skeleton) return

      // For bind pose, we need to preserve the bone hierarchy positions
      // but reset any additional transformations (rotations, scales)
      for (const bone of this.skeleton.bones) {
         // Keep the position (which defines the bone hierarchy)
         // but reset rotation and scale to identity
         bone.rotation.set(0, 0, 0)
         bone.scale.set(1, 1, 1)
         bone.updateMatrix()
      }

      // Update all bone matrices to ensure proper bind pose
      for (const bone of this.skeleton.bones) {
         bone.updateMatrixWorld(true)
      }
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

      console.log(`[RVCharacter] Applying pose ${pose.dazId} to ${this.character.dazId}`)

      for (const change of pose.changes) {
         this.applyPoseChange(change)
      }

      // Update skeleton matrices after pose changes
      this.updateSkeletonMatrices()
   }

   private applyPoseChange(change: { url: string; value: number }): void {
      // Parse the pose URL to extract bone name and property
      // Example URL: "name://@selection/l_bigtoe2:?rotation/x/value"
      const urlMatch = change.url.match(/name:\/\/@selection\/([^:]+):\?([^/]+)\/([^/]+)\/value/)
      if (!urlMatch) {
         console.warn(`[RVCharacter] Could not parse pose URL: ${change.url}`)
         return
      }

      const [, boneName, property, axis] = urlMatch
      const bone = this.bones.get(dazId(boneName))
      if (!bone) {
         console.warn(`[RVCharacter] Bone not found: ${boneName}`)
         return
      }

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

         const bone = this.bones.get(dazId(boneId))
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

   private updateSkeletonMatrices(): void {
      if (!this.skeleton) return

      // Force update of all bone world matrices to keep SkeletonHelper synchronized
      for (const bone of this.skeleton.bones) {
         bone.updateMatrixWorld(true)
      }
   }

   update(): void {
      this.stupidAnimation2()

      // Update skeleton matrices to keep SkeletonHelper synchronized
      this.updateSkeletonMatrices()
   }

   private stupidAnimation1(): void {
      this.meshes.forEach((mesh) => {
         mesh.rotation.y += 0.003 // Simple rotation for now
      })
   }
   private stupidAnimation2(): void {
      const time = Date.now() * 0.003 // Convert to seconds
      const armAngle = Math.sin(time * 0.8) * 0.4 // Oscillate between -0.8 and 0.8 radians
      // Animate shoulder bones for arm raising/lowering
      const leftShoulder = this.bones.get(dazId('l_shoulder'))
      const rightShoulder = this.bones.get(dazId('r_shoulder'))
      if (leftShoulder) leftShoulder.rotation.z = armAngle
      if (rightShoulder) rightShoulder.rotation.z = -armAngle // Mirror for right arm
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
