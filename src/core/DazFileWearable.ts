import type { PathInfo } from '../fs/PathInfo.js'
import { DazMgr } from '../mgr.js'
import { $$, $$dson, $$dson_wearable } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { DsonFile } from './_DsonFile.js'

export class DazWearable extends DsonFile<$$dson_wearable> {
   emoji = '👗'
   kind = 'wearable'
   static async init(mgr: DazMgr, meta: PathInfo, dson: $$dson): Promise<DazWearable> {
      const json = check_orCrash($$.dson_wearable, dson, dson.asset_info.id)
      const self = new DazWearable(mgr, meta, json)
      self.printHeader()
      mgr.wearablesByDazId.set(self.dazId, self)
      mgr.wearablesByRelPath.set(self.relPath, self)

      // init
      if (self.data.scene?.nodes) {
         // scene or nodes might be optional
         for (const nodeRefData of self.data.scene.nodes) {
            await self.hydrateNodeRef(nodeRefData) // Changed from hydrateNode
         }
      }
      if (self.data.node_library) {
         for (const nodeRefData of self.data.node_library) {
            await self.hydrateNodeRef(nodeRefData)
         }
      }

      return self
   }
}
