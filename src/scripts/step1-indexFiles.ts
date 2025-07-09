import { DefaultMap } from 'mnemonist'
import * as path from 'pathe'
import '../DI.js'

import { checkpoint } from '../DI.js'
import { fs } from '../fs/fsNode.js'
import { PathInfo } from '../fs/PathInfo.js'
import { processFiles } from '../fs/walk.js'
import { DazMgr } from '../mgr.js'
import { $$, $$asset_info, DazAssetType } from '../spec.js'
import { string_Ext } from '../types.js'
import { check_orCrash } from '../utils/arkutils.js'
import { readableStringify } from '../utils/readableStringify.js'

export type FileEntry = {
   assetType: DazAssetType
   relPath: string
   ext: string_Ext
   gz?: boolean
   fileSize?: number
}

const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
class Step1 {
   count: number = 0
   countPerTypePerExt = new DefaultMap<string_Ext | 'total', DefaultMap<DazAssetType, { x: number }>>(
      () => new DefaultMap(() => ({ x: 0 })),
   )
   incrementType = (type_: DazAssetType | undefined, ext: string_Ext): void => {
      const type = type_ ?? 'unknown' // Default to 'unknown' if type is undefined
      this.countPerTypePerExt.get('total').get(type).x++
      this.countPerTypePerExt.get(ext).get(type).x++
      // this.countPerType.set(type, (this.countPerType.get(type) ?? 0) + 1)
   }

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

   async summarize(): Promise<string> {
      checkpoint('summarize.start')
      const logUnexpectedParseError = (f: PathInfo) => (_err: unknown) => {
         if (f.fileName.startsWith('._')) return // skip hidden files
         console.log(`[🔶] skipping ${f.absPath}: ${_err}`)
      }
      const files = await mgr.fs.discoverFiles(mgr.absRootPath)
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
   private _seenFiles: FileEntry[] = []

   private async _peek(meta: PathInfo): Promise<$$asset_info> {
      const { json, gz, fileSize } = await mgr.fs.readPartialJSON(meta.absPath, 2000)
      const dson = await check_orCrash($$.dson_peek, json, meta.absPath)
      const assetType_: DazAssetType | undefined = dson.asset_info.type
      const assetType = assetType_ ?? 'unknown'
      this.incrementType(assetType, meta.fileExt)
      const { relPath, fileExt: ext } = meta
      this._seenFiles.push({ relPath, assetType, ext, gz, fileSize })
      this.count++
      return dson.asset_info
   }

   private async _saveSummary() {
      const sortedFiles: FileEntry[] = this._seenFiles.sort((a, b) => a.relPath.localeCompare(b.relPath))
      const summary = readableStringify(sortedFiles, 0)
      const pathAssetList = 'data/processed_files.json' // More generic name
      const pathStats = 'data/stats.txt' // More generic name
      try {
         // Ensure the data directory exists
         const outputDir = path.dirname(pathAssetList)
         await mgr.fs.mkdir(outputDir, { recursive: true })
         await mgr.fs.writeFile(pathAssetList, summary)
         await mgr.fs.writeFile(pathStats, this.statTable)
         console.log(`Processed ${this.count} relevant files.`)
      } catch (err: unknown) {
         console.error(`Error writing to ${pathAssetList}`, err)
      }
   }
}
const step1 = new Step1()
console.log(await step1.summarize())
checkpoint('done')
