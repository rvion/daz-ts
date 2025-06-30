import chalk from 'chalk'
import { DefaultMap } from 'mnemonist'
import * as path from 'pathe'
import { DsonFile, KnownDazFile } from './core/_DsonFile.js'
import { DazFileCharacter } from './core/DazFileCharacter.js'
import { DazFileFigure } from './core/DazFileFigure.js'
import { DazFileModifier } from './core/DazFileModifier.js'
import { DazFilePose } from './core/DazFilePose.js'
import { DazWearable } from './core/DazFileWearable.js'
import { checkpoint, GLOBAL, registerMgrInstance } from './DI.js'
import type { FS } from './fs/fsNode.js'
import type { PathInfo } from './fs/PathInfo.js'
import { processFiles, type WalkOptions } from './fs/walk.js'
import { $$, $$asset_info, $$dson, DazAssetType, string_DazId, string_DazUrl } from './spec.js'
import { relPath, string_AbsPath, string_Ext, string_RelPath } from './types.js'
import { check_orCrash } from './utils/arkutils.js'
import { ASSERT_INSTANCE_OF, bang } from './utils/assert.js'
import { fmtAbsPath } from './utils/fmt.js'
import { DazUrlParts, getDazUrlParts } from './utils/parseDazUrl.js'
import { readableStringify } from './utils/readableStringify.js'

type CachedLibraryFiles = {
   assetType: DazAssetType
   relPath: string
   ext: string_Ext
}

export class DazMgr {
   /** @internal */ private ____DI____ = (() => registerMgrInstance(this))()

   // ---- files
   filesFull = new Map<string_AbsPath, KnownDazFile>()
   register(file: KnownDazFile) {
      this.filesFull.set(file.absPath, file)
   }

   // ---- full objects loaded during the run
   charactersByDazId: Map<string_DazId, DazFileCharacter> = new Map()
   charactersByRelPath: Map<string_RelPath, DazFileCharacter> = new Map()

   figuresByDazId: Map<string_DazId, DazFileFigure> = new Map()
   figuresByRelPath: Map<string_RelPath, DazFileFigure> = new Map()

   poseByDazId: Map<string_DazId, DazFilePose> = new Map()
   poseByRelPath: Map<string_RelPath, DazFilePose> = new Map()

   wearablesByDazId: Map<string_DazId, DazWearable> = new Map()
   wearablesByRelPath: Map<string_RelPath, DazWearable> = new Map()

   modifiersByDazId: Map<string_DazId, DazFileModifier> = new Map()
   modifiersByRelPath: Map<string_RelPath, DazFileModifier> = new Map()

   // ---- stats
   count = 0
   // countPerType = new DefaultMap<DazAssetType, number>(() => 0)
   countPerTypePerExt = new DefaultMap<string_Ext | 'total', DefaultMap<DazAssetType, { x: number }>>(
      () => new DefaultMap(() => ({ x: 0 })),
   )

   /**
    *  outputs something like
    * ```
    *            | total | duf | dsf |
    *  character |    10 |   5 |   5 |
    *  figure    |    10 |   5 |   5 |
    * ```
    */
   get statTable(): string {
      const out: string[] = []
      const exts = Array.from(this.countPerTypePerExt.keys()).sort()
      const totalMap = this.countPerTypePerExt.get('total')
      const types = Array.from(totalMap.keys()).sort()
      const PAD_TYPE = Math.max(...types.map((t) => t.length)) + 1 // +1 for padding
      const PAD_NUMBER = 5
      const header = ['Type'.padEnd(PAD_TYPE), ...exts.map((ext) => ext.padStart(PAD_NUMBER))].join(' | ')
      out.push(header)
      out.push('-'.repeat(header.length))
      for (const type of types) {
         const counts = exts.map((ext) => this.countPerTypePerExt.get(ext).get(type).x)
         const line = [
            type.padEnd(PAD_TYPE),
            ...counts.map((i) => (i === 0 ? '' : i.toString()).padStart(PAD_NUMBER)),
         ].join(' | ')
         out.push(line)
      }
      return out.join('\n')
   }

   incrementType = (type: DazAssetType, ext: string_Ext): void => {
      this.countPerTypePerExt.get('total').get(type).x++
      this.countPerTypePerExt.get(ext).get(type).x++
      // this.countPerType.set(type, (this.countPerType.get(type) ?? 0) + 1)
   }

   constructor(
      public absRootPath: string_AbsPath,
      public fs: FS,
   ) {}

   // ---- Load
   /**  Load full Daz asset, from meta. */
   async loadFile(relPath: string_RelPath) {
      return this._loadFromPathInfo(this._resolveRelPath(relPath)) // Store the file path in the manager
   }

   // async loadAbsPath(absPath: string_AbsPath) {
   //    const relPath = path.relative(this.absRootPath, absPath) as string_RelPath
   //    return this._loadFromPathInfo(this._resolveRelPath(relPath)) // Store the file path in the manager
   // }

   // ---- Load > Genesis 9 samples
   private genesis9baseDuf = relPath`People/Genesis 9/Genesis 9.duf`
   private genesis9baseDsf = relPath`data/DAZ 3D/Genesis 9/Base/Genesis9.dsf`

   async loadGenesis9CharacterFile(): Promise<DazFileCharacter> {
      const f = await this.loadFile(this.genesis9baseDuf)
      return ASSERT_INSTANCE_OF(f, GLOBAL.DazFileCharacter)
   }
   async loadGenesis9FigureFile(): Promise<DazFileFigure> {
      const f = await this.loadFile(this.genesis9baseDsf)
      return ASSERT_INSTANCE_OF(f, GLOBAL.DazFileFigure)
   }
   async loadPoseFile(relPath: string_RelPath): Promise<DazFilePose> {
      const f = await this.loadFile(relPath)
      return ASSERT_INSTANCE_OF(f, GLOBAL.DazFilePose)
   }
   /**  Load full Daz asset, hydrate graph, resolve URLs. */
   private async _loadFromPathInfo(meta: PathInfo): Promise<KnownDazFile> {
      // use cached file if exists
      if (this.filesFull.has(meta.absPath)) return bang(this.filesFull.get(meta.absPath))
      // console.log(`[💿] loading ${fmtAbsPath(meta.absPath)} `)

      // load dson
      const json = await this.fs.readJSON(meta.absPath)
      const dson = await check_orCrash($$.dson, json, meta.absPath)
      this.incrementType(dson.asset_info.type, meta.fileExt)
      this.count++

      // load full
      const stuff = await this._hydrateDson(meta, dson)
      // 💬 2025-06-30 rvion: have to remove this from here,
      this.filesFull.set(meta.absPath, stuff)
      await stuff.resolve()
      return stuff
   }

   async loadDazFigureByRelPath_orCrash(relPath: string_RelPath): Promise<DazFileFigure> {
      const file = await this.loadFile(relPath)
      if (file instanceof GLOBAL.DazFileFigure) return file
      const errMst = `Expected DazFigure at "${relPath}", but found ${file.constructor.name} (AssetType: ${file.assetType}, DazID: ${file.dazId})`
      throw new Error(errMst)
   }

   private _hydrateDson(meta: PathInfo, dson: $$dson): Promise<KnownDazFile> {
      const assetType = dson.asset_info.type
      if (assetType === 'wearable') return DazWearable.init(this, meta, dson)
      else if (assetType === 'character') return DazFileCharacter.init(this, meta, dson)
      else if (assetType === 'figure') return DazFileFigure.init(this, meta, dson)
      else if (assetType === 'preset_pose') return DazFilePose.init(this, meta, dson)
      else if (assetType === 'modifier') return DazFileModifier.init(this, meta, dson)
      else if (assetType === 'prop') return DazFileFigure.init(this, meta, dson)
      else throw new Error(`Invalid asset type: ${chalk.red(`'${assetType}'`)} in "${meta.absPath}"`)
   }

   parseUrl(url: string_DazUrl): DazUrlParts {
      return getDazUrlParts(url)
   }

   // #region ---- Inspect Library
   async getCachedFiles(): Promise<CachedLibraryFiles[]> {
      const out = await this.fs.readJSON('data/processed_files.json')
      return out as CachedLibraryFiles[]
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

   // #region ---- Summarize
   async summarize(): Promise<string> {
      checkpoint('summarize.start')
      const logUnexpectedParseError = (f: PathInfo) => (_err: unknown) => {
         if (f.fileName.startsWith('._')) return // skip hidden files
         console.log(`[🔶] skipping ${f.absPath}: ${_err}`)
      }
      const files = await this.fs.discoverFiles(this.absRootPath)
      checkpoint('summarize.walk-end')
      const res = processFiles(files, {
         onDufFile: (f) => this._peek(f).catch(logUnexpectedParseError(f)),
         onDsfFile: (f) => this._peek(f).catch(logUnexpectedParseError(f)),
      })
      checkpoint('summarize.parse-spawn')
      await Promise.all(res)
      checkpoint('summarize.parse-end')
      await this._saveSummary()
      checkpoint('summarize.summary-end')
      return this.statTable
   }

   /** Only load as simple DSON file. do not hydrate graph. do not resolve URLs. */
   private _seenFiles: CachedLibraryFiles[] = []

   private async _peek(meta: PathInfo): Promise<$$asset_info> {
      const json = await this.fs.readPartialJSON(meta.absPath, 2000)
      const dson = await check_orCrash($$.dson, json, meta.absPath)
      const assetType: DazAssetType = dson.asset_info.type
      this.incrementType(assetType, meta.fileExt)
      const { relPath, fileExt: ext } = meta
      this._seenFiles.push({ relPath, assetType, ext })
      this.count++
      return dson.asset_info
   }

   private async _saveSummary() {
      const sortedFiles = this._seenFiles.sort((a, b) => a.relPath.localeCompare(b.relPath))
      const summary = readableStringify(sortedFiles, 0)
      const pathAssetList = 'data/processed_files.json' // More generic name
      const pathStats = 'data/stats.txt' // More generic name
      try {
         // Ensure the data directory exists
         const outputDir = path.dirname(pathAssetList)
         await this.fs.mkdir(outputDir, { recursive: true })
         await this._writeFile(pathAssetList, summary)
         await this._writeFile(pathStats, this.statTable)
         console.log(`Processed ${this.count} relevant files.`)
      } catch (err: unknown) {
         console.error(`Error writing to ${pathAssetList}`, err)
      }
   }

   // #region ---- Utils
   private _writeFile(path: string, content: string): Promise<void> {
      return this.fs.writeFile(path, content)
   }

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
         fileExt: fileExt,
         rootDir: this.absRootPath,
         baseName,
         fileName,
      }
      return fileMeta
   }
}
