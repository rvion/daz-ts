import { DsonFile } from '../file/_DsonFile.js'
import { DazMgr } from '../mgr.js'
import { $$, string_DazId } from '../spec.js'

export class DazNode {
   get id(): string_DazId {
      return this.data.id
   }

   constructor(
      public mgr: DazMgr,
      public definedIn: DsonFile,
      public data: (typeof $$.node)['infer'],
   ) {
      //
   }
}
