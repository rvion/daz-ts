import type { PathInfo } from '../fs/PathInfo.js'
import { DazMgr } from '../mgr.js'
import { $$, $$dson, dazId, string_DazId } from '../spec.js'
import { string_RelPath } from '../types.js'
import { check_orCrash } from '../utils/arkutils.js'
import { getDazPathAndIdFromDazURL_orCrash } from '../utils/parseDazUrl.js'
import { DsonFile } from './_DsonFile.js'
import { DazFileFigure } from './DazFileFigure.js'
import { DazNodeInstance } from './DazNodeInstance.js'

export class DazFileCharacter extends DsonFile {
   emoji = '😄'
   kind = 'character'

   figure: DazFileFigure | null = null
   get figure_orCrash(): DazFileFigure {
      if (!this.figure) throw new Error(`[DazCharacter:${this.dazId}] No DazFigure associated with this character.`)
      return this.figure
   }

   static async init(mgr: DazMgr, meta: PathInfo, dson: $$dson): Promise<DazFileCharacter> {
      const json = await check_orCrash($$.dson_character, dson, dson.asset_info.id)
      const self = new DazFileCharacter(mgr, meta, json)
      self.printHeader()
      return self
   }

   async resolve(): Promise<void> {
      // Hydrate own node references first
      if (this.data.scene?.nodes) {
         for (const nodeData of this.data.scene.nodes) {
            await this.hydrateNodeInstances(nodeData)
         }
      }

      // Attempt to find and load the associated DazFigure
      const commonFigureNodeIds: string_DazId[] = [
         dazId`Genesis9`,
         dazId`Genesis8Male`,
         dazId`Genesis8Female`,
         dazId`Genesis3Male`,
         dazId`Genesis3Female`,
         dazId`Genesis2Male`,
         dazId`Genesis2Female`,
         dazId`Genesis`,
      ]

      let figureNodeRef: DazNodeInstance | undefined

      // Try common IDs first
      for (const id of commonFigureNodeIds) {
         const nodeRef = this.nodeInstances.get(id)
         if (nodeRef?.data?.preview?.type === 'figure' || (nodeRef && id === dazId('Genesis9'))) {
            figureNodeRef = nodeRef
            break
         }
      }

      // If not found by common ID, try iterating all nodeRefs to find one with preview.type 'figure'
      if (!figureNodeRef) {
         for (const nodeRef of this.nodeInstances.values()) {
            if (nodeRef.data?.preview?.type === 'figure') {
               figureNodeRef = nodeRef
               break
            }
         }
      }

      if (figureNodeRef?.data.url) {
         try {
            const { file_path: dsfPath } = getDazPathAndIdFromDazURL_orCrash(figureNodeRef.data.url)
            this.figure = await this.mgr.loadDazFigureByRelPath_orCrash(dsfPath as string_RelPath)
         } catch (e) {
            console.error(
               `[DazCharacter:${this.dazId}] Error loading or resolving DazFigure for nodeRef ${figureNodeRef.dazId} (URL: ${figureNodeRef.data.url}):`,
               e,
            )
         }
      } else {
         console.warn(
            `[DazCharacter:${this.dazId}] Could not identify a primary figure NodeReference to load DazFigure. Skeleton features might be unavailable.`,
         )
      }
   }
}
