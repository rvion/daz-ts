import type { FS } from './fsNode.js'

export const fs: FS = {
   readPartialJSON(_path, _bytes) {
      throw new Error('readPartialJSON not implemented in fsWeb.js')
   },
   // biome-ignore format: misc
   readJSON: async (path: string) => {
      if (path === '__test__') return Promise.resolve([1, 2, 3, 4, 5])
      if (path === '/Volumes/ssd4t1/daz-lib/People/Genesis 9/Genesis 9.duf') return (await (import('../../tmp/genesis9-duf.json'))).default
      if (path === '/Volumes/ssd4t1/daz-lib/data/Daz 3D/Genesis 9/Base/Genesis9.dsf') return (await (import('../../tmp/genesis9-dsf.json'))).default
      throw new Error(`'${path}' not implemented in readJSON`)
   },
   writeFile: () => {
      throw new Error('writeFile not implemented in fsWeb.js')
   },
   discoverFiles: () => {
      throw new Error('discoverFiles not implemented in fsWeb.js')
   },
   processFiles: () => {
      throw new Error('processFiles not implemented in fsWeb.js')
   },

   // readdir: () => {
   //    throw new Error('readdir not implemented in fsWeb.js')
   // },
   // stat: () => {
   //    throw new Error('stat not implemented in fsWeb.js')
   // },
   mkdir: () => {
      throw new Error('mkdir not implemented in fsWeb.js')
   },
   // unlink: () => {
   //    throw new Error('unlink not implemented in fsWeb.js')
   // },
   // copyFile: () => {
   //    throw new Error('copyFile not implemented in fsWeb.js')
   // },
   // rename: () => {
   //    throw new Error('rename not implemented in fsWeb.js')
   // },
}
