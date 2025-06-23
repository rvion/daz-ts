import { DazMgr } from '../mgr.js'
import { $$geometry_ref, string_DazId, string_DazUrl } from '../spec.js'
import { fmtDazUrl } from '../utils/fmt.js'
import { getDazPathAndIdFromDazURL_orCrash } from '../utils/parseDazUrl.js' // Changed to crash-first version
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'
import { DazFigure } from './DazFileFigure.js' // DazFigure is used by mgr.loadDazFigureByRelPath_orCrash implicitly, but keep for clarity if needed by other parts or for type safety
import { DazGeometryInf } from './DazGeometry.js'

export class DazGeometryRef extends DazAbstraction<AnyDazAbstraction, $$geometry_ref> {
   emoji = '🔺'

   kind = 'geometry_ref'

   private _resolvedGeometryInf: DazGeometryInf | null = null

   get dazId(): string_DazId {
      return this.data.id
   }

   override get summary(): string {
      return `${fmtDazUrl(this.data.url)}`
   }

   get url(): string_DazUrl {
      return this.data.url
   }

   get resolvedGeometryInf(): DazGeometryInf | null {
      return this._resolvedGeometryInf
   }

   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$geometry_ref): Promise<DazGeometryRef> {
      const self = new DazGeometryRef(mgr, parent, json)
      self.printHeader()
      await self.loadAndResolve() // Changed from self.load()
      return self
   }

   private async loadAndResolve(): Promise<void> {
      const { srcPath: dsfPath, idInFile: geometryIdInDsf } = getDazPathAndIdFromDazURL_orCrash(this.data.url)
      const dazFigureFile: DazFigure = await this.mgr.loadDazFigureByRelPath_orCrash(dsfPath)
      const geomInf = dazFigureFile.geometries.get(geometryIdInDsf)

      if (geomInf) {
         this._resolvedGeometryInf = geomInf
      } else {
         const AvailableIds = dazFigureFile.availableGeometryIds.join(', ')
         const errMsg = `[DazGeometryRef] Geometry ID "${geometryIdInDsf}" not found in DazFigure "${dsfPath}". Available IDs: ${AvailableIds}`
         console.error(errMsg)
      }
   }
}
