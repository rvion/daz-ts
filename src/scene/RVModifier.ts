import { DazModifierDef } from '../core/DazModifierDef.js'
import { DazModifierInst } from '../core/DazModifierInst.js'
import { GLOBAL } from '../DI.js'
import { Maybe } from '../types.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVChannel } from './RVChannel.js'
import { RVNode } from './RVNode.js'

export class RVModifier extends RVNode {
   findParentFigure_orCrash() {
      let at: Maybe<RVNode> = this
      while (at) {
         if (at instanceof RVNode && at instanceof GLOBAL.RVFigure) return at
         at = at.parent
      }
      throw new Error(`Modifier ${this.dazId} must be attached to a figure`)
   }
   override emoji: string = '🛠️'
   constructor(
      public readonly sceneDaz: RuntimeScene,
      public readonly dModDef: DazModifierDef,
      public readonly dModInst: DazModifierInst,
   ) {
      super(
         //
         dModDef.dazId,
         dModInst.relPath,
         dModDef.relPath,
         dModDef.data.name ?? dModDef.dazId,
      )
      if (dModDef.data.channel) {
         this.channels.value = new RVChannel(sceneDaz, dModDef.data.channel)
         // this.addChild(this.channel)
      }
   }
}
