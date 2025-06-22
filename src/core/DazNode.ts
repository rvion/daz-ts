import { DazMgr } from '../mgr.js'
import { $$node, string_DazId } from '../spec.js'
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'

export class DazNode extends DazAbstraction<AnyDazAbstraction, $$node> {
   // abstract stuff
   emoji = '🌳'
   kind = 'node'
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc

   // init
   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$node): Promise<DazNode> {
      const self = new DazNode(mgr, parent, json)
      self.printHeader()
      if (self.data.geometries) {
         for (const nodeData of self.data.geometries) {
            await self.hydrateGeometryRef(nodeData)
         }
      }

      return self
   }
}
