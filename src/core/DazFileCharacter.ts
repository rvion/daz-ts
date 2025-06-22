import { DazMgr } from '../mgr.js'
import { $$, $$dson, $$dson_character } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DsonFile.js'

export class DazCharacter extends DsonFile<$$dson_character> {
   emoji = '👤'
   kind = 'character'

   static async init(mgr: DazMgr, meta: FileMeta, dson: $$dson): Promise<DazCharacter> {
      const json = check_orCrash($$.dson_wearable, dson, dson.asset_info.id)
      const self = new DazCharacter(mgr, meta, json)
      self.printHeader()
      mgr.charactersByDazId.set(self.dazId, self)
      mgr.charactersByRelPath.set(self.relPath, self)

      // init
      if (self.data.scene?.nodes) {
         // scene might be optional or nodes might be
         for (const nodeData of self.data.scene.nodes) {
            await self.hydrateNodeRef(nodeData) // Changed from hydrateNode
         }
      }
      // if (self.data.node_library) {
      //    for (const nodeRefData of self.data.node_library) {
      //       await self.hydrateNodeRef(nodeRefData)
      //    }
      // }

      return self
   }
}
