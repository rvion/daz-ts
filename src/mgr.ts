import chalk from 'chalk'
import * as path from 'pathe'
import { AnyDsonFile, DsonFile, KnownDazFile } from './core/_DsonFile.js'
import { DazCharacter } from './core/DazFileCharacter.js'
import { DazFigure } from './core/DazFileFigure.js'
import { DazFilePose } from './core/DazFilePose.js'
import { DazWearable } from './core/DazFileWearable.js'
import { GLOBAL } from './DI.js'
import { $$, $$dson, DazAssetType, string_DazId } from './spec.js'
import { any_, string_AbsPath, string_Ext, string_RelPath } from './types.js'
import { check_orCrash } from './utils/arkutils.js'
import { bang } from './utils/assert.js'
import { FS } from './utils/fsNode.js'
import { FileMeta, walk } from './walk.js'

export class DazMgr {
   // ---- files
   filesSimple = new Map<string_AbsPath, DsonFile<any_>>()
   filesFull = new Map<string_AbsPath, KnownDazFile>()

   // ---- full objects loaded during the run
   charactersByDazId: Map<string_DazId, DazCharacter> = new Map()
   charactersByRelPath: Map<string_RelPath, DazCharacter> = new Map()

   figuresByDazId: Map<string_DazId, DazFigure> = new Map()
   figuresByRelPath: Map<string_RelPath, DazFigure> = new Map()

   poseByDazId: Map<string_DazId, DazFilePose> = new Map()
   poseByRelPath: Map<string_RelPath, DazFilePose> = new Map()

   wearablesByDazId: Map<string_DazId, DazWearable> = new Map()
   wearablesByRelPath: Map<string_RelPath, DazWearable> = new Map()

   // ---- stats
   count = 0
   countPerType = new Map<DazAssetType, number>()
   incrementType = (type: DazAssetType): void => {
      this.countPerType.set(type, (this.countPerType.get(type) ?? 0) + 1)
   }

   constructor(
      //
      public absRootPath: string_AbsPath,
      public fs: FS,
   ) {}

   // ---- Load Simple
   async loadSimple_FromRelPath(relPath: string_RelPath): Promise<DsonFile<any_>> {
      return this.loadSimple_fromMeta(this._getFileMeta(relPath)) // Store the file path in the manager
   }

   /** Only load as simple DSON file. do not hydrate graph. do not resolve URLs. */
   private async loadSimple_fromMeta(meta: FileMeta): Promise<DsonFile<any_>> {
      // use cached file if exists
      if (this.filesSimple.has(meta.absPath)) return bang(this.filesSimple.get(meta.absPath))

      // load dson
      const json = await this.fs.readJSON(meta.absPath)
      const dson = check_orCrash($$.dson, json, meta.absPath)
      this.incrementType(dson.asset_info.type)
      this.count++

      // load simple
      const file = new AnyDsonFile(this, meta, dson)
      this.filesSimple.set(file.absPath, file)
      return file
   }

   // ---- Load Full
   /**  Load full Daz asset, from meta. */
   async loadFull_FromRelPath(relPath: string_RelPath) {
      return this.loadFull_fromMeta(this._getFileMeta(relPath)) // Store the file path in the manager
   }

   /**  Load full Daz asset, hydrate graph, resolve URLs. */
   private async loadFull_fromMeta(meta: FileMeta): Promise<KnownDazFile> {
      // use cached file if exists
      if (this.filesFull.has(meta.absPath)) return bang(this.filesFull.get(meta.absPath))

      // load dson
      const json = await this.fs.readJSON(meta.absPath)
      const dson = check_orCrash($$.dson, json, meta.absPath)
      this.incrementType(dson.asset_info.type)
      this.count++

      // load full
      const stuff = await this.loadStuff(meta, dson)
      this.filesSimple.set(meta.absPath, stuff) // also store as simple file
      this.filesFull.set(meta.absPath, stuff)
      return stuff
   }

   async loadDazFigureByRelPath_orCrash(relPath: string_RelPath): Promise<DazFigure> {
      const file = await this.loadFull_FromRelPath(relPath)
      if (file instanceof GLOBAL.DazFigure) return file
      const errMst = `Expected DazFigure at "${relPath}", but found ${file.constructor.name} (AssetType: ${file.assetType}, DazID: ${file.dazId})`
      throw new Error(errMst)
   }

   private loadStuff(meta: FileMeta, dson: $$dson): Promise<KnownDazFile> {
      const assetType = dson.asset_info.type
      if (assetType === 'wearable') return DazWearable.init(this, meta, dson)
      else if (assetType === 'character') return DazCharacter.init(this, meta, dson)
      else if (assetType === 'figure') return DazFigure.init(this, meta, dson)
      else if (assetType === 'preset_pose') return DazFilePose.init(this, meta, dson)
      else throw new Error(`Invalid asset type: ${chalk.red(`'${assetType}'`)} in "${meta.absPath}"`)
   }

   // ---- Summarize
   async summarize() {
      const res = walk(this.absRootPath, this.absRootPath, {
         onDufFile: (f) =>
            this.loadSimple_fromMeta(f).catch((_err) => {
               if (f.fileName.startsWith('._')) return // skip hidden files
               console.log(`[🤠] skipping ${f.fileName}`)
            }),
         // onDsaFile: (f) => this.handleFile(f),
         // onDsfFile: (f) => this.handleFile(f),
      })
      await Promise.all(res)
      return this.saveSummary()
   }

   async saveSummary() {
      const summary = [...this.filesSimple.values()] //
         .map((f) => `{${f.fileExt}} [${f.assetType}] ${f.relPath}`)
         .sort()
         .join('\n')

      const pathAssetList = 'data/processed_files.txt' // More generic name
      const pathStats = 'data/stats.txt' // More generic name
      try {
         // Ensure the data directory exists
         const outputDir = path.dirname(pathAssetList)
         await this.fs.mkdir(outputDir, { recursive: true })
         await this._writeFile(pathAssetList, summary)
         await this._writeFile(pathStats, JSON.stringify(Object.fromEntries(this.countPerType), null, 2))
         console.log(`Processed ${this.count} relevant files.`)
      } catch (err: unknown) {
         console.error(`Error writing to ${pathAssetList}`, err)
      }
   }

   // ---- Utils
   private _writeFile(path: string, content: string): Promise<void> {
      console.log(`Output written to ${chalk.cyanBright(path)}`)
      return this.fs.writeFile(path, content)
   }

   private _getFileMeta(relPath: string_RelPath): FileMeta {
      const absPath = path.join(this.absRootPath, relPath)
      const fileExt = path.extname(absPath) as string_Ext // Ensure this is a valid extension
      const baseName = path.basename(absPath, fileExt) // Get the base name without extension
      const fileName = path.basename(absPath) // Get the base name without extension
      const fileMeta: FileMeta = {
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
