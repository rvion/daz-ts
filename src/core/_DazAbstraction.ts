import { GLOBAL } from '../DI.js'
import type { DazMgr } from '../mgr.js'
import type { $$geometry_inf, $$geometry_ref, $$node, string_DazId } from '../spec.js'
import { DazGeometryInf } from './DazGeometryInf.js'
import type { DazGeometryRef } from './DazGeometryRef.js'
import type { DazNode } from './DazNode.js'

// biome-ignore lint/suspicious/noExplicitAny: later
export type AnyDazAbstraction = DazAbstraction<any, any>

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
   nodes: Map<string_DazId, DazNode> = new Map()
   async hydrateNode(nodeData: $$node): Promise<DazNode> {
      const node = await GLOBAL.DazNode.init(this.mgr, this, nodeData)
      this.nodes.set(node.dazId, node)
      return node
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
