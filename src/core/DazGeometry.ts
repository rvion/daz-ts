import { DazMgr } from '../mgr.js'
import { $$geometry, $$point3d, $$point6d, string_DazId } from '../spec.js' // Added $$point3d and $$point6d
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'

export class DazGeometryInf extends DazAbstraction<AnyDazAbstraction, $$geometry> {
   emoji = '🔻'
   kind = 'geometry_inf'
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   override get summary(): string {
      const infos: string[] = []
      if (this.data.polylist) infos.push(`polylist:${this.data.polylist.count}`)
      if (this.data.vertices) infos.push(`vertices:${this.data.vertices.count}`)
      if (this.data.polygon_groups) infos.push(`groups:${this.data.polygon_groups.count}`)
      return `${infos.join(', ')}`
   }

   // init
   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$geometry): Promise<DazGeometryInf> {
      const self = new DazGeometryInf(mgr, parent, json)
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
      this.data.polylist.values.forEach((poly: $$point6d) => {
         // Assuming poly is [meta1, meta2, v0_idx, v1_idx, v2_idx, v3_idx] for a quad.
         // Daz Studio primarily uses quads. Triangulate quad (v0,v1,v2,v3) into (v0,v1,v2) and (v0,v2,v3).
         threeIndices.push(poly[2], poly[3], poly[4]) // Triangle 1: (v0, v1, v2)
         threeIndices.push(poly[2], poly[4], poly[5]) // Triangle 2: (v0, v2, v3)
      })
      return threeIndices.length > 0 ? threeIndices : null
   }
}
