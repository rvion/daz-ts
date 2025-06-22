import { DazMgr } from '../mgr.js'
import { $$geometry_ref, string_DazId, string_DazUrl } from '../spec.js'
import { string_RelPath } from '../types.js'
import { fmtDazUrl } from '../utils/fmt.js'
import { getPathFromDazUrl } from '../utils/parseDazUrl.js'
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'
import { KnownDazFile } from './_DsonFile.js'

export class DazGeometryRef extends DazAbstraction<AnyDazAbstraction, $$geometry_ref> {
   emoji = '🔺'
   kind = 'geometry_ref'
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   override get summary(): string {
      return `${fmtDazUrl(this.data.url)}`
   }

   // init
   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$geometry_ref): Promise<DazGeometryRef> {
      const self = new DazGeometryRef(mgr, parent, json)
      self.printHeader()
      await self.load()
      return self
   }

   private load(): Promise<KnownDazFile> {
      return this.mgr.loadFull_FromRelPath(this.pathToFileContaintingGeometry)
   }

   get pathToFileContaintingGeometry(): string_RelPath {
      return getPathFromDazUrl(this.data.url)
   }

   get url(): string_DazUrl {
      return this.data.url
   }
}
