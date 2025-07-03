/** biome-ignore-all lint/style/noNonNullAssertion: ... */

import * as THREE from 'three'
import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { DazFilePose } from '../core/DazFilePose.js'
import { DazGeometryInstance } from '../core/DazGeometryInstance.js'
import { DazNode } from '../core/DazNode.js'
import { GLOBAL, getMgr } from '../DI.js'
import { ModifierDB } from '../scripts/parse-modifiers.js'
import { $$formula, $$morph, dazId, string_DazId, string_DazUrl } from '../spec.js'
import { ASSERT_, ASSERT_INSTANCE_OF, assertXYZChanels, bang, NUMBER_OR_CRASH } from '../utils/assert.js'
import { fmtAbsPath } from '../utils/fmt.js'
import { parseDazUrl } from '../utils/parseDazUrl.js'
import { simplifyObject } from '../utils/simplifyObject.js'
import { fallbackMesh, meshStandardMaterial1 } from './materials.js'

export class RVCharacter {
   group: THREE.Group
   meshes: (THREE.Mesh | THREE.SkinnedMesh)[] = []
   skeleton: THREE.Skeleton | null = null
   skeletonHelper: THREE.SkeletonHelper | null = null
   bones: Map<string_DazId, THREE.Bone> = new Map()
   boneHierarchy: Map<string, string[]> = new Map() // parent -> children mapping
   private boneNameToIndex: Map<string, number> = new Map() // bone name -> skeleton bone index
   private morphData: Map<string, { mesh: THREE.SkinnedMesh; influenceIndex: number }> = new Map()

   // Debug getter for testing
   get boneNameToIndexMap(): ReadonlyMap<string, number> {
      return this.boneNameToIndex
   }

   // get figure_orCrash(): DazFileFigure { return this.character.figure_orCrash } // biome-ignore format: misc

   static async createFromFile(dazCharacter: DazFileCharacter): Promise<RVCharacter> {
      const char = new RVCharacter(dazCharacter)
      return await char.load() // Ensure the character is fully loaded
   }

   private constructor(public readonly dazCharacter: DazFileCharacter) {
      this.group = new THREE.Group()
      this.group.name = `Character_${dazCharacter.dazId}`
   }

   async load(): Promise<this> {
      await this.buildSkeleton()
      await this.buildMeshes()

      ASSERT_(this.skeleton != null, 'skeleton should not be null after buildSkeleton')
      ASSERT_(this.skeletonHelper != null, 'skeletonHelper should not be null after buildSkeleton')

      // Initial skeleton matrix update to ensure proper display
      this.updateSkeletonMatrices()
      return this
   }

   private async buildMeshes(): Promise<void> {
      const figure = await this.dazCharacter.resolve()
      if (!figure) {
         console.warn(`[RVCharacter] No resolved figure for character ${this.dazCharacter.dazId}`)
         this.createFallbackMesh()
         return
      }

      // Build meshes from character's node references
      for (const nodeInstance of this.dazCharacter.sceneNodes.values()) {
         // if (!nodeInstance.geometryInstances) {
         //    console.warn('   - 🔶 no nodeInstance.geometryInstances')
         //    continue
         // }

         // for (const nodeInstance.geometries)
         for (const geometryRef of nodeInstance.geometries) {
            await geometryRef.resolve() // Ensure geometry is resolved before creating mesh
            const mesh = await this.createMeshFromGeometryInstance(geometryRef)
            if (mesh) {
               this.meshes.push(mesh)
               this.group.add(mesh)
            }
         }
      }

      if (this.meshes.length === 0) {
         console.warn(`[RVCharacter] No meshes created for character ${this.dazCharacter.dazId}`)
         this.createFallbackMesh()
      }
   }

   private async createMeshFromGeometryInstance(
      geometryInstance: DazGeometryInstance,
   ): Promise<THREE.Mesh | THREE.SkinnedMesh | null> {
      const dazGeometry = await geometryInstance.resolve()
      if (!dazGeometry) return null

      const vertices = dazGeometry.verticesForThree
      const indices = dazGeometry.indicesForThree
      if (!vertices?.length || !indices?.length) return null

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geometry.setIndex(indices)
      geometry.computeVertexNormals()

      const material = meshStandardMaterial1

      const allowSkinning = true
      const allowRegular = false

      // Check if geometry has skin data and we have a skeleton
      const figure = await this.dazCharacter.resolve()
      if (allowSkinning && figure.hasSkinData() && this.skeleton) {
         const skinData = dazGeometry.getSkinWeightsForThree()
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
            skinnedMesh.name = `SkinnedMesh_${geometryInstance.dazId}`
            skinnedMesh.castShadow = true
            skinnedMesh.receiveShadow = true

            // Ensure skeleton is in bind pose before binding
            this.setSkeletonToBindPose()

            // Bind skeleton to mesh - this calculates the bind matrices automatically
            skinnedMesh.bind(this.skeleton)

            return skinnedMesh
         }
      }
      //
      else if (allowRegular) {
         // Fallback to regular mesh if no skin data
         const mesh = new THREE.Mesh(geometry, material)
         mesh.name = `Mesh_${geometryInstance.dazId}`
         mesh.castShadow = true
         mesh.receiveShadow = true
         return mesh
      }

      return null // Return null instead of throwing error
   }

   private createFallbackMesh(): void {
      const mesh = fallbackMesh()
      this.meshes.push(mesh)
      this.group.add(mesh)
   }

   private async buildSkeleton(): Promise<void> {
      // Build skeleton from figure's node_inf data
      const rootBones: THREE.Bone[] = []
      const figure = await this.dazCharacter.resolve()
      const figureNodes = [...figure.nodes.values()]
      console.log(`❓ ---- buildSkeleton (${figureNodes.length} nodes)`)

      // Store absolute positions for relative calculation
      const absolutePositions = new Map<string, THREE.Vector3>()

      // ----- First pass: create all bones and store absolute positions -----
      for (const node of figureNodes) {
         if (node.data.type === 'bone') {
            const bone = this.createBoneFromDazBoneNode(node)
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

   private createBoneFromDazBoneNode(node: DazNode): THREE.Bone {
      ASSERT_(node.type === 'bone', `Node ${node.dazId} is not a bone type`)
      const bone = new THREE.Bone()
      bone.name = node.data.name || node.dazId

      const _rotation = assertXYZChanels(node.data.rotation || [])
      if (_rotation.x !== 0 || _rotation.y !== 0 || _rotation.z !== 0) console.log(`[🔴] !!`, { _rotation })

      const _translation = assertXYZChanels(node.data.translation || [])
      if (_translation.x !== 0 || _translation.y !== 0 || _translation.z !== 0) console.log(`[🔴] !!`, { _translation })

      const _scale = assertXYZChanels(node.data.scale || [])
      if (_scale.x !== 1 || _scale.y !== 1 || _scale.z !== 1) console.log(`[🔴] !!`, JSON.stringify({ _scale }))
      // const _orientation = assertXYZChanels(node.data.orientation || [])
      // if (_orientation.x !== 0 || _orientation.y !== 0 || _orientation.z !== 0) console.log(`[🔴] !!`, { _orientation })

      // Set initial position/rotation from node data if available
      // This would need to be expanded based on your node_inf structure
      if (node.data.center_point) {
         const chans = node.data.center_point
         const { x, y, z } = assertXYZChanels(chans)
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
      // checks
      if (!this.skeleton) return void console.warn(`[RVCharacter] Cannot apply pose: no skeleton available for character ${this.dazCharacter.dazId}`) // biome-ignore format: misc
      if (pose.changes == null || pose.changes.length === 0) return void console.warn(`[RVCharacter] No pose changes found in pose ${pose.dazId}`) // biome-ignore format: misc
      // apply pose
      console.log(`[RVCharacter] Applying pose ${pose.dazId} to ${this.dazCharacter.dazId}`)
      for (const change of pose.changes) this.applyPoseChange(change)
      this.updateSkeletonMatrices() // Update skeleton matrices after pose changes
   }

   private applyPoseChange(change: { url: string; value: number }): void {
      // Parse the pose URL to extract target and property
      // Example URL (transform): "name://@selection/l_bigtoe2:?rotation/x/value"
      // Example URL (morph):   "name://@selection#body_ctrl_HipBend:?value/value"
      const urlMatch = change.url.match(/name:\/\/@selection[/#]([^:]+):\?(.+)/)
      if (!urlMatch) {
         console.warn(`[RVCharacter] Could not parse pose URL: ${change.url}`)
         return
      }

      const [, targetName, query] = urlMatch
      const queryParts = query.split('/')

      // Handle transforms (rotation, translation, scale)
      if (queryParts.length === 3 && queryParts[2] === 'value') {
         const [property, axis] = queryParts
         const bone = this.bones.get(dazId(targetName))
         if (!bone) {
            console.warn(`[RVCharacter] Bone not found for transform: ${targetName}`)
            return
         }
         // Handle rotation
         if (property === 'rotation') {
            const radians = (change.value * Math.PI) / 180 // Convert degrees to radians
            if (axis === 'x') bone.rotateX(radians)
            else if (axis === 'y') bone.rotateY(radians)
            else if (axis === 'z') bone.rotateZ(radians)
            else throw new Error(`[RVCharacter] Unknown rotation axis: ${axis}`)
         }
         // Handle translation
         else if (property === 'translation') {
            const value = NUMBER_OR_CRASH(change.value, `Expected a number for translation, got: ${change.value}`)
            if (axis === 'x') bone.translateX(value)
            else if (axis === 'y') bone.translateY(value)
            else if (axis === 'z') bone.translateZ(value)
            else throw new Error(`[RVCharacter] Unknown translation axis: ${axis}`)
         }
         // scale
         // else if (property === 'scale') {
         //    const value = NUMBER_OR_CRASH(change.value, `Expected a number for scale, got: ${change.value}`)
         //    if (axis === 'x') bone.scale.x *= value
         //    else if (axis === 'y') bone.scale.y *= value
         //    else if (axis === 'z') bone.scale.z *= value
         //    else throw new Error(`[RVCharacter] Unknown scale axis: ${axis}`)
         // }
         // crash
         else throw new Error(`[RVCharacter] Unknown property for transform: ${property}`)
         // Add support for translation, scale, etc. as needed
         return
      }

      // Handle morphs/controller values
      if (queryParts.length === 2 && queryParts[0] === 'value' && queryParts[1] === 'value') {
         // This is a morph value. The targetName is the name of the modifier/controller.
         // We need to find the corresponding modifier and apply the value.
         // This functionality is not yet implemented.
         console.warn(
            `[RVCharacter] Morph/controller value for "${targetName}" not yet handled. Value: ${change.value}`,
         )

         // For now, let's check if it's a bone by any chance.
         const bone = this.bones.get(dazId(targetName))
         if (bone) {
            console.warn(
               `[RVCharacter] Target "${targetName}" is a bone, but the pose URL is for a morph value. This is ambiguous.`,
            )
         }
         return
      }

      console.warn(`[RVCharacter] Unknown pose URL format: ${change.url}`)
   }

   // TODO: filter for modifiers that are actually applicable to this character/figure
   get applicableModifiers(): ModifierDB {
      return getMgr().getModifierDB_orCrash()
   }

   // debug
   _body_ctrl_WaistTwist: number = 0
   get body_ctrl_WaistTwist(): number { return this._body_ctrl_WaistTwist } // biome-ignore format: misc
   set body_ctrl_WaistTwist(value: number) {
      this._body_ctrl_WaistTwist = NUMBER_OR_CRASH(value, 'Waist Twist must be a valid number')
      ASSERT_( this._body_ctrl_WaistTwist >= -2 && this._body_ctrl_WaistTwist <= 2, 'Waist Twist must be between -2 and 2') // biome-ignore format: misc
      void this.setModifierValue('body_ctrl_WaistTwist', value)
   }

   async setModifierValue(
      //
      modifierId: string,
      _value: number,
   ) {
      const mod = bang(this.applicableModifiers[modifierId], `❌ Modifier ${modifierId} not found in database`)

      console.log(`[🤠] A`)
      const FILE = await getMgr().loadFileFromAbsPath(mod.path)
      if (!FILE) {
         return void console.warn(`[RVCharacter] ❌ Morph file for ${modifierId} not found at ${mod.path}`)
      }
      // ensure it's a DazFileModifier and it has a morph
      console.log(`[🤠] B`)
      ASSERT_INSTANCE_OF(FILE, GLOBAL.DazFileModifier)

      console.log(`[🤠] C`, fmtAbsPath(mod.path))
      if (mod.morph) {
         // If morph already applied, just update influence
         if (this.morphData.has(modifierId)) {
            const data = this.morphData.get(modifierId)!
            data.mesh.morphTargetInfluences![data.influenceIndex] = _value
            return void console.log(`[RVCharacter] ✅ Morph ${modifierId} influence updated to ${_value}`)
         }

         // load file containing the modifier with the morph
         const morphData: $$morph | null = FILE.getMorphModifier()
         if (!morphData)
            return void console.warn(`[RVCharacter] ❌ Morph data for ${modifierId} not found in file ${mod.path}`)

         // print debug
         const debug = simplifyObject(morphData)
         console.log(`[🤠] ${JSON.stringify(debug)}`)

         // Get the parent URL of the modifier
         const parentUrl = mod.parent
         if (!parentUrl) {
            return void console.warn(`[RVCharacter] ❌ Modifier ${modifierId} is missing parent geometry reference.`)
         }

         // Get the target geometry ID from the parent URL
         const { asset_id: targetGeometryId } = parseDazUrl(parentUrl)
         if (!targetGeometryId) {
            return void console.warn(`[RVCharacter] ❌ Could not parse geometry ID from parent URL: ${parentUrl}`)
         }

         // Find the target geometry instance in the character's node instances
         let targetGeometryInstance: DazGeometryInstance | undefined
         for (const nodeInst of this.dazCharacter.sceneNodes.values()) {
            for (const geomInst of nodeInst.geometries) {
               const { asset_id } = parseDazUrl(geomInst.url)
               if (asset_id === targetGeometryId) {
                  targetGeometryInstance = geomInst
                  break
               }
            }
            if (targetGeometryInstance) break
         }
         if (!targetGeometryInstance) {
            return void console.warn(`[RVCharacter] ❌ Geometry instance for morph ${modifierId} (geomId: ${targetGeometryId}) not found.`) // biome-ignore format: misc
         } else
            console.log(`[🤠] Found target geometry instance for morph ${modifierId}:`, targetGeometryInstance?.dazId)

         // get the skinned mesh by its name
         const meshName = `SkinnedMesh_${targetGeometryInstance.dazId}`
         const targetMesh = this.meshes.find((m) => m.name === meshName) as THREE.SkinnedMesh | undefined
         if (!targetMesh) {
            return void console.warn(`[RVCharacter] ❌ Mesh for morph ${modifierId} not found: ${meshName}`)
         }

         const positionAttribute = targetMesh.geometry.attributes.position
         if (!positionAttribute) {
            return void console.warn(`[RVCharacter] ❌ Target mesh for morph has no position attribute.`)
         }

         const originalPositions = positionAttribute.array as Float32Array
         const morphedPositions = new Float32Array(originalPositions.length) // Create a separate array for deltas

         // IMPORTANT: The morph target stores the DELTA, not the final position.
         // Initialize with zeros.
         morphedPositions.fill(0)

         for (const [vertexIndex, dx, dy, dz] of morphData.deltas.values) {
            const i = vertexIndex * 3
            morphedPositions[i] = dx
            morphedPositions[i + 1] = dy
            morphedPositions[i + 2] = dz
         }

         const morphAttribute = new THREE.Float32BufferAttribute(morphedPositions, 3)
         morphAttribute.name = modifierId

         targetMesh.geometry.morphAttributes.position ??= []
         targetMesh.geometry.morphAttributes.position.push(morphAttribute)

         targetMesh.morphTargetInfluences ??= []
         const influenceIndex = targetMesh.geometry.morphAttributes.position.length - 1

         // Ensure influences array is long enough
         while (targetMesh.morphTargetInfluences.length <= influenceIndex) {
            targetMesh.morphTargetInfluences.push(0)
         }

         targetMesh.morphTargetInfluences[influenceIndex] = _value
         targetMesh.updateMorphTargets()
         this.morphData.set(modifierId, { mesh: targetMesh, influenceIndex })

         console.log(`[RVCharacter] ✅ Morph ${modifierId} applied with value ${_value}`)
      }

      const outputs: {
         [key: string]: {
            sum: number[]
            multiply: number[]
         }
      } = {}

      if (mod.formula) {
         //  scheme      file_path      property_path
         //    _|_       _____|_____          _|_
         //   /   \     /           \        /   \
         //        hips:morphs/Daphne#daphne?value
         //        \__/               \____/
         //          |                   |
         //      node_path           asset_id

         const formulas = bang(FILE.getFirstAndOnlyModifier_orCrash()?.formulas)
         for (const formula of formulas) {
            const result = this.evaluateFormula(formula)
            console.log(`          value=${result}`)

            // Parse the output URL
            const output = parseDazUrl(formula.output)
            const bone = this.bones.get(output.node_path!)
            if (!bone) {
               console.warn(`[RVCharacter] 🔴 Bone not found for modifier output: ${output.node_path!}`)
               continue
            }
            console.log(`[🤠] bone=${bone.name}`)
            const property = output.property_path
            if (property === 'rotation/x') bone.rotation.x = (result * Math.PI) / 180
            else if (property === 'rotation/y') bone.rotation.y = (result * Math.PI) / 180
            else if (property === 'rotation/z') bone.rotation.z = (result * Math.PI) / 180
            else if (property === 'translation/x') bone.position.x += result
            else if (property === 'translation/y') bone.position.y += result
            else if (property === 'translation/z') bone.position.z += result
            else if (property === 'scale/general') bone.scale.set(result, result, result)
            // 🔴 ⁉️ center point
            else if (property === 'center_point/x') bone.position.x += result
            else if (property === 'center_point/y') bone.position.y += result
            else if (property === 'center_point/z') bone.position.z += result
            // 🔴 ⁉️ end_point
            else if (property === 'end_point/x') bone.position.x += result
            else if (property === 'end_point/y') bone.position.y += result
            else if (property === 'end_point/z') bone.position.z += result
            else throw new Error(`[RVCharacter] ❌ Unknown property in modifier output: ${property}`)
         }
      }

      // per the doc
      const finalOutputs: { [key: string]: number } = {}
      for (const key in outputs) {
         const sum = outputs[key].sum.reduce((a, b) => a + b, 0)
         const mult = outputs[key].multiply.reduce((a, b) => a * b, 1)
         finalOutputs[key] = sum * mult
      }
      console.log(`[🤠] Final Outputs:`, finalOutputs)
   }

   getValueFromUrl(url: string_DazUrl): number {
      console.log(`[🧐] attempting to get the value at ${url}`)
      const res = parseDazUrl(url)
      console.log(`           ${JSON.stringify(res)}`)
      if (!res.node_path) throw new Error(`[RVCharacter] ❌ Invalid URL: ${url} - missing node_path`)
      // const node = this.getBone_orCrash(res.node_path)
      // node.

      return 0.5
   }

   // @ts-ignore
   private evaluateFormula(formula: $$formula /* value: number */): number {
      // ---------
      console.log(`     formula:`)
      for (const op of formula.operations) console.log(`        ${JSON.stringify(op)}`)
      console.log(`        => ${JSON.stringify(formula.output)}`)

      // ---------
      const stack: number[] = []
      for (const op of formula.operations) {
         switch (op.op) {
            case 'push':
               if ('url' in op) {
                  const value = this.getValueFromUrl(op.url)
                  stack.push(value)
               } else if ('val' in op) {
                  if (typeof op.val !== 'number') {
                     throw new Error(`[evaluateFormula] ❌ Invalid value in push operation: ${JSON.stringify(op)}`)
                  }
                  stack.push(op.val)
               }
               break
            case 'mult': {
               stack.push(bang(stack.pop()) * bang(stack.pop()))
               break
            }
            // @ts-ignore
            case 'add': {
               stack.push(bang(stack.pop()) + bang(stack.pop()))
               break
            }
            // @ts-ignore
            case 'sub': {
               stack.push(bang(stack.pop()) - bang(stack.pop()))
               break
            }
            // @ts-ignore
            case 'div':
               {
                  const a = bang(stack.pop())
                  const b = bang(stack.pop())
                  stack.push(b / a)
               }
               break
            default:
               throw new Error(`[evaluateFormula] ❌ Unknown formula operation: ${op.op}`)
         }
      }
      return stack[0]
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

   getBone_orCrash(boneId: string): THREE.Bone {
      const bone = this.bones.get(dazId(boneId))
      if (!bone) throw new Error(`Bone with id ${boneId} not found`)
      return bone
   }

   get availableBones(): string[] {
      return [...this.bones.keys()]
   }

   updateSkeletonMatrices(): void {
      if (!this.skeleton) return

      // Force update of all bone world matrices to keep SkeletonHelper synchronized
      for (const bone of this.skeleton.bones) {
         bone.updateMatrixWorld(true)
      }
   }

   update(): void {
      this.animation_waveArmsUpAndDown()
      this.updateSkeletonMatrices() // Update skeleton matrices to keep SkeletonHelper synchronized
   }

   // Simple rotation for now
   private animation_rotateOnItself = (): void => this.meshes.forEach((mesh) => void (mesh.rotation.y += 0.003))

   // great for testing that should morphs properly run
   private animation_waveArmsUpAndDown(): void {
      const time = Date.now() * 0.003 // Convert to seconds
      const armAngle = Math.sin(time * 0.8) + 0.4 /* * 0.4 */ // Oscillate between -0.8 and 0.8 radians
      this.getBone_orCrash(`l_shoulder`).rotation.z = armAngle // Animate shoulder bones for arm raising/lowering
      this.getBone_orCrash(`r_shoulder`).rotation.z = -armAngle // Mirror for right arm
   }

   dispose(): void {
      // Dispose geometries and materials
      for (const mesh of this.meshes) {
         mesh.geometry.dispose()
         if (Array.isArray(mesh.material)) mesh.material.forEach((mat) => mat.dispose())
         else mesh.material.dispose()
      }
      // Remove from parent
      if (this.group.parent) this.group.parent.remove(this.group)
      // Clear arrays
      this.meshes.length = 0
      this.bones.clear()
   }
}
