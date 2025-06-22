import { DazMgr } from '../mgr.js'
import { $$dson } from '../spec.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DsonFile.js'

export class AnyDsonFile extends DsonFile<$$dson> {
   emoji = '👤'

   get kind() {
      return this.data.asset_info.type
   }

   static async init(mgr: DazMgr, meta: FileMeta, json: $$dson): Promise<AnyDsonFile> {
      const self = new AnyDsonFile(mgr, meta, json)
      return self
   }
}
