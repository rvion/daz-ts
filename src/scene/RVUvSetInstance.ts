import { $$uv_set_instance } from '../spec.js'
import { RVNode } from './RVNode.js'
import { RVScene } from './RVScene.js'

export class RVUvSetInstance extends RVNode {
   override emoji: string = '🌐'
   constructor(
      public readonly sceneDaz: RVScene,
      public readonly data: $$uv_set_instance,
   ) {
      super(data.id, '🔴⁉️', '🔴⁉️', data.id)
   }
}
