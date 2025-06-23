import { asDazId, string_DazId, string_DazUrl } from '../spec.js' // Added asDazId and string_DazId
import { string_RelPath } from '../types.js'

export interface DazUrlParts {
   srcPath: string_RelPath
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

export const getDazUrlParts = (dazUrl: string_DazUrl): DazUrlParts => {
   const url = parseDazUrl(dazUrl)

   // if (!url.pathname) {
   //    console.error(`[getDazUrlParts] Could not extract pathname from Daz URL: ${dazUrl}`)
   //    return null
   // }

   // Pathname often starts with a leading '/' from the URL parsing, remove it.
   let path = url.pathname.startsWith('/') //
      ? url.pathname.substring(1)
      : url.pathname

   // Also, decode URI components like %20 to spaces.
   path = path.replace(/%20/g, ' ') as string_RelPath

   // Hash usually starts with '#', remove it.
   let idInFile: string_DazId | null = null
   if (url.hash) {
      idInFile = asDazId(
         url.hash.startsWith('#') //
            ? url.hash.substring(1)
            : url.hash,
      )
   }

   return { srcPath: path, idInFile }
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
