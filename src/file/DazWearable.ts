import { DazMgr } from '../mgr.js'
import { $$, Dson, DsonWearableData } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DsonFile.js'

export class DazWearable extends DsonFile<DsonWearableData> {
   emoji = '👗'
   kind = 'wearable'
   static async init(mgr: DazMgr, meta: FileMeta, dson: Dson): Promise<DazWearable> {
      const json = check_orCrash($$.duf_wearable, dson, dson.asset_info.id)
      const self = new DazWearable(mgr, meta, json)
      self.printHeader()
      mgr.wearablesByDazId.set(self.dazId, self)
      mgr.wearablesByRelPath.set(self.relPath, self)

      // init
      for (const nodeData of self.data.scene.nodes) await self.hydrateNode(nodeData)

      return self
   }
}
