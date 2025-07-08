import { $$material_instance } from '../spec.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVNode } from './RVNode.js'

export class RVMaterialInstance extends RVNode {
   override emoji: string = '🎨'
   constructor(
      public readonly sceneDaz: RuntimeScene,
      public readonly data: $$material_instance,
   ) {
      super(data.id, '🔴⁉️', '🔴⁉️', data.id)
   }
}
