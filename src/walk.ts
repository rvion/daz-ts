import * as fs from 'node:fs'
import * as path from 'pathe'
import { asAbsPath, string_AbsPath, string_Ext, string_RelPath } from './types.js'

export type FileMeta = {
   absPath: string_AbsPath
   relPath: string_RelPath
   rootDir: string
   fileExt: string_Ext
}

// Type definition for file processing callbacks
export type FileCallback<A> = (p: FileMeta) => A

// Interface for callback handlers
interface FileCallbacks<A> {
   onDsaFile?: FileCallback<A>
   onDsfFile?: FileCallback<A>
   onDufFile?: FileCallback<A>
}

/**
 * Recursively traverses a directory and executes callbacks for specified file types.
 * @param currentPath The current directory path to traverse.
 * @param rootDir The root directory of the traversal, used for calculating relative paths.
 * @param callbacks An object containing callback functions for different file extensions.
 */
export function walk<A>(
   //
   currentPath: string,
   rootDir: string,
   callbacks: FileCallbacks<A>,
   out: A[] = [],
): A[] {
   const items = fs.readdirSync(currentPath)
   for (const item of items) {
      const absPath = asAbsPath(path.join(currentPath, item))

      // ensure itemPath is a valid absolute path
      let stat: fs.Stats
      try {
         stat = fs.statSync(absPath)
      } catch (err: any) {
         console.error(`Error stating file/directory ${absPath}: ${err.message}`)
         continue // Skip if cannot stat
      }

      // recursively walk directories
      if (stat.isDirectory()) {
         walk(absPath, rootDir, callbacks, out)
      }

      // process files based on their extensions
      else if (stat.isFile()) {
         const fileExt = path.extname(item).toLowerCase()
         const relPath = path.relative(rootDir, absPath).replace(/\\/g, '/')

         // dsa
         if (fileExt === '.dsa' && callbacks.onDsaFile) {
            out.push(callbacks.onDsaFile({ absPath, relPath, rootDir, fileExt }))
         }
         // dsf
         else if (fileExt === '.dsf' && callbacks.onDsfFile) {
            out.push(callbacks.onDsfFile({ absPath, relPath, rootDir, fileExt }))
         }
         // duf
         else if (fileExt === '.duf' && callbacks.onDufFile) {
            out.push(callbacks.onDufFile({ absPath, relPath, rootDir, fileExt }))
         }
      }
   }
   return out
}
