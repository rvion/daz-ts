import * as THREE from 'three'
import { DazNodeDef } from '../core/DazNodeDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { ASSERT_, assertXYZChanels } from '../utils/assert.js'
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
      ASSERT_(dNodeDef.type === 'bone', `Node ${dNodeDef.dazId} is not a bone type`)
      this.bone = new THREE.Bone()
      this.bone.name = dNodeDef.data.name || dNodeDef.dazId
      this.object3d.add(this.bone)
      this.setupNodeChannels(dNodeDef.data)

      // Apply initial position/rotation from node data if available
      if (dNodeDef.data.center_point) {
         const chans = dNodeDef.data.center_point
         const { x, y, z } = assertXYZChanels(chans)
         this.bone.position.set(x, y, z)
      }
      if (dNodeDef.data.rotation) {
         const { x, y, z } = assertXYZChanels(dNodeDef.data.rotation)
         this.bone.rotation.set(THREE.MathUtils.degToRad(x), THREE.MathUtils.degToRad(y), THREE.MathUtils.degToRad(z))
      }
      if (dNodeDef.data.translation) {
         const { x, y, z } = assertXYZChanels(dNodeDef.data.translation)
         this.bone.position.add(new THREE.Vector3(x, y, z))
      }
      if (dNodeDef.data.scale) {
         const { x, y, z } = assertXYZChanels(dNodeDef.data.scale)
         this.bone.scale.set(x, y, z)
      }
   }
}
