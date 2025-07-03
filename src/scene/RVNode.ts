import * as THREE from 'three'
import { string_DazId } from '../spec.js'

/**
 * Base class for a runtime node in the scene graph.
 * Each RVNode wraps a THREE.Object3D to integrate with the three.js renderer,
 * and maintains its own parent/child hierarchy.
 */
export class RVNode {
   public readonly object3d: THREE.Object3D
   public readonly children: RVNode[] = []
   public parent?: RVNode

   constructor(
      public readonly dazId?: string_DazId,
      name?: string,
   ) {
      this.object3d = new THREE.Object3D()
      this.object3d.name = name || dazId || 'RVNode'
   }

   /**
    * Adds a child node to this node.
    * @param child The RVNode to add.
    */
   add(child: RVNode) {
      if (child.parent) {
         child.parent.remove(child)
      }
      this.children.push(child)
      child.parent = this
      this.object3d.add(child.object3d)
   }

   /**
    * Removes a child node from this node.
    * @param child The RVNode to remove.
    */
   remove(child: RVNode) {
      const index = this.children.indexOf(child)
      if (index > -1) {
         this.children.splice(index, 1)
         child.parent = undefined
         this.object3d.remove(child.object3d)
      }
   }
}
