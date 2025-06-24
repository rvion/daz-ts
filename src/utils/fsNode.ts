import * as fs_ from 'node:fs/promises'
import zlib from 'node:zlib'
import { filetypeinfo } from 'magic-bytes.js'
import { OBJ, parse, STR } from 'partial-json'
import { readPartialGzipped } from './readPartialGzipped.js'

export type FS = {
   readPartialJSON: (path: string, bytes: number) => Promise<unknown>
   readJSON: (path: string) => Promise<unknown>
   writeFile: typeof fs_.writeFile
   readdir: typeof fs_.readdir
   stat: typeof fs_.stat
   mkdir: typeof fs_.mkdir
   unlink: typeof fs_.unlink
   copyFile: typeof fs_.copyFile
   rename: typeof fs_.rename
}

export const fs: FS = {
   readPartialJSON: async (path: string, bytes: number): Promise<unknown> => {
      const fileHandle = await fs_.open(path, 'r')
      try {
         // read first few bytes to detect file type
         const headerBuffer = Buffer.alloc(Math.min(bytes, 1024))
         const { bytesRead: headerBytesRead } = await fileHandle.read(headerBuffer, 0, headerBuffer.length, 0)
         const headerPartial = headerBuffer.subarray(0, headerBytesRead)

         // use magic-bytes.js to determine if the file is gzipped or not
         const info = filetypeinfo(headerPartial)

         let partialString: string
         if (info.find((t) => t.typename === 'gz')) {
            // For gzipped files, we need to decompress from the beginning
            partialString = await readPartialGzipped(path, bytes)
         } else {
            // For non-gzipped files, read the requested bytes directly
            const buffer = Buffer.alloc(bytes)
            const { bytesRead } = await fileHandle.read(buffer, 0, bytes, 0)
            const partialBuffer = buffer.subarray(0, bytesRead)
            partialString = partialBuffer.toString('utf-8')
         }

         const out = parse(partialString, STR | OBJ)
         // console.log(JSON.stringify(out))
         return out
      } finally {
         await fileHandle.close()
      }
   },
   readJSON: async (path: string): Promise<unknown> => {
      const fileBuffer = await fs_.readFile(path) // Read as Buffer
      try {
         // 1. Attempt to parse as plain JSON first
         const jsonString = fileBuffer.toString('utf-8')
         return JSON.parse(jsonString)
      } catch (_jsonParseError) {
         try {
            // 2. If plain JSON parsing fails, assume it might be gzipped
            // console.warn(`[🤠] ${path} is not plain JSON. Attempting to gunzip.`)
            const decompressedBuffer = zlib.gunzipSync(fileBuffer) // Pass raw buffer
            const inflatedJsonString = decompressedBuffer.toString('utf-8')
            return JSON.parse(inflatedJsonString)
         } catch (_gunzipExtractError) {
            // 3. If both attempts fail, throw an error
            throw new Error(`no json in ${path}.`)
         }
      }
   },
   writeFile: fs_.writeFile,
   readdir: fs_.readdir,
   stat: fs_.stat,
   mkdir: fs_.mkdir,
   unlink: fs_.unlink,
   copyFile: fs_.copyFile,
   rename: fs_.rename,
}
