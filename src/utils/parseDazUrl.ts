import { asDazId, string_DazId, string_DazUrl } from '../spec.js' // Added asDazId and string_DazId
import { string_RelPath } from '../types.js'

export interface DazUrlParts {
   path: string_RelPath
   idInFile: string_DazId | null
}

export interface DazUrlPartsWithId extends Omit<DazUrlParts, 'idInFile'> {
   idInFile: string_DazId
}

export const parseDazUrl = (dazUrl: string_DazUrl): URL => {
   // The 'daz://' base is used to help the URL constructor parse Daz URLs like
   // "/data/Daz 3D/Genesis 9/.../Genesis9.dsf#Genesis9"
   // or "name://@selection#geometries/Genesis9:"
   // It ensures that `pathname` and `hash` are correctly populated.
   return new URL(dazUrl, 'daz://')
}

export const getDazUrlParts = (dazUrl: string_DazUrl): DazUrlParts | null => {
   const url = parseDazUrl(dazUrl)

   if (!url.pathname) {
      console.error(`[getDazUrlParts] Could not extract pathname from Daz URL: ${dazUrl}`)
      return null
   }

   // Pathname often starts with a leading '/' from the URL parsing, remove it.
   // Also, decode URI components like %20 to spaces.
   const path = (url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname).replace(
      /%20/g,
      ' ',
   ) as string_RelPath

   let idInFile: string_DazId | null = null
   if (url.hash) {
      // Hash usually starts with '#', remove it.
      idInFile = asDazId(url.hash.startsWith('#') ? url.hash.substring(1) : url.hash)
   }

   if (!path) {
      // idInFile can be null for some URLs like file paths
      console.error(`[getDazUrlParts] Extracted path is empty for Daz URL: ${dazUrl}`)
      return null
   }

   return { path, idInFile }
}

export const getPathFromDazUrl = (dazUrl: string_DazUrl): string_RelPath | null => {
   const parts = getDazUrlParts(dazUrl)
   return parts ? parts.path : null
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
