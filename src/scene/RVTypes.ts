import * as THREE from 'three'
import { DazGeometryDef } from '../core/DazGeometryDef.js'
import { DazGeometryInst } from '../core/DazGeometryInst.js'
import { DazModifierDef } from '../core/DazModifierDef.js'
import { DazModifierInst } from '../core/DazModifierInst.js'
import { DazNodeDef } from '../core/DazNodeDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { $$any_channel, $$material_instance, $$uv_set_instance } from '../spec.js'
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

export class RVUvSetInstance extends RVNode {
   override emoji: string = '🌐'
   constructor(
      public readonly sceneDaz: RuntimeScene,
      public readonly data: $$uv_set_instance,
   ) {
      super(data.id, '🔴⁉️', '🔴⁉️', data.id)
   }
}

export class RVChannel extends RVNode {
   override emoji: string = '📡'

   override get channelValue(): string {
      if (this.data.type === 'float') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'bool') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'int') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'color') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'enum') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'float_color') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'file') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'string') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'image') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'ok') return `${this.data.value ?? this.data.current_value}`
      else if (this.data.type === 'alias') return `🔴REF:${this.data.target_channel}`
      else return '❓'
   }
   constructor(
      public readonly sceneDaz: RuntimeScene,
      public readonly data: $$any_channel,
   ) {
      super(data.id, '🔴⁉️', '🔴⁉️', data.id)
   }
}

export class RVModifier extends RVNode {
   override emoji: string = '🛠️'
   public readonly channel?: RVChannel

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
         this.channel = new RVChannel(sceneDaz, dModDef.data.channel)
         this.addChild(this.channel)
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
