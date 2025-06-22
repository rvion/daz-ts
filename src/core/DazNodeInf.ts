import { DazMgr } from '../mgr.js'
import { $$node_inf, string_DazId } from '../spec.js'
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'

export class DazNodeInf extends DazAbstraction<AnyDazAbstraction, $$node_inf> {
   // abstract stuff
   emoji = '🌳ℹ️' // Emoji to signify information/definition
   kind = 'node_inf'
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc

   // init
   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$node_inf): Promise<DazNodeInf> {
      const self = new DazNodeInf(mgr, parent, json)
      self.printHeader()

      // If this node_inf has children (e.g., a skeleton), hydrate them
      if (self.data.children) {
         for (const childNodeData of self.data.children) {
            await self.hydrateNodeInf(childNodeData) // Recursive call for child nodes
         }
      }
      // TODO: Potentially hydrate other properties like formulas or specific extra channels if needed

      return self
   }

   // TODO: Add methods to access specific properties from node_inf if required,
   // e.g., get transformations, presentation details, etc.
}
