import { serve } from 'bun'
import { resolve } from 'path'

const DAZ_LIB_ROOT = '/Volumes/ssd4t1/daz-lib/'
const PORT = 6661

console.log(`Bun file server starting on port ${PORT}`)
console.log(`Serving files from: ${DAZ_LIB_ROOT}`)

serve({
   port: PORT,
   fetch(request) {
      const url = new URL(request.url)
      // Manually replace %20 with spaces to ensure correct path handling,
      // as decodeURIComponent might not be fully effective in all Bun environments for file paths.
      const pathWithSpaces = url.pathname.replace(/%20/g, ' ');

      // Remove leading slash to treat it as a relative path segment for path.resolve
      const relativePath = pathWithSpaces.startsWith('/') ? pathWithSpaces.substring(1) : pathWithSpaces;
      const filePath = resolve(DAZ_LIB_ROOT, relativePath)

      console.log(`Request for: ${url.pathname}, serving: ${filePath}`)

      try {
         const file = Bun.file(filePath)
         return new Response(file, {
            headers: {
               'Access-Control-Allow-Origin': '*', // Allow all origins for development
            },
         })
      } catch (error) {
         console.error(`Error serving file ${filePath}:`, error)
         return new Response('File not found', {
            status: 404,
            headers: {
               'Access-Control-Allow-Origin': '*', // Allow all origins for development
            },
         })
      }
   },
   error(error) {
      console.error('Bun server error:', error)
      return new Response('Internal Server Error', {
         status: 500,
         headers: {
            'Access-Control-Allow-Origin': '*', // Allow all origins for development
         },
      })
   },
})
