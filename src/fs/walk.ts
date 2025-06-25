import type { Options } from 'fast-glob'
import type { PathInfo } from './PathInfo.js'

// Type definition for file processing callbacks
export type FileCallback<A> = (p: PathInfo) => A

// Options for file discovery
export interface WalkOptions {
   /** Glob patterns to match files (default: ['**\/*.{dsa,dsf,duf}']) */
   patterns?: string[]
   /** Additional fast-glob options */
   globOptions?: Options
}

// Interface for callback handlers
interface FileCallbacks<A> {
   onDsaFile?: FileCallback<A>
   onDsfFile?: FileCallback<A>
   onDufFile?: FileCallback<A>
}

/**
 * Processes discovered files through callbacks
 * @returns Array of results from callbacks
 */
export function processFiles<A>(
   /** @param files Array of PathInfo objects to process */
   files: PathInfo[],
   /** @param callbacks Callback functions for different file types */
   callbacks: FileCallbacks<A>,
): A[] {
   const results: A[] = []
   for (const fileMeta of files) {
      const { fileExt } = fileMeta
      if (fileExt === '.dsa' && callbacks.onDsaFile) results.push(callbacks.onDsaFile(fileMeta))
      else if (fileExt === '.dsf' && callbacks.onDsfFile) results.push(callbacks.onDsfFile(fileMeta))
      else if (fileExt === '.duf' && callbacks.onDufFile) results.push(callbacks.onDufFile(fileMeta))
   }
   return results
}
