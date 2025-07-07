import { nanoid } from 'nanoid'
import * as THREE from 'three'
import { string_DazId } from '../spec.js'
import { Maybe, string_RelPath } from '../types.js'

export type RVNodeQuery = {
   id?: Maybe<string_DazId>
   instPath?: Maybe<string_RelPath>
   defPath?: Maybe<string_RelPath>
}

/**
 * Base class for a runtime node in the scene graph.
 * Each RVNode wraps a THREE.Object3D to integrate with the three.js renderer,
 * and maintains its own parent/child hierarchy.
 */
export abstract class RVNode {
   uid_ = nanoid(4)
   readonly emoji: string = '❓'
   public readonly object3d: THREE.Object3D
   public readonly children: RVNode[] = []
   public parent?: RVNode

   get channelValue(): unknown {
      return undefined
   }

   constructor(
      public readonly dazId: string_DazId,
      public readonly dazInstPath: string_RelPath,
      public readonly dazDefPath: string_RelPath,
      name: string,
   ) {
      this.object3d = new THREE.Object3D()
      this.object3d.name = name || dazId || 'RVNode'
   }

   match(q: RVNodeQuery): boolean {
      if (q.id && this.dazId !== q.id) return false
      if (q.instPath && this.dazInstPath !== q.instPath) return false
      if (q.defPath && this.dazDefPath !== q.defPath) return false
      return true
   }

   /** Adds a child node to this node. */
   addChild(child: RVNode) {
      if (child.parent) child.parent.removeChild(child)
      this.children.push(child)
      child.parent = this
      this.object3d.add(child.object3d)
   }

   /** Removes a child node from this node. */
   removeChild(child: RVNode) {
      const index = this.children.indexOf(child)
      if (index > -1) {
         this.children.splice(index, 1)
         child.parent = undefined
         this.object3d.remove(child.object3d)
      }
   }

   get path(): string {
      const parentPath = this.parent?.path ?? ''
      return `${parentPath}/${this.dazId}`
   }
}
