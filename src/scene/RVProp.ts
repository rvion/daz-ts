import { DazNodeDef } from '../core/DazNodeDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVNode } from './RVNode.js'

export class RVProp extends RVNode {
   constructor(
      public readonly sceneDaz: RuntimeScene,
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
