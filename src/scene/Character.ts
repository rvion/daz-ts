import * as THREE from 'three'
import { DazCharacter } from '../core/DazFileCharacter.js'
import { DazFilePose } from '../core/DazFilePose.js'

export class RVCharacter {
   public group: THREE.Group
   private meshes: THREE.Mesh[] = []
   private skeleton: THREE.Skeleton | null = null
   private skeletonHelper: THREE.SkeletonHelper | null = null
   private bones: Map<string, THREE.Bone> = new Map()

   constructor(private characterData: DazCharacter) {
      this.group = new THREE.Group()
      this.group.name = `Character_${characterData.dazId}`

      this.buildMeshes()
      this.buildSkeleton()
   }

   private buildMeshes(): void {
      if (!this.characterData.resolvedFigure) {
         console.warn(`[RVCharacter] No resolved figure for character ${this.characterData.dazId}`)
         this.createFallbackMesh()
         return
      }

      // Build meshes from character's node references
      for (const nodeRef of this.characterData.nodesRefs.values()) {
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
         console.warn(`[RVCharacter] No meshes created for character ${this.characterData.dazId}`)
         this.createFallbackMesh()
      }
   }

   private createMeshFromGeometryRef(geometryRef: any): THREE.Mesh | null {
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
         wireframe: false,
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
      const material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = 'FallbackMesh'
      mesh.position.y = 85 // Half height to place on ground
      mesh.castShadow = true
      mesh.receiveShadow = true

      this.meshes.push(mesh)
      this.group.add(mesh)
   }

   private buildSkeleton(): void {
      if (!this.characterData.resolvedFigure) return

      // Build skeleton from figure's node_inf data
      const rootBones: THREE.Bone[] = []

      for (const nodeInf of this.characterData.resolvedFigure.nodesInf.values()) {
         if (nodeInf.data.type === 'bone') {
            const bone = this.createBoneFromNodeInf(nodeInf)
            if (bone) {
               this.bones.set(nodeInf.dazId, bone)
               // If this bone has no parent in our bone map, it's a root bone
               if (!this.findParentBone(nodeInf)) {
                  rootBones.push(bone)
               }
            }
         }
      }

      if (rootBones.length > 0 && this.bones.size > 0) {
         this.skeleton = new THREE.Skeleton(Array.from(this.bones.values()))

         // Create skeleton helper for debugging
         if (rootBones[0]) {
            this.skeletonHelper = new THREE.SkeletonHelper(rootBones[0])
            this.skeletonHelper.visible = false // Hidden by default
            this.group.add(this.skeletonHelper)
         }
      }
   }

   private createBoneFromNodeInf(nodeInf: any): THREE.Bone | null {
      const bone = new THREE.Bone()
      bone.name = nodeInf.data.name || nodeInf.dazId

      // Set initial position/rotation from node data if available
      // This would need to be expanded based on your node_inf structure
      if (nodeInf.data.center_point) {
         const [x, y, z] = nodeInf.data.center_point
         bone.position.set(x, y, z)
      }

      return bone
   }

   private findParentBone(nodeInf: any): THREE.Bone | null {
      // This would need to be implemented based on your node hierarchy
      // For now, return null (all bones are root bones)
      return null
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
         console.warn(
            `[RVCharacter] Cannot apply pose: no skeleton available for character ${this.characterData.dazId}`,
         )
         return
      }

      for (const change of pose.changes) {
         this.applyPoseChange(change)
      }
   }

   private applyPoseChange(change: { url: string; value: number }): void {
      // Parse the pose URL to extract bone name and property
      // Example URL: "name://@selection/l_bigtoe2:?rotation/x/value"
      const urlMatch = change.url.match(/name:\/\/@selection\/([^:]+):\?([^\/]+)\/([^\/]+)\/value/)
      if (!urlMatch) return

      const [, boneName, property, axis] = urlMatch
      const bone = this.bones.get(boneName)
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
