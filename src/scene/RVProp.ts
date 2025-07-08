import { DazNodeDef } from '../core/DazNodeDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { RVNode } from './RVNode.js'
import { RVScene } from './RVScene.js'

export class RVProp extends RVNode {
   constructor(
      public readonly sceneDaz: RVScene,
      public readonly dNodeDef: DazNodeDef,
      public readonly dNodeInst: DazNodeInst,
   ) {
      super(
         //
         dNodeInst.dazId,
         dNodeInst.relPath,
         dNodeDef.relPath,
         `Prop_${dNodeInst.dazId}`,
      )
   }
}
