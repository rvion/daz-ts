import { DazGeometryDef } from '../core/DazGeometryDef.js'
import { DazGeometryInst } from '../core/DazGeometryInst.js'
import { bang } from '../utils/assert.js'
import { RVNode } from './RVNode.js'
import { RVScene } from './RVScene.js'

export class RVGeometryInstance extends RVNode {
   override emoji: string = '📐'
   constructor(
      public readonly sceneDaz: RVScene,
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
