import type { DazMgr } from '../mgr.js'
import type { string_DazId, string_DazUrl } from '../spec.js'
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

   // nodes: Map<string_DazId, DazNode> = new Map() // New map for DazNodeInf
   // async hydrateNode($node: $$node): Promise<DazNode> {
   //    // New method for DazNodeInf
   //    const node = await GLOBAL.DazNode.init(this.mgr, this, $node)
   //    this.nodes.set(node.dazId, node)
   //    return node
   // }

   // geometryInstances: Map<string_DazId, DazGeometryInstance> = new Map()
   // async hydrateGeometryInstances($geometry_instance: $$geometry_instance): Promise<DazGeometryInstance> {
   //    const geometryRef = await GLOBAL.DazGeometryInstance.init(this.mgr, this, $geometry_instance)
   //    this.geometryInstances.set(geometryRef.dazId, geometryRef)
   //    return geometryRef
   // }
}
