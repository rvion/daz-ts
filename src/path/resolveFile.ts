import { string_DazUrl } from '../spec.js'
import { string_RelPath } from '../types.js'

export const parseUrl = (dazUrl: string_DazUrl): URL => {
   return new URL(dazUrl, 'daz://')
}

export const getPathFromDazUrl = (dazUrl: string_DazUrl): string_RelPath => {
   const url = parseUrl(dazUrl)
   return url.pathname.replace(/%20/g, ' ') // decode URL and replace %20 with space
}
