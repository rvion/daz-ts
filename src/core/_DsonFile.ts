import { $$dson, DazAssetType, string_DazId } from '../spec.js'
import { string_AbsPath, string_Ext, string_RelPath } from '../types.js'
import { fmtAbsPath, fmtDazId, fmtRelPath } from '../utils/fmt.js'
import { FileMeta } from '../walk.js'
import { DazAbstraction } from './_DazAbstraction.js'
import type { DazCharacter } from './DazFileCharacter.js'
import type { DazFigure } from './DazFileFigure.js'
import type { DazFileModifier } from './DazFileModifier.js'
import type { DazFilePose } from './DazFilePose.js'
import type { DazWearable } from './DazFileWearable.js'

export type KnownDazFile = DazCharacter | DazWearable | DazFigure | DazFilePose | DazFileModifier

export abstract class DsonFile<DATA extends $$dson> extends DazAbstraction<FileMeta, DATA> {
   get dazId(): string_DazId {
      return this.data.asset_info.id
   }

   get assetType(): DazAssetType {
      return this.data.asset_info.type ?? 'unknown'
   }

   get absPath(): string_AbsPath {
      return this.source.absPath
   }

   get relPath(): string_RelPath {
      return this.source.relPath
   }

   get fileExt(): string_Ext {
      return this.source.fileExt
   }

   get rootDir(): string {
      return this.source.rootDir
   }

   // ---- print methods
   override printHeader(): void {
      console.log(fmtAbsPath(this.absPath))
      console.log(`[${this.emoji} ${this.assetType} #${fmtDazId(this.dazId)} @ ${fmtRelPath(this.relPath)}] `)
   }
}
