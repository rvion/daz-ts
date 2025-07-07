import { $$modifier_instance, string_DazId } from '../spec.js'
import { string_RelPath } from '../types.js'
import { DazAbstraction } from './_DazAbstraction.js'
import { DsonFile } from './DazFile.js'
import { DazModifierDef } from './DazModifierDef.js'

export class DazModifierInst extends DazAbstraction<DsonFile, $$modifier_instance> {
   get emoji() { return '🐄➡️' } // biome-ignore format: misc
   get kind() { return 'modifier' } // biome-ignore format: misc
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   get relPath(): string_RelPath { return this.source.relPath } // biome-ignore format: misc
   async resolveDef(): Promise<DazModifierDef> {
      return this.mgr.resolveModifierDef(this.data.url, this.source)
   }
}
