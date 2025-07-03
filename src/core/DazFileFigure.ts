import type { PathInfo } from '../fs/PathInfo.js'
import { DazMgr } from '../mgr.js'
import { $$, $$dson, string_DazId } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { DsonFile } from './_DsonFile.js'

export class DazFileFigure extends DsonFile {
   emoji = '👤'
   kind = 'character'

   static async init(mgr: DazMgr, meta: PathInfo, dson: $$dson): Promise<DazFileFigure> {
      const json = await check_orCrash($$.dson_figure, dson, dson.asset_info.id)
      const self = new DazFileFigure(mgr, meta, json)
      self.printHeader()
      return self
   }

   // async resolve(): Promise<void> {}

   get availableGeometryIds(): string_DazId[] {
      return Array.from(this.geometries.keys())
   }
}
