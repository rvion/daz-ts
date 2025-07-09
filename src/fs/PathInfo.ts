import * as path from 'pathe'
import { asAbsPath, string_AbsPath, string_Ext, string_RelPath } from '../types.js'

export type PathInfo = {
   absPath: string_AbsPath
   relPath: string_RelPath
   absPathLC: string_AbsPath
   relPathLC: string_RelPath
   rootDir: string
   fileExt: string_Ext
   baseName: string
   fileName: string
}

/**
 * Creates PathInfo from an absolute file path
 */
export function createPathInfo(absPath: string, rootDir: string): PathInfo {
   const fileExt = path.extname(absPath).toLowerCase() as string_Ext
   const relPath = path.relative(rootDir, absPath).replace(/\\/g, '/')
   const fileName = path.basename(absPath)
   const baseName = path.basename(absPath, fileExt) as string_Ext

   return {
      absPath: asAbsPath(absPath),
      relPath,
      absPathLC: asAbsPath(absPath.toLowerCase()),
      relPathLC: relPath.toLowerCase(),
      rootDir,
      fileExt,
      baseName,
      fileName,
   }
}
