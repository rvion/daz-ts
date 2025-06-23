import { DazMgr } from '../mgr.js'
import { $$, $$dson, $$dson_character, asDazId, string_DazId } from '../spec.js'
import { string_RelPath } from '../types.js'
import { check_orCrash } from '../utils/arkutils.js'
import { getDazPathAndIdFromDazURL_orCrash } from '../utils/parseDazUrl.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DsonFile.js'
import { DazFigure } from './DazFileFigure.js'
import { DazNodeRef } from './DazNodeRef.js'

export class DazCharacter extends DsonFile<$$dson_character> {
   emoji = '👤'
   kind = 'character'
   resolvedFigure: DazFigure | null = null

   static async init(mgr: DazMgr, meta: FileMeta, dson: $$dson): Promise<DazCharacter> {
      const json = check_orCrash($$.dson_character, dson, dson.asset_info.id)
      const self = new DazCharacter(mgr, meta, json)
      self.printHeader()
      mgr.charactersByDazId.set(self.dazId, self)
      mgr.charactersByRelPath.set(self.relPath, self)

      // Hydrate own node references first
      if (self.data.scene?.nodes) {
         for (const nodeData of self.data.scene.nodes) {
            await self.hydrateNodeRef(nodeData)
         }
      }

      // Attempt to find and load the associated DazFigure
      const commonFigureNodeIds: string_DazId[] = [
         asDazId('Genesis9'),
         asDazId('Genesis8Male'),
         asDazId('Genesis8Female'),
         asDazId('Genesis3Male'),
         asDazId('Genesis3Female'),
         asDazId('Genesis2Male'),
         asDazId('Genesis2Female'),
         asDazId('Genesis'),
      ]

      let figureNodeRef: DazNodeRef | undefined

      // Try common IDs first
      for (const id of commonFigureNodeIds) {
         const nodeRef = self.nodesRefs.get(id)
         if (nodeRef?.data?.preview?.type === 'figure' || (nodeRef && id === asDazId('Genesis9'))) {
            figureNodeRef = nodeRef
            break
         }
      }

      // If not found by common ID, try iterating all nodeRefs to find one with preview.type 'figure'
      if (!figureNodeRef) {
         for (const nodeRef of self.nodesRefs.values()) {
            if (nodeRef.data?.preview?.type === 'figure') {
               figureNodeRef = nodeRef
               break
            }
         }
      }

      if (figureNodeRef?.data.url) {
         try {
            const { path: dsfPath } = getDazPathAndIdFromDazURL_orCrash(figureNodeRef.data.url)
            self.resolvedFigure = await mgr.loadDazFigureByRelPath_orCrash(dsfPath as string_RelPath)
         } catch (e) {
            console.error(
               `[DazCharacter:${self.dazId}] Error loading or resolving DazFigure for nodeRef ${figureNodeRef.dazId} (URL: ${figureNodeRef.data.url}):`,
               e,
            )
         }
      } else {
         console.warn(
            `[DazCharacter:${self.dazId}] Could not identify a primary figure NodeReference to load DazFigure. Skeleton features might be unavailable.`,
         )
      }

      return self
   }
}
