import * as fs from 'node:fs/promises'
import chalk from 'chalk'
import * as path from 'pathe'
import { DazFile } from './dson.js'
import { DazAssetType } from './spec.js'
import { string_AbsPath } from './types.js'
import { FileMeta, walk } from './walk.js'

export class Mgr {
   files = new Map<string_AbsPath, DazFile>()
   countPerType = new Map<DazAssetType, number>()

   constructor(public absRootPath: string_AbsPath) {}

   file(p: FileMeta): DazFile {
      const prev = this.files.get(p.absPath)
      if (prev) return prev
      const file = new DazFile(p)
      this.files.set(p.absPath, file)
      return file
   }

   count = 0

   async handleFile(p: FileMeta): Promise<string> {
      this.count++
      const file = this.file(p) // Store the file path in the manager
      const type = await file.assetType
      this.countPerType.set(type, (this.countPerType.get(type) ?? 0) + 1)
      return `{${p.fileExt}} [${type}] ${p.relPath}`
   }

   async run() {
      const res = walk(this.absRootPath, this.absRootPath, {
         onDufFile: (f) => this.handleFile(f),
         // onDsaFile: (f) => this.handleFile(f),
         // onDsfFile: (f) => this.handleFile(f),
      })
      console.log(`[🤠] A`, res.length)
      const lines = await Promise.all(res).then((lines) => lines.sort())
      console.log(`[🤠] B`)
      const summary = lines.join('\n')
      return this.saveSummary(summary)
   }

   async saveSummary(summary: string) {
      const pathAssetList = 'data/processed_files.txt' // More generic name
      const pathStats = 'data/stats.txt' // More generic name
      try {
         // Ensure the data directory exists
         const outputDir = path.dirname(pathAssetList)
         await fs.mkdir(outputDir, { recursive: true })
         await this.writeFile(pathAssetList, summary)
         await this.writeFile(pathStats, JSON.stringify(Object.fromEntries(this.countPerType), null, 2))
         console.log(`Processed ${this.count} relevant files.`)
      } catch (err: unknown) {
         console.error(`Error writing to ${pathAssetList}`, err)
      }
   }
   private writeFile(path: string, content: string): Promise<void> {
      console.log(`Output written to ${chalk.cyanBright(path)}`)
      return fs.writeFile(path, content)
   }
}

const root = `C:/Users/Public/Documents/My DAZ 3D Library/`

export const mgr = new Mgr(root)
