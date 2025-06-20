import { KnownDazFile } from '../file/_DsonFile.js'
import { DazMgr } from '../mgr.js'
import { getPathFromDazUrl } from '../path/resolveFile.js'
import { DazGeometryData, string_DazId, string_DazUrl } from '../spec.js'
import { string_RelPath } from '../types.js'
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'
import type { DazNode } from './DazNode.js'

export type HasGeometry = DazNode

export class DazGeometry extends DazAbstraction<HasGeometry, DazGeometryData> {
   // abstract stuff
   emoji = '🔺'
   kind = 'geometry'
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc

   // init
   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: DazGeometryData): Promise<DazGeometry> {
      const self = new DazGeometry(mgr, parent, json)
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
