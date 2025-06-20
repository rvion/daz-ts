import { DazNode } from '../core/DazNode.js'
import { DazMgr } from '../mgr.js'
import { $$, DazAssetType, DazNodeData, string_DazId } from '../spec.js'
import { string_AbsPath, string_Ext, string_RelPath } from '../types.js'
import { fmtAbsPath, fmtDazId, fmtRelPath } from '../utils/fmt.js'
import { FileMeta } from '../walk.js'

export class DsonFile {
   constructor(
      //
      public mgr: DazMgr,
      public meta: FileMeta,
      public dson: (typeof $$.dson)['infer'],
      public dazId: string_DazId = dson.asset_info.id, // id from dson
   ) {}

   get assetType(): DazAssetType {
      return this.dson.asset_info.type ?? 'unknown'
   }

   get absPath(): string_AbsPath {
      return this.meta.absPath
   }

   get relPath(): string_RelPath {
      return this.meta.relPath
   }

   get fileExt(): string_Ext {
      return this.meta.fileExt
   }

   get rootDir(): string {
      return this.meta.rootDir
   }

   // ---- child hydrate
   nodes: Map<string_DazId, DazNode> = new Map()
   hydrateNode(nodeData: DazNodeData): DazNode {
      const node = new DazNode(this.mgr, this, nodeData)
      this.nodes.set(node.id, node) // register node
      return node
   }

   // ---- print methods
   printHeader(): void {
      console.log(fmtAbsPath(this.absPath))
      console.log(`[wearable ${fmtDazId(this.dazId)} @ ${fmtRelPath(this.relPath)}] `)
   }
}
