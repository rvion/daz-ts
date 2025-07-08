import { DazGeometryDef } from '../core/DazGeometryDef.js'
import { DazGeometryInst } from '../core/DazGeometryInst.js'
import { bang } from '../utils/assert.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVNode } from './RVNode.js'

export class RVGeometryInstance extends RVNode {
   override emoji: string = '📐'
   constructor(
      public readonly sceneDaz: RuntimeScene,
      public readonly dGeoInst: DazGeometryInst,
      public readonly dGeoDef: DazGeometryDef,
   ) {
      super(
         //
         bang(dGeoInst.data.id),
         dGeoInst.source.relPath,
         dGeoDef.source.relPath,
         bang(dGeoInst.data.id),
      )
   }
}
