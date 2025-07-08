import * as THREE from 'three'
import { DazNodeDef } from '../core/DazNodeDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVNode } from './RVNode.js'

// #region RVNode
// RVNodeInstance is actually splitted into different classes for convernience.
// RVFigure => RVNodeFigure ?
// RVBone   => RVNodeBone ?
// RVCamera => RVNodeCamera ?
// RVLight  => RVNodeLight ?
// RVProp   => RVNodeNode ?
// 🔶 later we may need

export class RVBone extends RVNode {
   override emoji: string = '🦴'
   public readonly bone: THREE.Bone

   // override getPropertyValue(propertyPath: Maybe<string>): unknown {
   //    if (propertyPath === 'rotation/x') return this.bone.rotation.x
   //    if (propertyPath === 'rotation/y') return this.bone.rotation.y
   //    if (propertyPath === 'rotation/z') return this.bone.rotation.z
   //    return super.getPropertyValue(propertyPath)
   // }
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
         `Bone_${dNodeInst.dazId}`,
      )
      this.bone = new THREE.Bone()
      this.object3d.add(this.bone)
      this.setupNodeChannels(dNodeDef.data)
   }
}
