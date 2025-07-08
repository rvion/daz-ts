import * as THREE from 'three'
import { DazNodeDef } from '../core/DazNodeDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVNode } from './RVNode.js'

export class RVCamera extends RVNode {
   public readonly camera: THREE.Camera

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
         `Camera_${dNodeInst.dazId}`,
      )
      // TODO: Create perspective or orthographic camera based on node data
      this.camera = new THREE.PerspectiveCamera()
      this.object3d.add(this.camera)
      this.setupNodeChannels(dNodeDef.data)
   }
}
