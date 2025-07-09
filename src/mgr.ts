import chalk from 'chalk'
import { nanoid } from 'nanoid'
import * as path from 'pathe'
import { KnownDazFile } from './core/DazFile.js'
import { DazFileCharacter } from './core/DazFileCharacter.js'
import { DazFileFigure } from './core/DazFileFigure.js'
import { DazFileModifier } from './core/DazFileModifier.js'
import { DazFilePose } from './core/DazFilePose.js'
import { DazFileWearable } from './core/DazFileWearable.js'
import { DazModifierDef } from './core/DazModifierDef.js'
import { DazNodeDef } from './core/DazNodeDef.js'
import { GLOBAL, registerMgrInstance } from './DI.js'
import type { FS } from './fs/fsNode.js'
import type { PathInfo } from './fs/PathInfo.js'
import { type WalkOptions } from './fs/walk.js'
import { RVScene } from './scene/RVScene.js'
import { FileEntry } from './scripts/step1-indexFiles.js'
import { ModifierDB } from './scripts/step2-parse-modifiers.js'
import { $$, $$dson, DazAssetType, string_DazUrl } from './spec.js'
import { relPath, string_AbsPath, string_Ext, string_RelPath } from './types.js'
import { check_orCrash } from './utils/arkutils.js'
import { ASSERT_INSTANCE_OF, bang } from './utils/assert.js'
import { DazUrlParts, parseDazUrl } from './utils/parseDazUrl.js'

export class DazMgr {
   uid = nanoid(4)
   /** @internal */ private ____DI____ = (() => registerMgrInstance(this))()
   public scene: RVScene | null = null
   public modifiersDb: ModifierDB | null = null
   public getModifierDB_orCrash(): ModifierDB {
      if (this.modifiersDb) return this.modifiersDb
      throw new Error('Modifiers database not loaded. Call loadModifiersDb() first.')
   }
   async loadModifiersDb(): Promise<ModifierDB> {
      if (this.modifiersDb) return this.modifiersDb
      const dbPath = 'data/modifiers.json'
      try {
         const { json } = await this.fs.readJSON(dbPath)
         this.modifiersDb = json as ModifierDB
      } catch (originalError) {
         console.error(originalError)
         throw new Error(`Modifiers database not found at ${dbPath}. Run 'bun src/scripts/parse-modifiers.ts' to generate it.`,) // biome-ignore format: misc
      }
      return this.modifiersDb
   }

   // ---- files
   filesFull = new Map<string_AbsPath, KnownDazFile>()
   getPreviouslyLoadedFile_orCrash(absPath: string_AbsPath): KnownDazFile {
      const file = this.filesFull.get(absPath.toLowerCase())
      if (!file) throw new Error(`File not found: ${absPath}`)
      return file
   }
   register(file: KnownDazFile) {
      this.filesFull.set(file.absPath.toLowerCase(), file)
   }

   constructor(
      public absRootPath: string_AbsPath,
      public fs: FS,
   ) {
      // biome-ignore lint/suspicious/noExplicitAny: ...
      const glb = globalThis as any
      glb.mgr = this // for debugging
   }

   createScene(): RVScene {
      return new RVScene(this)
   }

   // ---- Load
   /**  Load full Daz asset, from meta. */
   async loadFileFromAbsPath(absPath: string_AbsPath): Promise<KnownDazFile> {
      return await this._loadFromPathInfo(this._resolveAbsPath(absPath))
   }

   async loadFileFromRelPath(relPath: string_RelPath) {
      return await this._loadFromPathInfo(this._resolveRelPath(relPath))
   }

   // biome-ignore lint/suspicious/noExplicitAny: misc
   async loadFileAs<T>(relPath: string_RelPath, TKlass: new (...args: any[]) => T): Promise<T> {
      const file = await this._loadFromPathInfo(this._resolveRelPath(relPath))
      return ASSERT_INSTANCE_OF(file, TKlass)
   }

   // ---- Load > Genesis 9 samples
   genesis9baseDufRelPath: string_RelPath = relPath`People/Genesis 9/Genesis 9.duf`
   genesis9baseDsfRelPath: string_RelPath = relPath`data/DAZ 3D/Genesis 9/Base/Genesis9.dsf`

   async loadGenesis9CharacterFile(): Promise<DazFileCharacter> {
      const f = await this.loadFileFromRelPath(this.genesis9baseDufRelPath)
      return ASSERT_INSTANCE_OF(f, GLOBAL.DazFileCharacter)
   }
   async loadGenesis9FigureFile(): Promise<DazFileFigure> {
      const f = await this.loadFileFromRelPath(this.genesis9baseDsfRelPath)
      return ASSERT_INSTANCE_OF(f, GLOBAL.DazFileFigure)
   }

   async loadPoseFile(relPath: string_RelPath): Promise<DazFilePose> {
      const f = await this.loadFileFromRelPath(relPath)
      return ASSERT_INSTANCE_OF(f, GLOBAL.DazFilePose)
   }

   /**  Load full Daz asset, hydrate graph, resolve URLs. */
   private async _loadFromPathInfo(meta: PathInfo): Promise<KnownDazFile> {
      // use cached file if exists
      if (this.filesFull.has(meta.absPathLC)) return bang(this.filesFull.get(meta.absPathLC))

      // load dson
      const { json } = await this.fs.readJSON(meta.absPath)
      const dson = await check_orCrash($$.dson, json, meta.absPath)

      // load full
      const stuff = await this._hydrateDson(meta, dson)
      // 💬 2025-06-30 rvion: have to remove this from here,
      this.filesFull.set(meta.absPathLC, stuff)
      return stuff
   }

   async loadDazFigureByRelPath_orCrash(relPath: string_RelPath): Promise<DazFileFigure> {
      const file = await this.loadFileFromRelPath(relPath)
      if (file instanceof GLOBAL.DazFileFigure) return file
      const errMst = `Expected DazFigure at "${relPath}", but found ${file.constructor.name} (AssetType: ${file.assetType}, DazID: ${file.dazId})`
      throw new Error(errMst)
   }

   private _hydrateDson(meta: PathInfo, dson: $$dson): Promise<KnownDazFile> {
      const assetType = dson.asset_info.type
      if (assetType === 'wearable') return DazFileWearable.init(this, meta, dson)
      else if (assetType === 'character') return DazFileCharacter.init(this, meta, dson)
      else if (assetType === 'figure') return DazFileFigure.init(this, meta, dson)
      else if (assetType === 'preset_pose') return DazFilePose.init(this, meta, dson)
      else if (assetType === 'modifier') return DazFileModifier.init(this, meta, dson)
      else if (assetType === 'prop') return DazFileFigure.init(this, meta, dson)
      else throw new Error(`Invalid asset type: ${chalk.red(`'${assetType}'`)} in "${meta.absPath}"`)
   }

   parseUrl(url: string_DazUrl): DazUrlParts {
      return parseDazUrl(url)
   }

   // #region ---- Inspect Library
   async loadFileIndex(): Promise<FileEntry[]> {
      const { json } = await this.fs.readJSON('data/processed_files.json')
      return json as FileEntry[]
   }

   async getAllAssetAbsPaths(options?: WalkOptions): Promise<{ duf: string_AbsPath[]; dsf: string_AbsPath[] }> {
      const duf: string_AbsPath[] = []
      const dsf: string_AbsPath[] = []
      const files = await this.fs.discoverFiles(this.absRootPath, options)
      for (const file of files) {
         if (file.fileExt === '.duf') duf.push(file.absPath)
         else if (file.fileExt === '.dsf') dsf.push(file.absPath)
      }
      return { duf, dsf }
   }

   async resolveModifierDef(url: string_DazUrl | DazUrlParts, FROM: KnownDazFile): Promise<DazModifierDef> {
      const parts: DazUrlParts = typeof url === 'string' ? this.parseUrl(url) : url
      const file = await this.resolveFileFromUrl(parts, FROM)
      if (parts.asset_id == null) throw new Error('Asset ID is missing in the URL parts.')
      const asset = file.modifierDefMap.get(parts.asset_id) // biome-ignore format: misc
      if (asset == null) throw new Error(`Modifier with ID "${parts.asset_id}" not found in file "${file.absPath}".`)
      return asset
   }

   async resolveNodeDef(url: string_DazUrl | DazUrlParts, FROM: KnownDazFile): Promise<DazNodeDef> {
      const parts: DazUrlParts = typeof url === 'string' ? this.parseUrl(url) : url
      const file = await this.resolveFileFromUrl(parts, FROM)
      if (parts.asset_id == null) throw new Error('Asset ID is missing in the URL parts.')
      const asset = file.nodeDefMap.get(parts.asset_id) // biome-ignore format: misc
      if (asset == null)
         throw new Error(
            `Node with ID "${parts.asset_id}" not found in file "${file.absPathLC}". assets: ${[...file.nodeDefMap.keys()]}`,
         )
      return asset
   }

   resolveFileFromUrl(url: string_DazUrl | DazUrlParts, FROM: KnownDazFile): Promise<KnownDazFile> {
      const parts: DazUrlParts = typeof url === 'string' ? this.parseUrl(url) : url
      if (!parts.file_path) return Promise.resolve(FROM)
      // all daz urls should be relative.
      let relPath = parts.file_path as string_RelPath
      if (relPath.startsWith('/')) {
         relPath = relPath.slice(1) as string_RelPath // Remove leading slash for relative path
         console.log(`[⁉️#wEj22WfFZ5] "${parts.file_path}" starts with a slash, treating as relative path.`)
      }
      return this.loadFileFromRelPath(relPath)
   }
   // #region ---- Utils
   private _resolveAbsPath(absPath: string_AbsPath): PathInfo {
      const relPath = path.relative(this.absRootPath, absPath) as string_RelPath
      return this.__resolveInteral(relPath, absPath)
   }

   private _resolveRelPath(relPath: string_RelPath): PathInfo {
      const absPath = path.join(this.absRootPath, relPath)
      return this.__resolveInteral(relPath, absPath)
   }

   /** @internal */
   private __resolveInteral(relPath: string_RelPath, absPath: string_AbsPath): PathInfo {
      const fileExt = path.extname(absPath) as string_Ext // Ensure this is a valid extension
      const baseName = path.basename(absPath, fileExt) // Get the base name without extension
      const fileName = path.basename(absPath) // Get the base name without extension
      const fileMeta: PathInfo = {
         absPath: absPath as string_AbsPath,
         relPath: relPath as string_RelPath,
         absPathLC: absPath.toLowerCase() as string_AbsPath,
         relPathLC: relPath.toLowerCase() as string_RelPath,
         fileExt: fileExt,
         rootDir: this.absRootPath,
         baseName,
         fileName,
      }
      return fileMeta
   }
}
