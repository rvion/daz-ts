import { check } from './arkutils.js'
import { $$, DazAssetType } from './spec.js'
import { string_AbsPath, string_Ext, string_RelPath } from './types.js'
import { FileMeta } from './walk.js'

export class DazFile {
   constructor(public meta: FileMeta) {}

   get absPath(): string_AbsPath { return this.meta.absPath } // biome-ignore format: misc
   get relPath(): string_RelPath { return this.meta.relPath } // biome-ignore format: misc
   get fileExt(): string_Ext { return this.meta.fileExt } // biome-ignore format: misc
   get rootDir(): string { return this.meta.rootDir } // biome-ignore format: misc

   get text(): Promise<string> {
      const value = Bun.file(this.absPath).text()
      Object.defineProperty(this, 'content', { value })
      return value
   }

   get json_(): Promise<unknown> {
      const value = this.text.then((content) => JSON.parse(content))
      Object.defineProperty(this, 'json_', { value })
      return value
   }

   get json() {
      const value = this.json_.then((json) => {
         const out = check($$.duf, json, this.absPath)
         if (out.asset_info.type === 'wearable') check($$.duf_wearable, json, this.absPath)
         return out
      })
      Object.defineProperty(this, 'json', { value })
      return value
   }

   // Helper function to get asset type from DUF files
   get assetType(): Promise<DazAssetType> {
      return this.json.then((json) => json.asset_info.type).catch(() => 'unknown')
   }
}
