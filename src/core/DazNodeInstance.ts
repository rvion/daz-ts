import { DazMgr } from '../mgr.js'
import { $$node_instance, string_DazId } from '../spec.js' // Changed from $$node to $$node_ref
import { parseDazUrl_ } from '../utils/parseDazUrl.js'
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'
import { DazGeometryInstance } from './DazGeometryInstance.js'

export class DazNodeInstance extends DazAbstraction<AnyDazAbstraction, $$node_instance> {
   // abstract stuff
   emoji = '🌳➡️' // Adjusted emoji to signify reference
   kind = 'node_ref' // Adjusted kind
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   get parent() { return parseDazUrl_(this.data.parent) } // biome-ignore format: misc
   get parent_in_place() { return parseDazUrl_(this.data.parent_in_place) } // biome-ignore format: misc
   get conform_target() { return parseDazUrl_(this.data.conform_target) } // biome-ignore format: misc

   geometries: DazGeometryInstance[] = []
   constructor(mgr: DazMgr, parent: AnyDazAbstraction, json: $$node_instance) {
      super(mgr, parent, json)

      for (const geometryInstance of this.data.geometries ?? []) {
         this.geometries.push(new DazGeometryInstance(mgr, this, geometryInstance))
      }
   }

   // // init
   // // 🔴🔴🔴🔴🔴 sceneNodes should also create their
   // static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$node_instance): Promise<DazNodeInstance> {
   //    // Renamed and updated type
   //    const self = new DazNodeInstance(mgr, parent, json) // Renamed
   //    // self.printHeader()
   //    if (self.data.geometries) {
   //       for (const geometryRefData of self.data.geometries) {
   //          // Renamed nodeData to geometryRefData for clarity
   //          await self.hydrateGeometryInstances(geometryRefData)
   //       }
   //    }

   //    return self
   // }
}
