import { $$material_instance } from '../spec.js'
import { RVNode } from './RVNode.js'
import { RVScene } from './RVScene.js'

export class RVMaterialInstance extends RVNode {
   override emoji: string = '🎨'
   constructor(
      public readonly sceneDaz: RVScene,
      public readonly data: $$material_instance,
   ) {
      super(data.id, '🔴⁉️', '🔴⁉️', data.id)
   }
}
