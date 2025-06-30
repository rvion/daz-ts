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
      if (path === 'data/processed_files.json') return (await (import('../../data/processed_files.json'))).default
      // G9 Base Pose 11 Seated G9F.duf
      if (path === '/Volumes/ssd4t1/daz-lib/People/Genesis 9/Poses/Daz Originals/Base Poses/Base/G9 Base Pose 04 Seated G9B.duf') {
         return (await import('../../tmp/genesis9-pose-seated-04.json')).default
      }
      if (path==='/Volumes/ssd4t1/daz-lib/People/Genesis 9/Poses/Daz Originals/Base Poses/Base Feminine/G9 Base Pose 11 Seated G9F.duf') {
         return (await import('../../tmp/genesis9-pose-seated.json')).default
      }
      throw new Error(`'${path}' not implemented in readJSON`)
   },
   writeFile: (file, data, opts) => {
      console.log(`[mock.writeFile]`, { file, data, opts })
      return Promise.resolve<void>(undefined)
      // throw new Error('writeFile not implemented in fsWeb.js')
   },
   discoverFiles: () => {
      throw new Error('discoverFiles not implemented in fsWeb.js')
   },
   mkdir: () => {
      throw new Error('mkdir not implemented in fsWeb.js')
   },
}
