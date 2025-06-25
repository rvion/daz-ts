import fg from 'fast-glob'
import * as path from 'pathe'
import { asAbsPath, string_Ext } from '../types.js'
import type { PathInfo } from './PathInfo.js'

// Type definition for file processing callbacks
export type FileCallback<A> = (p: PathInfo) => A

// Interface for callback handlers
interface FileCallbacks<A> {
   onDsaFile?: FileCallback<A>
   onDsfFile?: FileCallback<A>
   onDufFile?: FileCallback<A>
}

// Options for file discovery
export interface WalkOptions {
   /** Glob patterns to match files (default: ['**\/*.{dsa,dsf,duf}']) */
   patterns?: string[]
   /** Additional fast-glob options */
   globOptions?: fg.Options
}

/**
 * Creates PathInfo from an absolute file path
 */
function createPathInfo(absPath: string, rootDir: string): PathInfo {
   const fileExt = path.extname(absPath).toLowerCase() as string_Ext
   const relPath = path.relative(rootDir, absPath).replace(/\\/g, '/')
   const fileName = path.basename(absPath)
   const baseName = path.basename(absPath, fileExt) as string_Ext

   return { absPath: asAbsPath(absPath), relPath, rootDir, fileExt, baseName, fileName }
}

/**
 * Discovers files matching patterns using fast-glob
 * @param rootDir The root directory to search in
 * @param options Options for file discovery
 * @returns Promise resolving to array of PathInfo objects
 */
export async function discoverFiles(rootDir: string, options: WalkOptions = {}): Promise<PathInfo[]> {
   const { patterns = ['**/*.{dsa,dsf,duf}'], globOptions = {} } = options

   const files = await fg(patterns, {
      cwd: rootDir,
      absolute: true,
      onlyFiles: true,
      ...globOptions,
   })

   return files.map((file) => createPathInfo(file, rootDir))
}

/**
 * Processes discovered files through callbacks
 * @param files Array of PathInfo objects to process
 * @param callbacks Callback functions for different file types
 * @returns Array of results from callbacks
 */
export function processFiles<A>(files: PathInfo[], callbacks: FileCallbacks<A>): A[] {
   const results: A[] = []

   for (const fileMeta of files) {
      const { fileExt } = fileMeta

      if (fileExt === '.dsa' && callbacks.onDsaFile) {
         results.push(callbacks.onDsaFile(fileMeta))
      } else if (fileExt === '.dsf' && callbacks.onDsfFile) {
         results.push(callbacks.onDsfFile(fileMeta))
      } else if (fileExt === '.duf' && callbacks.onDufFile) {
         results.push(callbacks.onDufFile(fileMeta))
      }
   }

   return results
}

/**
 * Async version of the original walk function using fast-glob
 * @param rootDir The root directory to traverse
 * @param callbacks Callback functions for different file types
 * @param options Options for file discovery
 * @returns Promise resolving to array of callback results
 */
export async function walkAsync<A>(
   rootDir: string,
   callbacks: FileCallbacks<A>,
   options: WalkOptions = {},
): Promise<A[]> {
   const files = await discoverFiles(rootDir, options)
   return processFiles(files, callbacks)
}

/**
 * Legacy synchronous walk function (deprecated - use walkAsync instead)
 * @deprecated Use walkAsync for better performance
 */
export function walkSync<A>(currentPath: string, rootDir: string, callbacks: FileCallbacks<A>): A[] {
   // Convert to sync operation using fast-glob sync
   const patterns = ['**/*.{dsa,dsf,duf}']

   const files = fg.sync(patterns, {
      cwd: currentPath,
      absolute: true,
      onlyFiles: true,
   })

   const pathInfos = files.map((file) => createPathInfo(file, rootDir))
   return processFiles(pathInfos, callbacks)
}
