import type { PathInfo } from '../fs/PathInfo.js'
import { DazMgr } from '../mgr.js'
import { $$, $$dson, $$dson_figure, string_DazId } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { DsonFile } from './_DsonFile.js'

export class DazFileFigure extends DsonFile<$$dson_figure> {
   emoji = '👤'
   kind = 'character'

   static async init(mgr: DazMgr, meta: PathInfo, dson: $$dson): Promise<DazFileFigure> {
      const json = await check_orCrash($$.dson_figure, dson, dson.asset_info.id)
      const self = new DazFileFigure(mgr, meta, json)
      self.printHeader()
      mgr.figuresByDazId.set(self.dazId, self)
      mgr.figuresByRelPath.set(self.relPath, self)
      return self
   }

   async resolve(): Promise<void> {
      // init
      if (this.data.geometry_library) {
         for (const geometryInfData of this.data.geometry_library) {
            await this.hydrateGeometry(geometryInfData)
         }
      }
      if (this.data.node_library) {
         for (const nodeInfData of this.data.node_library) {
            await this.hydrateNode(nodeInfData) // Use hydrateNodeInf for node_inf types
         }
      }
      if (this.data.modifier_library) {
         for (const modifierInfData of this.data.modifier_library) {
            await this.hydrateModifier(modifierInfData)
         }
      }
   }

   get availableGeometryIds(): string_DazId[] {
      return Array.from(this.geometries.keys())
   }
}
