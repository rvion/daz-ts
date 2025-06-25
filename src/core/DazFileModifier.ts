import { DazMgr } from '../mgr.js'
import { $$, $$dson, $$dson_modifier, string_DazUrl } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { getDazUrlParts } from '../utils/parseDazUrl.js'
import { FileMeta } from '../walk.js'
import { DsonFile, KnownDazFile } from './_DsonFile.js'

export class DazFileModifier extends DsonFile<$$dson_modifier> {
   emoji = '🔧'
   kind = 'modifier'

   // Store resolved URLs for easy access
   resolvedUrls: Map<string, KnownDazFile> = new Map()

   static async init(mgr: DazMgr, meta: FileMeta, dson: $$dson): Promise<DazFileModifier> {
      const json = check_orCrash($$.dson_modifier, dson, dson.asset_info.id)
      const self = new DazFileModifier(mgr, meta, json)
      self.printHeader()

      // Store in manager maps
      mgr.modifiersByDazId.set(self.dazId, self)
      mgr.modifiersByRelPath.set(self.relPath, self)

      // Resolve all URLs found in the modifier
      await self.resolveUrls()

      return self
   }

   private async resolveUrls(): Promise<void> {
      // Collect all URLs that need resolution
      const urlsToResolve = new Set<string_DazUrl>()

      // 1. URLs from modifier_library entries
      if (this.data.modifier_library) {
         for (const modifier of this.data.modifier_library) {
            if (modifier.parent) {
               urlsToResolve.add(modifier.parent as string_DazUrl)
            }

            // 2. URLs from formulas
            if (modifier.formulas) {
               for (const formula of modifier.formulas) {
                  if (formula.output) {
                     urlsToResolve.add(formula.output)
                  }
                  if (formula.operations) {
                     for (const op of formula.operations) {
                        if ('url' in op && op.url) {
                           urlsToResolve.add(op.url)
                        }
                     }
                  }
               }
            }
         }
      }

      // 3. URLs from scene.modifiers (though these are typically local references)
      if (this.data.scene?.modifiers) {
         for (const sceneModifier of this.data.scene.modifiers) {
            if (sceneModifier.url && !sceneModifier.url.startsWith('#')) {
               urlsToResolve.add(sceneModifier.url as string_DazUrl)
            }
         }
      }

      // Resolve each URL
      for (const url of urlsToResolve) {
         try {
            const resolved = await this.resolveUrl(url)
            if (resolved) {
               this.resolvedUrls.set(url, resolved)
            }
         } catch (error) {
            console.warn(`[DazFileModifier] Failed to resolve URL "${url}":`, error)
         }
      }
   }

   private resolveUrl(dazUrl: string_DazUrl): Promise<KnownDazFile | null> {
      const parts = getDazUrlParts(dazUrl)
      console.log('⁉️', parts)
      if (!parts.srcPath) return Promise.resolve(null)

      // For now, just return the resolved path
      // In a more complete implementation, you might want to:
      // - Check if the file exists
      // - Load and cache the referenced file
      // - Validate the referenced ID exists in the target file
      return this.mgr.loadFull_FromRelPath(parts.srcPath)
      // return parts.srcPath
   }

   // Getter for easy access to modifier library entries
   get modifierLibrary() {
      return this.data.modifier_library || []
   }

   // Getter for scene modifiers
   get sceneModifiers() {
      return this.data.scene?.modifiers || []
   }

   // Get all formula outputs (useful for understanding what this modifier affects)
   get formulaOutputs(): string_DazUrl[] {
      const outputs: string_DazUrl[] = []
      for (const modifier of this.modifierLibrary) {
         if (modifier.formulas) {
            for (const formula of modifier.formulas) {
               if (formula.output) {
                  outputs.push(formula.output)
               }
            }
         }
      }
      return outputs
   }

   // Get all parent references
   get parentRefs(): string_DazUrl[] {
      return this.modifierLibrary.map((m) => m.parent).filter((parent): parent is string_DazUrl => !!parent)
   }
}
