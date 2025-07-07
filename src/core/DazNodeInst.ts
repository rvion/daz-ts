import { DazMgr } from '../mgr.js'
import { $$node_instance, string_DazId } from '../spec.js' // Changed from $$node to $$node_ref
import { string_RelPath } from '../types.js'
import { parseDazUrl_ } from '../utils/parseDazUrl.js'
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'
import { DsonFile } from './DazFile.js'
import { DazGeometryInst } from './DazGeometryInst.js'
import { DazNodeDef } from './DazNodeDef.js'

export class DazNodeInst extends DazAbstraction<AnyDazAbstraction, $$node_instance> {
   // abstract stuff
   emoji = '🌳➡️' // Adjusted emoji to signify reference
   kind = 'node_ref' // Adjusted kind
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   get parent() { return parseDazUrl_(this.data.parent) } // biome-ignore format: misc
   get parent_in_place() { return parseDazUrl_(this.data.parent_in_place) } // biome-ignore format: misc
   get conform_target() { return parseDazUrl_(this.data.conform_target) } // biome-ignore format: misc
   get relPath(): string_RelPath {
      return this.file.relPath
   }

   geometries: DazGeometryInst[] = []
   constructor(
      mgr: DazMgr,
      public readonly file: DsonFile,
      json: $$node_instance,
   ) {
      super(mgr, file, json)

      for (const geometryInstance of this.data.geometries ?? []) {
         this.geometries.push(new DazGeometryInst(mgr, file, geometryInstance, this))
      }
   }

   async resolveDef(): Promise<DazNodeDef> {
      return this.mgr.resolveNodeDef(this.data.url, this.file)
   }
}
