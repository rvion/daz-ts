import type { PathInfo } from '../fs/PathInfo.js'
import { DazMgr } from '../mgr.js'
import { $$, $$dson, dazId, string_DazId } from '../spec.js'
import { string_RelPath } from '../types.js'
import { check_orCrash } from '../utils/arkutils.js'
import { bang } from '../utils/assert.js'
import { getDazPathAndIdFromDazURL_orCrash } from '../utils/parseDazUrl.js'
import { DsonFile } from './DazFile.js'
import { DazFileFigure } from './DazFileFigure.js'
import { DazNodeInst } from './DazNodeInst.js'

export class DazFileCharacter extends DsonFile {
   emoji = '😄'
   kind = 'character'

   // get figure_orCrash(): DazFileFigure {
   //    if (!this.figure) throw new Error(`[DazCharacter:${this.dazId}] No DazFigure associated with this character.`)
   //    return this.figure
   // }

   static async init(mgr: DazMgr, meta: PathInfo, dson: $$dson): Promise<DazFileCharacter> {
      const json = await check_orCrash($$.dson_character, dson, dson.asset_info.id)
      const self = new DazFileCharacter(mgr, meta, json)
      self.printHeader()
      return self
   }

   async resolve(): Promise<DazFileFigure> {
      if (this.figure) return this.figure
      const figureURL = bang(this.findNodeInstanceToFigure()).data.url
      const { file_path: dsfPath } = getDazPathAndIdFromDazURL_orCrash(figureURL)
      this.figure = await this.mgr.loadDazFigureByRelPath_orCrash(dsfPath as string_RelPath)
      return this.figure
   }

   // biome-ignore format: misc
   private _commonFigureNodeIds = [
      dazId`Genesis9`,
      dazId`Genesis8Male`, dazId`Genesis8Female`,
      dazId`Genesis3Male`, dazId`Genesis3Female`,
      dazId`Genesis2Male`, dazId`Genesis2Female`,
      dazId`Genesis`,
   ]
   private figure: DazFileFigure | null = null

   findNodeInstanceToFigure(): DazNodeInst | undefined {
      // Attempt to find and load the associated DazFigure
      let figureNodeRef: DazNodeInst | undefined

      // Try common IDs first
      const commonFigureNodeIds: string_DazId[] = this._commonFigureNodeIds
      for (const id of commonFigureNodeIds) {
         const nodeRef: DazNodeInst | undefined = this.sceneNodes.get(id)
         if (nodeRef?.data?.preview?.type === 'figure' || (nodeRef && id === dazId('Genesis9'))) {
            figureNodeRef = nodeRef
            break
         }
      }

      // If not found by common ID, try iterating all nodeRefs
      // to find one with preview.type 'figure'
      if (!figureNodeRef) {
         for (const nodeRef of this.sceneNodes.values()) {
            if (nodeRef.data?.preview?.type === 'figure') {
               figureNodeRef = nodeRef
               break
            }
         }
      }
      return figureNodeRef
   }
}
