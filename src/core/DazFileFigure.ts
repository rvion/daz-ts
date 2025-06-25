import { DazMgr } from '../mgr.js'
import { $$, $$dson, $$dson_figure, string_DazId } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { PathInfo } from '../walk.js'
import { DsonFile } from './_DsonFile.js'

export class DazFileFigure extends DsonFile<$$dson_figure> {
   emoji = '👤'
   kind = 'character'

   static async init(mgr: DazMgr, meta: PathInfo, dson: $$dson): Promise<DazFileFigure> {
      const json = check_orCrash($$.dson_figure, dson, dson.asset_info.id)
      const self = new DazFileFigure(mgr, meta, json)
      self.printHeader()
      mgr.figuresByDazId.set(self.dazId, self)
      mgr.figuresByRelPath.set(self.relPath, self)

      // init
      if (self.data.geometry_library) {
         for (const geometryInfData of self.data.geometry_library) {
            await self.hydrateGeometry(geometryInfData)
         }
      }
      if (self.data.node_library) {
         for (const nodeInfData of self.data.node_library) {
            await self.hydrateNode(nodeInfData) // Use hydrateNodeInf for node_inf types
         }
      }
      if (self.data.modifier_library) {
         for (const modifierInfData of self.data.modifier_library) {
            await self.hydrateModifier(modifierInfData)
         }
      }

      return self
   }

   get availableGeometryIds(): string_DazId[] {
      return Array.from(this.geometries.keys())
   }
}
