import { DazStuff } from '../file/_DazStuff.js'
import { DazMgr } from '../mgr.js'
import { $$ } from '../spec.js'

export class DazNode {
   constructor(
      public mgr: DazMgr,
      public definedIn: DazStuff,
      public data: (typeof $$.node)['infer'],
   ) {
      //
   }
}
