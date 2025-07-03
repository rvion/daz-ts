import type { PathInfo } from '../fs/PathInfo.js'
import { DazMgr } from '../mgr.js'
import { $$, $$dson } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { DsonFile } from './_DsonFile.js'

export class DazFileWearable extends DsonFile {
   emoji = '👗'
   kind = 'wearable'
   static async init(mgr: DazMgr, meta: PathInfo, dson: $$dson): Promise<DazFileWearable> {
      const json = await check_orCrash($$.dson_wearable, dson, dson.asset_info.id)
      const self = new DazFileWearable(mgr, meta, json)
      self.printHeader()
      return self
   }

   // async resolve(): Promise<void> {}
}
