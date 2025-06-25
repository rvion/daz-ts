import { string_AbsPath, string_Ext, string_RelPath } from '../types.js'

export type PathInfo = {
   absPath: string_AbsPath
   relPath: string_RelPath
   rootDir: string
   fileExt: string_Ext
   baseName: string
   fileName: string
}
