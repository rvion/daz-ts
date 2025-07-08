import * as THREE from 'three'
import { DazNodeDef } from '../core/DazNodeDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { RVNode } from './RVNode.js'
import { RVScene } from './RVScene.js'

export class RVLight extends RVNode {
   public readonly light: THREE.Light

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
         `Light_${dNodeInst.dazId}`,
      )
      // TODO: Create directional, point, or spot light based on node data
      this.light = new THREE.DirectionalLight()
      this.object3d.add(this.light)
   }
}
