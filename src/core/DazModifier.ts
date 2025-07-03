import { $$modifier, string_DazId } from '../spec.js'
import { DazAbstraction } from './_DazAbstraction.js'
import { DsonFile } from './DazFile.js'

export class DazModifier extends DazAbstraction<DsonFile, $$modifier> {
   get emoji() {
      return '🐄'
   }

   get kind() {
      return 'modifier'
   }

   get dazId(): string_DazId {
      return this.data.id
   }
}
