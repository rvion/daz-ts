import { DsonFile } from '../file/_DsonFile.js'
import { DazMgr } from '../mgr.js'
import { $$ } from '../spec.js'

export class DazGeometry {
   constructor(
      public mgr: DazMgr,
      public definedIn: DsonFile,
      public data: (typeof $$.node)['infer'],
   ) {
      //
   }
}
