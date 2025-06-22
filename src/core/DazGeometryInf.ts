import { DazMgr } from '../mgr.js'
import { $$geometry_inf, string_DazId } from '../spec.js'
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'
import type { DazNode } from './DazNode.js'

export class DazGeometryInf extends DazAbstraction<DazNode, $$geometry_inf> {
   emoji = '🔻'
   kind = 'geometry_inf'
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   override get summary(): string {
      const infos: string[] = []
      if (this.data.polylist) infos.push(`polylist:${this.data.polylist.count}`)
      if (this.data.vertices) infos.push(`vertices:${this.data.vertices.count}`)
      if (this.data.polygon_groups) infos.push(`groups:${this.data.polygon_groups.count}`)
      return `${infos.join(', ')}`
   }

   // init
   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$geometry_inf): Promise<DazGeometryInf> {
      const self = new DazGeometryInf(mgr, parent, json)
      self.printHeader()
      // await self.load()
      return self
   }

   // private load(): Promise<KnownDazFile> {
   //    return this.mgr.loadFull_FromRelPath(this.pathToFileContaintingGeometry)
   // }

   // get pathToFileContaintingGeometry(): string_RelPath {
   //    return getPathFromDazUrl(this.data.url)
   // }

   // get url(): string_DazUrl {
   //    return this.data.url
   // }
}
