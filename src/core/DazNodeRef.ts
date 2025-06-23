import { DazMgr } from '../mgr.js'
import { $$node_ref, string_DazId } from '../spec.js' // Changed from $$node to $$node_ref
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'

export class DazNodeRef extends DazAbstraction<AnyDazAbstraction, $$node_ref> {
   // abstract stuff
   emoji = '🌳➡️' // Adjusted emoji to signify reference
   kind = 'node_ref' // Adjusted kind
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc

   // init
   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$node_ref): Promise<DazNodeRef> {
      // Renamed and updated type
      const self = new DazNodeRef(mgr, parent, json) // Renamed
      // self.printHeader()
      if (self.data.geometries) {
         for (const geometryRefData of self.data.geometries) {
            // Renamed nodeData to geometryRefData for clarity
            await self.hydrateGeometryRef(geometryRefData)
         }
      }

      return self
   }
}
