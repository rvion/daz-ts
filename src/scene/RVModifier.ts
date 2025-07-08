import { DazModifierDef } from '../core/DazModifierDef.js'
import { DazModifierInst } from '../core/DazModifierInst.js'
import { GLOBAL } from '../DI.js'
import { string_DazUrl } from '../spec.js'
import { Maybe } from '../types.js'
import { RVChannel } from './RVChannel.js'
import { RVNode } from './RVNode.js'
import { RVScene } from './RVScene.js'

export class RVModifier extends RVNode {
   findParentFigure_orCrash() {
      let at: Maybe<RVNode> = this
      while (at) {
         if (at instanceof RVNode && at instanceof GLOBAL.RVFigure) return at
         at = at.parent
      }
      throw new Error(`Modifier ${this.dazId} must be attached to a figure`)
   }

   get icon(): string_DazUrl | undefined {
      return (
         this.dModDef.data.presentation?.icon_large ?? //
         this.dModDef.data.presentation?.icon_small
      )
   }

   override emoji: string = '🛠️'
   constructor(
      public readonly sceneDaz: RVScene,
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
