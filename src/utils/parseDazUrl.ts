import { dazId, string_DazId, string_DazUrl } from '../spec.js'
import { string_RelPath } from '../types.js'

export interface DazUrlParts {
   srcPath: string_RelPath
   idInFile: string_DazId | null
   nodeRef?: string_DazId // Optional node reference prefix
   property?: string // Optional property path like "rotation/x" or "value"
}

export interface DazUrlPartsWithId extends Omit<DazUrlParts, 'idInFile'> {
   idInFile: string_DazId
}

/**
 * Parse a Daz URL which can have several formats:
 * 1. Simple: "/data/path/file.dsf#id"
 * 2. With node prefix: "nodeId:/data/path/file.dsf#id"
 * 3. With property: "nodeId:/data/path/file.dsf#id?property/path"
 * 4. Local reference: "#id"
 * 5. Empty path with property: "#id?property"
 */
// export const parseDazUrl = (dazUrl: string_DazUrl): URL => {
//    // Handle URLs with node reference prefixes like "l_thigh:/data/..."
//    // We need to preprocess these before using URL constructor
//    let processedUrl: string = dazUrl

//    // Check if URL has a node reference prefix (pattern: nodeId:/path)
//    const nodeRefMatch = dazUrl.match(/^([^:/#?]+):(.*)$/)
//    if (nodeRefMatch && !nodeRefMatch[2].startsWith('//')) {
//       // This is a node reference, not a protocol
//       // Reconstruct without the node prefix for URL parsing
//       processedUrl = nodeRefMatch[2]
//    }

//    return new URL(processedUrl, 'daz://')
// }

export const getDazUrlParts = (dazUrl: string_DazUrl): DazUrlParts => {
   // Extract node reference prefix if present
   let nodeRef: string_DazId | undefined
   let urlToParse: string = dazUrl

   const nodeRefMatch = dazUrl.match(/^([^:/#?]+):(.*)$/)
   if (nodeRefMatch && !nodeRefMatch[2].startsWith('//')) {
      nodeRef = dazId(nodeRefMatch[1])
      urlToParse = nodeRefMatch[2]
   }

   const url = new URL(urlToParse, 'daz://')

   // Extract pathname and clean it up
   let path = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname

   // Decode URI components like %20 to spaces
   path = decodeURIComponent(path) as string_RelPath

   // Extract fragment (hash) and property
   let idInFile: string_DazId | null = null
   let property: string | undefined

   if (url.hash) {
      const hashContent = url.hash.startsWith('#') ? url.hash.substring(1) : url.hash

      // Check if hash contains a property (indicated by ?)
      const propertyMatch = hashContent.match(/^([^?]+)\?(.+)$/)
      if (propertyMatch) {
         idInFile = dazId(propertyMatch[1])
         property = propertyMatch[2]
      } else {
         idInFile = dazId(hashContent)
      }
   }

   // Handle search params as property if no hash property was found
   if (!property && url.search) {
      property = url.search.startsWith('?') ? url.search.substring(1) : url.search
   }

   return {
      srcPath: path,
      idInFile,
      nodeRef,
      property,
   }
}

export const getPathFromDazUrl = (dazUrl: string_DazUrl): string_RelPath | null => {
   const parts = getDazUrlParts(dazUrl)
   return parts ? parts.srcPath : null
}

export const getDazPathAndIdFromDazURL_orCrash = (dazUrl: string_DazUrl): DazUrlPartsWithId => {
   const parts = getDazUrlParts(dazUrl)
   if (!parts) {
      throw new Error(`[getDazPathAndIdFromDazURL_orCrash] Failed to parse Daz URL into parts: "${dazUrl}"`)
   }
   if (!parts.idInFile) {
      throw new Error(
         `[getDazPathAndIdFromDazURL_orCrash] Daz URL does not contain an ID (hash part) required for this operation: "${dazUrl}"`,
      )
   }
   // Type assertion is safe here due to the checks above
   return parts as DazUrlPartsWithId
}
