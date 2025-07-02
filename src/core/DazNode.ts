import { DazMgr } from '../mgr.js'
import { $$node, $$node_type, string_DazId } from '../spec.js'
import { parseDazUrl } from '../utils/parseDazUrl.js'
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'

export class DazNode extends DazAbstraction<AnyDazAbstraction, $$node> {
   get emoji() { return '🌳ℹ️' } // biome-ignore format: misc
   get kind() { return 'node_inf' } // biome-ignore format: misc
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   get type(): $$node_type | undefined { return this.data.type } // biome-ignore format: misc

   override get summary(): string {
      return `${this.data.type} - ${this.data.name} (${this.data.id})`
   }

   get parent_orNull(): DazNode | null {
      return this.getNode_orNull(this.parentId_orNull)
   }

   get parent_orCrash(): DazNode {
      return this.source.getNode_orCrash(this.parentId_orCrash)
   }

   get parentId_orCrash(): string_DazId {
      const parentUrl = this.data.parent
      if (parentUrl == null) throw new Error(`"${this.type}" node "${this.data.id}" has no parent url.`)
      const parentId = parseDazUrl(parentUrl)?.asset_id
      if (!parentId) throw new Error(`Parent url has not id (${parentUrl})`)
      return parentId
   }

   get parentId_orNull() {
      const parentUrl = this.data.parent
      if (parentUrl == null) return null
      const parentId = parseDazUrl(parentUrl)?.asset_id
      if (!parentId) return null
      return parentId
   }

   // init
   static async init(mgr: DazMgr, parent: AnyDazAbstraction, json: $$node): Promise<DazNode> {
      const self = new DazNode(mgr, parent, json)
      // self.printHeader()

      // If this node_inf has children (e.g., a skeleton), hydrate them
      if (self.data.children) {
         for (const childNodeData of self.data.children) {
            await self.hydrateNode(childNodeData) // Recursive call for child nodes
         }
      }
      // TODO: Potentially hydrate other properties like formulas or specific extra channels if needed

      return self
   }

   // TODO: Add methods to access specific properties from node_inf if required,
   // e.g., get transformations, presentation details, etc.
}
