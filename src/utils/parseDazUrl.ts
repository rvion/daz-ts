/*
# Asset Addressing

Many DSON objects have an _id_ property. These objects can be addressed using the Uniform Resource Identifier (URI) fragment identifier notation.

The syntax of URIs is defined in the Internet Engineering Task Force (IETF) document [RFC 3986](http://www.ietf.org/rfc/rfc3986.txt "http://www.ietf.org/rfc/rfc3986.txt") - `Uniform Resource Identifier (URI): Generic Syntax`. It defines a URI as consisting of five hierarchical parts: the scheme, authority, path, query, and fragment.

The syntax is:

```
      URI         = scheme ":" hier-part \[ "?" query \] \[ "#" fragment \]

      hier-part   = "//" authority path-abempty
                  / path-absolute
                  / path-rootless
                  / path-empty
```

The scheme and the hierarchy-part are required. The hierarchy-part, however, can be an empty path. URI syntax requires that the hierarchical path name levels (such as directories) be separated with forward slashes (`/`) and that other special characters within the path be escaped, for example, converting spaces to their hexadecimal representation `%20`. Entries are all considered case-sensitive.

In the DSON format, absolute path names (i.e. path names that begin with a leading `/`) are understood to be relative to the content root folder rather than being relative to a particular drive or file system root directory. Absolute path names that include directories above the content root folder (e.g. `/C:/My Documents/My Content/Victoria/BaseMorphs.dsf`) are discouraged in the format to allow assets to be addressed within a contained content directory. An absolute path that does not conform to the IETF convention must be adjusted to do so. For example, a Windows path `\\foo\\bar\\my file#GirlMorph.dsf`, by URI syntax definition, contains backslashes that could be treated the same as any other text character, not as valid separators. Although some applications look for Windows paths and convert them to valid URIs, not all applications do. Therefore, always use valid URI syntax, which for this example would be `/foo/bar/my%20file%23GirlMorph.dsf`.

Assets within a file are addressed using the fragment identifier (`#`). In a URL property, that is when an asset is to be looked up based on a URI, the URI fragment identifier is preceded with the literal pound sign or hash character (`#`). When defining the _id_ for an asset, no hash symbol is used, and the _id_ should not contain any path information, as this is derived from the file’s URL in combination with the asset’s path within the \*\_library in the file.

Whenever possible, it is better encoding practice to use paths that are relative to the location of the document that references them rather than to use absolute paths.

All _id_ values within a given file must be unique, regardless of what [Object Definitions](http://docs.daz3d.com/doku.php/public/dson_spec/object_definitions/start "public:dson_spec:object_definitions:start") they are part of.
*/

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
