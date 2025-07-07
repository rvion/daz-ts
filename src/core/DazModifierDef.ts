import { $$modifier, string_DazId } from '../spec.js'
import { string_RelPath } from '../types.js'
import { DazAbstraction } from './_DazAbstraction.js'
import { DsonFile } from './DazFile.js'

export class DazModifierDef extends DazAbstraction<DsonFile, $$modifier> {
   get emoji() { return '🐄' } // biome-ignore format: misc
   get kind() { return 'modifier' } // biome-ignore format: misc
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   get relPath(): string_RelPath { return this.source.relPath } // biome-ignore format: misc
}
