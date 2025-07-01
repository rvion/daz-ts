import { DazMgr } from '../mgr.js'
import { $$geometry, $$point3d, $$point5or6d, string_DazId } from '../spec.js'
import { bang } from '../utils/assert.js'
import { DazAbstraction } from './_DazAbstraction.js'
import { DsonFile } from './_DsonFile.js'

export class DazGeometry extends DazAbstraction<DsonFile, $$geometry> {
   emoji = '🔻'
   kind = 'geometry'
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   async resolve(): Promise<void> {}

   override get summary(): string {
      const infos: string[] = []
      if (this.data.polylist) infos.push(`polylist:${this.data.polylist.count}`)
      if (this.data.vertices) infos.push(`vertices:${this.data.vertices.count}`)
      if (this.data.polygon_groups) infos.push(`groups:${this.data.polygon_groups.count}`)
      return `${infos.join(', ')}`
   }

   // init
   static async init(mgr: DazMgr, parent: DsonFile, json: $$geometry): Promise<DazGeometry> {
      const self = new DazGeometry(mgr, parent, json)
      self.printHeader()
      // await self.load()
      return self
   }

   get verticesForThree(): number[] | null {
      if (!this.data.vertices?.values) {
         console.warn(`Vertices data missing for geometry_inf: ${this.dazId}`)
         return null
      }
      const threeVertices: number[] = []
      this.data.vertices.values.forEach((v: $$point3d) => threeVertices.push(v[0], v[1], v[2]))
      return threeVertices.length > 0 ? threeVertices : null
   }

   get indicesForThree(): number[] | null {
      if (!this.data.polylist?.values) {
         console.warn(`Polylist data missing for geometry_inf: ${this.dazId}`)
         return null
      }
      const threeIndices: number[] = []
      this.data.polylist.values.forEach((poly: $$point5or6d) => {
         // Assuming poly is [meta1, meta2, v0_idx, v1_idx, v2_idx, v3_idx] for a quad.
         // Daz Studio primarily uses quads. Triangulate quad (v0,v1,v2,v3) into (v0,v1,v2) and (v0,v2,v3).
         threeIndices.push(poly[2], poly[3], poly[4]) // Triangle 1: (v0, v1, v2)
         threeIndices.push(poly[2], poly[4], poly[5] ?? 0) // Triangle 2: (v0, v2, v3)
      })
      return threeIndices.length > 0 ? threeIndices : null
   }

   // #region Skinning

   getSkinWeightsForThree(
      // geometryId: string_DazId,
   ): {
      boneNames: string[]
      boneIndices: number[]
      boneWeights: number[]
   } | null {
      // Get skin data from the figure's modifier library
      const skinModifier = this.source.getSkinBindingModifier()
      if (!skinModifier) {
         console.warn(`❌ No SkinBinding modifier found for geometry: ${this.dazId}`)
         return null
      }

      const SKIN = bang(skinModifier.skin)
      const JOINTS = bang(SKIN.joints)

      // Check if this modifier applies to our geometry
      const geometryUrl = SKIN.geometry
      if (geometryUrl !== `#${this.dazId}`) {
         // if (!geometryUrl.includes(geometryId)) {
         console.warn(`SkinBinding modifier apply to "${geometryUrl}", not to requested: ${this.dazId}`)
         return null
      }

      const vertexCount = this.data.vertices?.count || 0
      if (vertexCount === 0) return null

      // Extract unique bone names and create bone index mapping
      const boneNames: string[] = []
      const boneNameToIndex = new Map<string, number>()

      for (const joint of JOINTS) {
         const boneName = joint.id
         if (!boneNameToIndex.has(boneName)) {
            boneNameToIndex.set(boneName, boneNames.length)
            boneNames.push(boneName)
         }
      }

      // Initialize arrays for Three.js skinning (4 influences per vertex max)
      const boneIndices = new Array(vertexCount * 4).fill(0)
      const boneWeights = new Array(vertexCount * 4).fill(0)

      // Process each joint's vertex weights
      for (const joint of JOINTS) {
         const boneName = joint.id
         const boneIndex = bang(boneNameToIndex.get(boneName))

         // some weird "figures" like hairs have no node_weights
         const NODE_WEIGHTS = bang(joint.node_weights)

         for (const [vertexIndex, weight] of NODE_WEIGHTS.values) {
            if (vertexIndex >= vertexCount) continue

            // Find an empty slot for this vertex (up to 4 influences)
            for (let i = 0; i < 4; i++) {
               const idx = vertexIndex * 4 + i
               if (boneWeights[idx] === 0) {
                  boneIndices[idx] = boneIndex
                  boneWeights[idx] = weight
                  break
               }
            }
         }
      }

      // Normalize weights for each vertex to ensure they sum to 1
      for (let v = 0; v < vertexCount; v++) {
         const baseIdx = v * 4
         let totalWeight = 0

         for (let i = 0; i < 4; i++) {
            totalWeight += boneWeights[baseIdx + i]
         }

         if (totalWeight > 0) {
            for (let i = 0; i < 4; i++) {
               boneWeights[baseIdx + i] /= totalWeight
            }
         }
      }

      return { boneNames, boneIndices, boneWeights }
   }
}
