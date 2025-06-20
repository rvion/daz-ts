import { DazMgr } from '../mgr.js'
import { Dson } from '../spec.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DsonFile.js'

export class AnyDsonFile extends DsonFile<Dson> {
   emoji = '👤'

   get kind() {
      return this.data.asset_info.type
   }

   static async init(mgr: DazMgr, meta: FileMeta, json: Dson): Promise<AnyDsonFile> {
      const self = new AnyDsonFile(mgr, meta, json)
      return self
   }
}
