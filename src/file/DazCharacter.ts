import { DazMgr } from '../mgr.js'
import { $$, $$dson, $$duf_character } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DsonFile.js'

export class DazCharacter extends DsonFile<$$duf_character> {
   emoji = '👤'
   kind = 'character'

   static async init(mgr: DazMgr, meta: FileMeta, dson: $$dson): Promise<DazCharacter> {
      const json = check_orCrash($$.duf_wearable, dson, dson.asset_info.id)
      const self = new DazCharacter(mgr, meta, json)
      self.printHeader()
      mgr.charactersByDazId.set(self.dazId, self)
      mgr.charactersByRelPath.set(self.relPath, self)

      // init
      for (const nodeData of self.data.scene.nodes) await self.hydrateNode(nodeData)

      return self
   }
}
