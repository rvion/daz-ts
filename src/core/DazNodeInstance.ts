import { DazMgr } from '../mgr.js'
import { $$node_instance, string_DazId } from '../spec.js' // Changed from $$node to $$node_ref
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'

export class DazNodeInstance extends DazAbstraction<AnyDazAbstraction, $$node_instance> {
   // abstract stuff
   emoji = '🌳➡️' // Adjusted emoji to signify reference
   kind = 'node_ref' // Adjusted kind
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc

   // init
   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$node_instance): Promise<DazNodeInstance> {
      // Renamed and updated type
      const self = new DazNodeInstance(mgr, parent, json) // Renamed
      // self.printHeader()
      if (self.data.geometries) {
         for (const geometryRefData of self.data.geometries) {
            // Renamed nodeData to geometryRefData for clarity
            await self.hydrateGeometryInstances(geometryRefData)
         }
      }

      return self
   }
}
