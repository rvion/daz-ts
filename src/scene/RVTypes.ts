import * as THREE from 'three'
import { DazNodeInstance } from '../core/DazNodeInstance.js'
import {
   $$geometry_instance,
   $$material_instance,
   $$modifier_instance,
   $$node_instance,
   $$uv_set_instance,
} from '../spec.js'
import { RVNode } from './RVNode.js'

export class RVNodeInstance extends RVNode {
   override emoji: string ='🐄'
   constructor(public readonly data: $$node_instance) {
      super(data.id, data.id)
   }
}

export class RVGeometryInstance extends RVNode {
   override emoji: string ='📐'
   constructor(public readonly data: $$geometry_instance) {
      super(data.id, data.id)
   }
}

export class RVUvSetInstance extends RVNode {
   override emoji: string ='🌐'
   constructor(public readonly data: $$uv_set_instance) {
      super(data.id, data.id)
   }
}

export class RVModifierInstance extends RVNode {
   override emoji: string ='🛠️'
   constructor(public readonly data: $$modifier_instance) {
      super(data.id, data.id)
   }
}

export class RVMaterialInstance extends RVNode {
   override emoji: string ='🎨'
   constructor(public readonly data: $$material_instance) {
      super(data.id, data.id)
   }
}

export class RVBone extends RVNode {
   override emoji: string ='🦴'
   public readonly bone: THREE.Bone

   constructor(public readonly nodeInstance: DazNodeInstance) {
      super(nodeInstance.dazId, `Bone_${nodeInstance.dazId}`)
      this.bone = new THREE.Bone()
      this.object3d.add(this.bone)
   }
}

export class RVCamera extends RVNode {
   public readonly camera: THREE.Camera

   constructor(public readonly nodeInstance: DazNodeInstance) {
      super(nodeInstance.dazId, `Camera_${nodeInstance.dazId}`)
      // TODO: Create perspective or orthographic camera based on node data
      this.camera = new THREE.PerspectiveCamera()
      this.object3d.add(this.camera)
   }
}

export class RVLight extends RVNode {
   public readonly light: THREE.Light

   constructor(public readonly nodeInstance: DazNodeInstance) {
      super(nodeInstance.dazId, `Light_${nodeInstance.dazId}`)
      // TODO: Create directional, point, or spot light based on node data
      this.light = new THREE.DirectionalLight()
      this.object3d.add(this.light)
   }
}

export class RVProp extends RVNode {
   constructor(public readonly nodeInstance: DazNodeInstance) {
      super(nodeInstance.dazId, `Prop_${nodeInstance.dazId}`)
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
