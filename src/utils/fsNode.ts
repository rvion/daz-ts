import * as fs_ from 'node:fs/promises'
import zlib from 'node:zlib'

export type FS = {
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
