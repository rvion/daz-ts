import { DazAbstraction } from '../core/_DazAbstraction.js'
import { DazAssetType, Dson, string_DazId } from '../spec.js'
import { string_AbsPath, string_Ext, string_RelPath } from '../types.js'
import { fmtAbsPath, fmtDazId, fmtRelPath } from '../utils/fmt.js'
import { FileMeta } from '../walk.js'

import type { DazCharacter } from './DazCharacter.js'
import type { DazFigure } from './DazFigure.js'
import type { DazWearable } from './DazWearable.js'

export type KnownDazFile = DazCharacter | DazWearable | DazFigure

export abstract class DsonFile<DATA extends Dson> extends DazAbstraction<FileMeta, DATA> {
   get dazId(): string_DazId {
      return this.data.asset_info.id
   }

   get assetType(): DazAssetType {
      return this.data.asset_info.type ?? 'unknown'
   }

   get absPath(): string_AbsPath {
      return this.parent.absPath
   }

   get relPath(): string_RelPath {
      return this.parent.relPath
   }

   get fileExt(): string_Ext {
      return this.parent.fileExt
   }

   get rootDir(): string {
      return this.parent.rootDir
   }

   // ---- print methods
   override printHeader(): void {
      console.log(fmtAbsPath(this.absPath))
      console.log(`[${this.emoji} ${this.assetType} #${fmtDazId(this.dazId)} @ ${fmtRelPath(this.relPath)}] `)
   }
}
