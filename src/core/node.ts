import { DazMgr } from '../mgr.js'
import { $$ } from '../spec.js'
import { DazCharacter } from './DazCharacter.js'
import { DazWearable } from './DazWearable.js'

export class DazNode {
   constructor(
      public mgr: DazMgr,
      public definedIn: DazCharacter | DazWearable,
      public data: (typeof $$.node)['infer'],
   ) {
      //
   }
}
