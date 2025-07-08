import * as THREE from 'three'
import { DazGeometryDef } from '../core/DazGeometryDef.js'
import { DazGeometryInst } from '../core/DazGeometryInst.js'
import { DazModifierDef } from '../core/DazModifierDef.js'
import { DazModifierInst } from '../core/DazModifierInst.js'
import { DazNodeDef } from '../core/DazNodeDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { GLOBAL } from '../DI.js'
import { $$material_instance, $$uv_set_instance } from '../spec.js'
import { Maybe } from '../types.js'
import { bang } from '../utils/assert.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVChannel } from './RVChannel.js'
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

export class RVUvSetInstance extends RVNode {
   override emoji: string = '🌐'
   constructor(
      public readonly sceneDaz: RuntimeScene,
      public readonly data: $$uv_set_instance,
   ) {
      super(data.id, '🔴⁉️', '🔴⁉️', data.id)
   }
}

export class RVModifier extends RVNode {
   findParentFigure_orCrash() {
      let at: Maybe<RVNode> = this
      while (at) {
         if (at instanceof RVNode && at instanceof GLOBAL.RVFigure) return at
         at = at.parent
      }
      throw new Error(`Modifier ${this.dazId} must be attached to a figure`)
   }
   override emoji: string = '🛠️'
   constructor(
      public readonly sceneDaz: RuntimeScene,
      public readonly dModDef: DazModifierDef,
      public readonly dModInst: DazModifierInst,
   ) {
      super(
         //
         dModDef.dazId,
         dModInst.relPath,
         dModDef.relPath,
         dModDef.data.name ?? dModDef.dazId,
      )
      if (dModDef.data.channel) {
         this.channels.value = new RVChannel(sceneDaz, dModDef.data.channel)
         // this.addChild(this.channel)
      }
   }
}

export class RVMaterialInstance extends RVNode {
   override emoji: string = '🎨'
   constructor(
      public readonly sceneDaz: RuntimeScene,
      public readonly data: $$material_instance,
   ) {
      super(data.id, '🔴⁉️', '🔴⁉️', data.id)
   }
}

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

export class RVLight extends RVNode {
   public readonly light: THREE.Light

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
         `Light_${dNodeInst.dazId}`,
      )
      // TODO: Create directional, point, or spot light based on node data
      this.light = new THREE.DirectionalLight()
      this.object3d.add(this.light)
   }
}

export class RVProp extends RVNode {
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
         `Prop_${dNodeInst.dazId}`,
      )
   }
}

export interface AddToSceneSummary {
   newTopLevelNodes: RVNode[]
   newNodesAttachedToExistingNodes: {
      node: RVNode
      attachedTo: RVNode
      at: string
   }[]
}
