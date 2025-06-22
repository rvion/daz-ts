import * as fs_ from 'node:fs/promises'

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
      const data = await fs_.readFile(path, 'utf-8')
      return JSON.parse(data)
   },
   writeFile: fs_.writeFile,
   readdir: fs_.readdir,
   stat: fs_.stat,
   mkdir: fs_.mkdir,
   unlink: fs_.unlink,
   copyFile: fs_.copyFile,
   rename: fs_.rename,
}
