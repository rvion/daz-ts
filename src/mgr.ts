import * as fs from 'node:fs/promises'
import * as path from 'pathe'
import { DazFile } from './dson.js'
import { string_AbsPath } from './types.js'
import { FileMeta, walk } from './walk.js'

export class Mgr {
   files = new Map<string_AbsPath, DazFile>()

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
      // console.log(`[🤠] type=`, type)
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
      const outputFile = 'data/processed_files.txt' // More generic name
      try {
         // Ensure the data directory exists
         const outputDir = path.dirname(outputFile)
         await fs.mkdir(outputDir, { recursive: true })
         await fs.writeFile(outputFile, summary)
         console.log(`Processed ${this.count} relevant files.`)
         console.log(`Output written to ${outputFile}`)
      } catch (err: any) {
         console.error(`Error writing to ${outputFile}: ${err.message}`)
      }
   }
}

const root = `C:/Users/Public/Documents/My DAZ 3D Library/`

export const mgr = new Mgr(root)
