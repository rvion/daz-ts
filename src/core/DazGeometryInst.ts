import { DazMgr } from '../mgr.js'
import { $$geometry_instance, string_DazId, string_DazUrl } from '../spec.js'
import { bang } from '../utils/assert.js'
import { fmtDazUrl } from '../utils/fmt.js'
import { parseDazUrl } from '../utils/parseDazUrl.js' // Changed to crash-first version
import { DazAbstraction } from './_DazAbstraction.js'
import { DsonFile } from './DazFile.js'
import { DazFileFigure } from './DazFileFigure.js' // DazFigure is used by mgr.loadDazFigureByRelPath_orCrash implicitly, but keep for clarity if needed by other parts or for type safety
import { DazGeometryDef } from './DazGeometryDef.js'
import { DazNodeInst } from './DazNodeInst.js'

export class DazGeometryInst extends DazAbstraction<DsonFile, $$geometry_instance> {
   emoji = '🔺'
   kind = 'geometry_ref'
   get dazId(): string_DazId {
      return bang(this.data.id)
   }
   override get summary(): string {
      return `${fmtDazUrl(this.data.url)}`
   }
   get url(): string_DazUrl {
      return this.data.url
   }

   constructor(
      mgr: DazMgr,
      source: DsonFile,
      data: $$geometry_instance,
      public parent: DazNodeInst,
   ) {
      super(mgr, source, data)
   }

   // get geometry(): DazGeometry | null {
   //    if (this._resolvedGeometryInf == null)
   //       throw new Error(`Geometry not yet resolved for ${this.dazId} (${this.url}). call resolve first.`)
   //    return this._resolvedGeometryInf
   // }

   private dGeoDef: DazGeometryDef | null = null
   async resolveDef(): Promise<DazGeometryDef> {
      // cached version first
      if (this.dGeoDef) return this.dGeoDef

      // parse the URL to get the asset ID and file path
      const xx = parseDazUrl(this.data.url)
      const dsfPath = xx.file_path
      const geometryIdInDsf = bang(xx.asset_id)
      const dazFigureFile: DazFileFigure = await this.mgr.loadDazFigureByRelPath_orCrash(dsfPath)
      const dGeoDef: DazGeometryDef | undefined = dazFigureFile.geometries.get(geometryIdInDsf)

      if (dGeoDef) {
         this.dGeoDef = dGeoDef
         return dGeoDef
      } else {
         const AvailableIds = dazFigureFile.availableGeometryIds.join(', ')
         const errMsg = `[DazGeometryRef] Geometry ID "${geometryIdInDsf}" not found in DazFigure "${dsfPath}". Available IDs: ${AvailableIds}`
         console.error(errMsg)
         throw new Error(errMsg)
      }
   }
}
