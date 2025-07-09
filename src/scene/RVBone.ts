import * as THREE from 'three'
import { DazNodeDef } from '../core/DazNodeDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { ASSERT_ } from '../utils/assert.js'
import { RVNode } from './RVNode.js'
import { RVScene } from './RVScene.js'

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
         `Bone_${dNodeInst.dazId}`,
      )
      ASSERT_(dNodeDef.type === 'bone', `Node ${dNodeDef.dazId} is not a bone type`)
      this.bone = new THREE.Bone()
      this.bone.name = dNodeDef.data.name || dNodeDef.dazId
      this.object3d = this.bone // Set the object3d to the bone itself
      this.setupNodeChannels(dNodeDef.data)
   }

   syncFromChannels(): void {
      // Set rotation and scale (these are local)
      if (this.channels['rotation/x']) {
         const [x, y, z] = this._assertXYZChannels('rotation')
         this.bone.rotation.set(THREE.MathUtils.degToRad(x), THREE.MathUtils.degToRad(y), THREE.MathUtils.degToRad(z))
      }
      if (this.channels['scale/x']) {
         const [x, y, z] = this._assertXYZChannels('scale')
         this.bone.scale.set(x, y, z)
      }

      // Set position (relative to parent)
      const myAbsolutePos = this._getAbsolutePositionFromChannels()

      const parent = this.parent
      if (parent instanceof RVBone) {
         const parentAbsolutePos = parent._getAbsolutePositionFromChannels()
         const relativePos = myAbsolutePos.clone().sub(parentAbsolutePos)
         this.bone.position.copy(relativePos)
      } else {
         // It's a root bone or parent is not a bone, so position is absolute
         this.bone.position.copy(myAbsolutePos)
      }
   }

   private _getAbsolutePositionFromChannels(): THREE.Vector3 {
      const pos = new THREE.Vector3()
      if (this.channels['center_point/x']) {
         const [x, y, z] = this._assertXYZChannels('center_point')
         pos.set(x, y, z)
      }
      if (this.channels['translation/x']) {
         const [x, y, z] = this._assertXYZChannels('translation')
         pos.add(new THREE.Vector3(x, y, z))
      }
      return pos
   }

   private _assertXYZChannels(chanPrefix: string): [x: number, y: number, z: number] {
      const x = this.channels[`${chanPrefix}/x`].value as number
      const y = this.channels[`${chanPrefix}/y`].value as number
      const z = this.channels[`${chanPrefix}/z`].value as number
      ASSERT_(typeof x === 'number' && typeof y === 'number' && typeof z === 'number', '❌#KVgVNtyqIo not numbers')
      return [x, y, z]
   }
}
