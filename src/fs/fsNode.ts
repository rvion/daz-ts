import * as fs_ from 'node:fs/promises'
import { string_AbsPath } from '../types.js'
import { createPathInfo, PathInfo } from './PathInfo.js'
import { WalkOptions } from './walk.js'

export type FS = {
   readPartialJSON: (path: string, bytes: number) => Promise<{ json: unknown; gz: boolean; fileSize: number }>
   readJSON: (path: string) => Promise<{ json: unknown; gz: boolean; fileSize: number }>
   writeFile: typeof fs_.writeFile
   mkdir: typeof fs_.mkdir
   discoverFiles: (rootDir: string_AbsPath, options?: WalkOptions) => Promise<PathInfo[]>
}

// biome-ignore format: misc
export const fsCrash: FS = {
   discoverFiles: () => { throw new Error('discoverFiles not implemented in fsCrash.js') },
   readPartialJSON: () => { throw new Error('readPartialJSON not implemented in fsCrash.js') },
   readJSON: async (path) => { return { json: await Bun.file(path).json(), gz: false, fileSize: 0 } }, // Bun's file API for reading JSON
   writeFile: () => { throw new Error('writeFile not implemented in fsCrash.js') },
   mkdir: () => { throw new Error('mkdir not implemented in fsCrash.js') },
}

export const fs: FS = {
   discoverFiles: async (rootDir: string_AbsPath, options: WalkOptions = {}): Promise<PathInfo[]> => {
      const { patterns = ['**/*.{dsa,dsf,duf}'], globOptions = {} } = options
      const fg = (await import('fast-glob')).default
      const files = await fg(patterns, {
         cwd: rootDir,
         absolute: true,
         onlyFiles: true,
         ...globOptions,
      })

      return files.map((file) => createPathInfo(file, rootDir))
   },
   readPartialJSON: async (path: string, bytes: number): Promise<{ json: unknown; gz: boolean; fileSize: number }> => {
      const fileHandle = await fs_.open(path, 'r')
      try {
         const stats = await fileHandle.stat()
         const fileSize = stats.size

         // read first few bytes to detect file type
         const headerBuffer = Buffer.alloc(Math.min(bytes, 1024))
         const { bytesRead: headerBytesRead } = await fileHandle.read(headerBuffer, 0, headerBuffer.length, 0)
         const headerPartial = headerBuffer.subarray(0, headerBytesRead)

         // use magic-bytes.js to determine if the file is gzipped or not
         const { filetypeinfo } = await import('magic-bytes.js')
         const info = filetypeinfo(headerPartial)

         let partialString: string
         const gz = info.some((t) => t.typename === 'gz')
         if (gz) {
            // For gzipped files, we need to decompress from the beginning
            const { readPartialGzipped } = await import('../fs/readPartialGzipped.js')
            partialString = await readPartialGzipped(path, bytes)
         } else {
            // For non-gzipped files, read the requested bytes directly
            const buffer = Buffer.alloc(bytes)
            const { bytesRead } = await fileHandle.read(buffer, 0, bytes, 0)
            const partialBuffer = buffer.subarray(0, bytesRead)
            partialString = partialBuffer.toString('utf-8')
         }

         const { OBJ, parse, STR } = await import('partial-json')
         const json = parse(partialString, STR | OBJ)
         return { json, gz, fileSize }
      } finally {
         await fileHandle.close()
      }
   },
   readJSON: async (path: string): Promise<{ json: unknown; gz: boolean; fileSize: number }> => {
      const fileBuffer = await fs_.readFile(path) // Read as Buffer
      const fileSize = fileBuffer.length
      try {
         // 1. Attempt to parse as plain JSON first
         const jsonString = fileBuffer.toString('utf-8')
         return { json: JSON.parse(jsonString), gz: false, fileSize }
      } catch (_jsonParseError) {
         try {
            // 2. If plain JSON parsing fails, assume it might be gzipped
            const zlib = await import('node:zlib')
            const decompressedBuffer = zlib.gunzipSync(fileBuffer) // Pass raw buffer
            const inflatedJsonString = decompressedBuffer.toString('utf-8')
            return { json: JSON.parse(inflatedJsonString), gz: true, fileSize }
         } catch (_gunzipExtractError) {
            // 3. If both attempts fail, throw an error
            throw new Error(`no json in ${path}.`)
         }
      }
   },
   writeFile: async (
      file: Arg0<typeof fs_.writeFile>,
      data: Arg1<typeof fs_.writeFile>,
      options?: Arg2<typeof fs_.writeFile> | undefined,
   ) => {
      const chalk = (await import('chalk')).default
      console.log(`Output written to ${chalk.cyanBright(file)}`)
      return fs_.writeFile(file, data, options)
   },
   // readdir: fs_.readdir,
   // stat: fs_.stat,
   mkdir: fs_.mkdir,
   // unlink: fs_.unlink,
   // copyFile: fs_.copyFile,
   // rename: fs_.rename,
}

// biome-ignore lint/suspicious/noExplicitAny: ok
type Arg0<F> = F extends (arg0: infer A, ...args: any[]) => any ? A : never
// biome-ignore lint/suspicious/noExplicitAny: ok
type Arg1<F> = F extends (arg0: any, arg1: infer A, ...args: any[]) => any ? A : never
// biome-ignore lint/suspicious/noExplicitAny: ok
type Arg2<F> = F extends (arg0: any, arg1: any, arg2: infer A, ...args: any[]) => any ? A : never
