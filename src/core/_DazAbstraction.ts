import { GLOBAL } from '../DI.js'
import type { DazMgr } from '../mgr.js'
import type { $$geometry_inf, $$geometry_ref, $$node_inf, $$node_ref, string_DazId } from '../spec.js'
import { DazGeometryInf } from './DazGeometryInf.js'
import type { DazGeometryRef } from './DazGeometryRef.js'
import type { DazNodeInf } from './DazNodeInf.js' // New file
import type { DazNodeRef } from './DazNodeRef.js' // Corrected to DazNodeRef.js due to file rename

// biome-ignore format: misc
export type AnyDazAbstraction =
   // biome-ignore lint/suspicious/noExplicitAny: misc
   | DazAbstraction<any, any>
   | DazNodeRef
   | DazNodeInf
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
      public parent: PARENT,
      public data: DATA,
   ) {}

   // ---- print
   printHeader(): void {
      console.log(`[${this.emoji} ${this.kind} #${this.dazId}] ${this.summary}`)
   }

   // ---- child hydrate
   nodes: Map<string_DazId, DazNodeRef> = new Map() // Renamed DazNode to DazNodeRef
   async hydrateNodeRef(nodeData: $$node_ref): Promise<DazNodeRef> {
      // Renamed hydrateNode to hydrateNodeRef, updated type
      const node = await GLOBAL.DazNodeRef.init(this.mgr, this, nodeData) // Renamed GLOBAL.DazNode to GLOBAL.DazNodeRef
      this.nodes.set(node.dazId, node)
      return node
   }

   nodesInf: Map<string_DazId, DazNodeInf> = new Map() // New map for DazNodeInf
   async hydrateNodeInf(nodeData: $$node_inf): Promise<DazNodeInf> {
      // New method for DazNodeInf
      const nodeInf = await GLOBAL.DazNodeInf.init(this.mgr, this, nodeData)
      this.nodesInf.set(nodeInf.dazId, nodeInf)
      return nodeInf
   }

   geometryRefs: Map<string_DazId, DazGeometryRef> = new Map()
   async hydrateGeometryRef(geometry_ref: $$geometry_ref): Promise<DazGeometryRef> {
      const geometryRef = await GLOBAL.DazGeometryRef.init(this.mgr, this, geometry_ref)
      this.geometryRefs.set(geometryRef.dazId, geometryRef)
      return geometryRef
   }

   geometryInfs: Map<string_DazId, DazGeometryInf> = new Map()
   async hydrateGeometryInf(geometry_inf: $$geometry_inf): Promise<DazGeometryInf> {
      const geometryInf = await GLOBAL.DazGeometryInf.init(this.mgr, this, geometry_inf)
      this.geometryInfs.set(geometryInf.dazId, geometryInf)
      return geometryInf
   }
}
