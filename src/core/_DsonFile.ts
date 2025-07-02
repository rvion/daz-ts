import type { PathInfo } from '../fs/PathInfo.js'
import { $$dson, $$modifier, $$morph, DazAssetType, string_DazId, string_DazUrl } from '../spec.js'
import { string_AbsPath, string_Ext, string_RelPath } from '../types.js'
import { ASSERT, ASSERT_, bang } from '../utils/assert.js'
import { fmtAbsPath } from '../utils/fmt.js'
import { DazAbstraction } from './_DazAbstraction.js'
import type { DazFileCharacter } from './DazFileCharacter.js'
import type { DazFileFigure } from './DazFileFigure.js'
import type { DazFileModifier } from './DazFileModifier.js'
import type { DazFilePose } from './DazFilePose.js'
import type { DazFileWearable } from './DazFileWearable.js'
import { DazGeometry } from './DazGeometry.js'
import { DazModifier } from './DazModifier.js'

export type KnownDazFile = DazFileCharacter | DazFileWearable | DazFileFigure | DazFilePose | DazFileModifier

export abstract class DsonFile extends DazAbstraction<PathInfo, $$dson> {
   abstract resolve(): Promise<void>

   // #region Geometry Library
   private _geometries: Map<string_DazId, DazGeometry> | null = null
   get geometries(): Map<string_DazId, DazGeometry> {
      if (this._geometries != null) return this._geometries
      this._geometries = new Map()
      if (this.data.geometry_library) {
         for (const geometryInfData of this.data.geometry_library) {
            const geometry = new DazGeometry(this.mgr, this, geometryInfData)
            this._geometries.set(geometry.dazId, geometry)
         }
      }
      return this._geometries
   }

   // #region Modifier Library
   private _modifiers: Map<string_DazId, DazModifier> | null = null
   get modifierList(): DazModifier[] {
      const value = [...this.modifiers.values()]
      Object.defineProperty(this, 'modifierList', { value })
      return value
   }
   get modifiers(): Map<string_DazId, DazModifier> {
      if (this._modifiers != null) return this._modifiers
      this._modifiers = new Map()
      if (this.data.modifier_library) {
         for (const modifierInfData of this.data.modifier_library) {
            const modifier = new DazModifier(this.mgr, this, modifierInfData)
            this._modifiers.set(modifier.dazId, modifier)
         }
      }
      return this._modifiers
   }

   // #region morpth
   /** returns the first morph modifier */
   getMorphModifier(): $$morph | null {
      ASSERT_(this.modifiers.size <= 1, 'too many modifiers in file; possibly wrong')
      if (this.modifiers.size === 0) return null
      const firstModifier = bang(this.modifierList[0])
      return firstModifier.data.morph ?? null
   }
   getFirstAndOnlyModifier_orCrash(): $$modifier | null {
      ASSERT_(this.modifiers.size <= 1, 'too many modifiers in file; possibly wrong')
      if (this.modifiers.size === 0) return null
      const firstModifier = bang(this.modifierList[0])
      return firstModifier.data
   }

   // #region skin data
   hasSkinData(): boolean {
      const skinModifier = this.getSkinBindingModifier()
      return !!(skinModifier?.skin?.joints && skinModifier.skin.joints.length > 0)
   }

   /** returns the first skin binding modifier */
   getSkinBindingModifier(): $$modifier | null {
      for (const modifier of this.modifiers.values()) {
         if (modifier.data.id === 'SkinBinding' || modifier.data.name === 'SkinBinding') {
            return modifier.data
         }
      }
      return null
   }

   // #region ---- main properties
   get dazId(): string_DazUrl { return this.data.asset_info.id } // biome-ignore format: misc
   get assetType(): DazAssetType { return this.data.asset_info.type ?? 'unknown' } // biome-ignore format: misc

   // #region ---- paths
   get absPath(): string_AbsPath { return this.source.absPath } // biome-ignore format: misc
   get relPath(): string_RelPath { return this.source.relPath } // biome-ignore format: misc
   get fileExt(): string_Ext { return this.source.fileExt } // biome-ignore format: misc
   get rootDir(): string { return this.source.rootDir } // biome-ignore format: misc
   get dazId_nice(): string { return this.dazId.replaceAll('%20', ' ') } // biome-ignore format: misc

   // #region ---- print methods
   override printHeader(): void {
      // console.log(`[${this.emoji} ${this.assetType} #${fmtDazId(this.dazId)}] ${fmtAbsPath(this.absPath)} `)
      console.log(`[${this.emoji} ${this.assetType}] ${fmtAbsPath(this.absPath)}`)
   }
}
