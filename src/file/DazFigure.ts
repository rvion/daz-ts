import { DazMgr } from '../mgr.js'
import { $$, $$dson, $$duf_figure } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DsonFile.js'

export class DazFigure extends DsonFile<$$duf_figure> {
   emoji = '👤'
   kind = 'character'

   static async init(mgr: DazMgr, meta: FileMeta, dson: $$dson): Promise<DazFigure> {
      const json = check_orCrash($$.duf_figure, dson, dson.asset_info.id)
      const self = new DazFigure(mgr, meta, json)
      self.printHeader()
      mgr.figuresByDazId.set(self.dazId, self)
      mgr.figuresByRelPath.set(self.relPath, self)

      // init
      // for (const nodeData of self.data.scene.nodes) await self.hydrateNode(nodeData)
      if (self.data.geometry_library) {
         for (const x of self.data.geometry_library) {
            await self.hydrateGeometryInf(x)
         }
      }

      return self
   }
}
