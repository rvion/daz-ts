import { GLOBAL } from '../DI.js'
import type { DazMgr } from '../mgr.js'
import type { DazGeometryData, DazNodeData, string_DazId } from '../spec.js'
import type { DazGeometry } from './DazGeometry.js'
import type { DazNode } from './DazNode.js'

// biome-ignore lint/suspicious/noExplicitAny: later
export type AnyDazAbstraction = DazAbstraction<any, any>

export abstract class DazAbstraction<PARENT, DATA> {
   abstract emoji: string
   abstract kind: string
   abstract get dazId(): string_DazId

   constructor(
      public mgr: DazMgr,
      public parent: PARENT,
      public data: DATA,
   ) {}

   // ---- print
   printHeader(): void {
      console.log(`[${this.emoji} ${this.kind} #${this.dazId}] `)
   }

   // ---- child hydrate
   nodes: Map<string_DazId, DazNode> = new Map()
   async hydrateNode(nodeData: DazNodeData): Promise<DazNode> {
      const node = await GLOBAL.DazNode.init(this.mgr, this, nodeData)
      this.nodes.set(node.dazId, node) // register node
      return node
   }

   geometries: Map<string_DazId, DazGeometry> = new Map()
   async hydrateGeometry(geometryData: DazGeometryData): Promise<DazGeometry> {
      const geometry = await GLOBAL.DazGeometry.init(this.mgr, this, geometryData)
      this.geometries.set(geometry.dazId, geometry) // register node
      return geometry
   }
}
