import { GLOBAL } from '../DI.js'
import type { DazMgr } from '../mgr.js'
import type { $$geometry_instance, $$node, $$node_instance, string_DazId, string_DazUrl } from '../spec.js'
import { Maybe } from '../types.js'
import { DazGeometry } from './DazGeometry.js'
import type { DazGeometryInstance } from './DazGeometryInstance.js'
import type { DazNode } from './DazNode.js' // New file
import type { DazNodeInstance } from './DazNodeInstance.js' // Corrected to DazNodeRef.js due to file rename

// biome-ignore format: misc
export type AnyDazAbstraction =
   // biome-ignore lint/suspicious/noExplicitAny: misc
   | DazAbstraction<any, any>
   | DazNodeInstance
   | DazNode
   | DazGeometry
   | DazGeometryInstance // Made more specific

export abstract class DazAbstraction<PARENT, DATA> {
   abstract emoji: string
   abstract kind: string
   abstract get dazId(): string_DazId | string_DazUrl
   get summary(): string {
      return ''
   }

   constructor(
      public mgr: DazMgr,
      public source: PARENT,
      public data: DATA,
   ) {}

   // ---- print
   printHeader(): void {
      console.log(`[${this.emoji} ${this.kind} #${this.dazId}] ${this.summary}`)
   }

   getNode_orNull(nodeId?: Maybe<string_DazId>): DazNode | null {
      if (nodeId == null) return null
      return this.nodes.get(nodeId) ?? null
   }
   getNode_orCrash(nodeId?: Maybe<string_DazId>): DazNode {
      if (nodeId == null) throw new Error(`Node ID is required to get node in ${this.kind} "${this.dazId}".`)
      const node = this.nodes.get(nodeId)
      if (node == null) throw new Error(`Node with ID "${nodeId}" not found in ${this.kind} "${this.dazId}".`)
      return node
   }

   // ---- child hydrate
   nodeInstances: Map<string_DazId, DazNodeInstance> = new Map() // Renamed DazNode to DazNodeRef
   async hydrateNodeInstances($node_instance: $$node_instance): Promise<DazNodeInstance> {
      // Renamed hydrateNode to hydrateNodeRef, updated type
      const node = await GLOBAL.DazNodeInstance.init(this.mgr, this, $node_instance) // Renamed GLOBAL.DazNode to GLOBAL.DazNodeRef
      this.nodeInstances.set(node.dazId, node)
      return node
   }

   nodes: Map<string_DazId, DazNode> = new Map() // New map for DazNodeInf
   async hydrateNode($node: $$node): Promise<DazNode> {
      // New method for DazNodeInf
      const node = await GLOBAL.DazNode.init(this.mgr, this, $node)
      this.nodes.set(node.dazId, node)
      return node
   }

   geometryInstances: Map<string_DazId, DazGeometryInstance> = new Map()
   async hydrateGeometryInstances($geometry_instance: $$geometry_instance): Promise<DazGeometryInstance> {
      const geometryRef = await GLOBAL.DazGeometryInstance.init(this.mgr, this, $geometry_instance)
      this.geometryInstances.set(geometryRef.dazId, geometryRef)
      return geometryRef
   }
}
