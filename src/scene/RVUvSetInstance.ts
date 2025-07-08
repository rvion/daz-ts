import { $$uv_set_instance } from '../spec.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVNode } from './RVNode.js'

export class RVUvSetInstance extends RVNode {
   override emoji: string = '🌐'
   constructor(
      public readonly sceneDaz: RuntimeScene,
      public readonly data: $$uv_set_instance,
   ) {
      super(data.id, '🔴⁉️', '🔴⁉️', data.id)
   }
}
