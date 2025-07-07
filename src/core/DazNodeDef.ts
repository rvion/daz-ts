import { $$node, $$node_type, string_DazId } from '../spec.js'
import { string_RelPath } from '../types.js'
import { parseDazUrl } from '../utils/parseDazUrl.js'
import { DazAbstraction } from './_DazAbstraction.js'
import { DsonFile } from './DazFile.js'

export class DazNodeDef extends DazAbstraction<DsonFile, $$node> {
   get emoji() { return '🌳ℹ️' } // biome-ignore format: misc
   get kind() { return 'node_inf' } // biome-ignore format: misc
   get dazId(): string_DazId { return this.data.id } // biome-ignore format: misc
   get type(): $$node_type | undefined { return this.data.type } // biome-ignore format: misc
   get relPath(): string_RelPath { return this.source.relPath } // biome-ignore format: misc

   override get summary(): string {
      return `${this.data.type} - ${this.data.name} (${this.data.id})`
   }

   get parent_orNull(): DazNodeDef | null {
      return this.source.getNode_orNull(this.parentId_orNull)
   }

   get parent_orCrash(): DazNodeDef {
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
}
