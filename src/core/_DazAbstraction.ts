import { GLOBAL } from '../DI.js'
import type { DazMgr } from '../mgr.js'
import type { $$geometry, $$geometry_ref, $$node, $$node_ref, string_DazId } from '../spec.js'
import { Maybe } from '../types.js'
import { DazGeometryInf } from './DazGeometry.js'
import type { DazGeometryRef } from './DazGeometryRef.js'
import type { DazNode } from './DazNode.js' // New file
import type { DazNodeRef } from './DazNodeRef.js' // Corrected to DazNodeRef.js due to file rename

// biome-ignore format: misc
export type AnyDazAbstraction =
   // biome-ignore lint/suspicious/noExplicitAny: misc
   | DazAbstraction<any, any>
   | DazNodeRef
   | DazNode
   | DazGeometryInf
   | DazGeometryRef // Made more specific

export abstract class DazAbstraction<PARENT, DATA> {
   abstract emoji: string
   abstract kind: string
   abstract get dazId(): string_DazId
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

   // ---- child hydrate
   nodeRefs: Map<string_DazId, DazNodeRef> = new Map() // Renamed DazNode to DazNodeRef
   async hydrateNodeRef(nodeData: $$node_ref): Promise<DazNodeRef> {
      // Renamed hydrateNode to hydrateNodeRef, updated type
      const node = await GLOBAL.DazNodeRef.init(this.mgr, this, nodeData) // Renamed GLOBAL.DazNode to GLOBAL.DazNodeRef
      this.nodeRefs.set(node.dazId, node)
      return node
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
   nodes: Map<string_DazId, DazNode> = new Map() // New map for DazNodeInf
   async hydrateNode(nodeData: $$node): Promise<DazNode> {
      // New method for DazNodeInf
      const node = await GLOBAL.DazNodeInf.init(this.mgr, this, nodeData)
      this.nodes.set(node.dazId, node)
      return node
   }

   geometryRefs: Map<string_DazId, DazGeometryRef> = new Map()
   async hydrateGeometryRef(geometry_ref: $$geometry_ref): Promise<DazGeometryRef> {
      const geometryRef = await GLOBAL.DazGeometryRef.init(this.mgr, this, geometry_ref)
      this.geometryRefs.set(geometryRef.dazId, geometryRef)
      return geometryRef
   }

   geometries: Map<string_DazId, DazGeometryInf> = new Map()
   async hydrateGeometry(geometry_inf: $$geometry): Promise<DazGeometryInf> {
      const geometry = await GLOBAL.DazGeometryInf.init(this.mgr, this, geometry_inf)
      this.geometries.set(geometry.dazId, geometry)
      return geometry
   }
}
