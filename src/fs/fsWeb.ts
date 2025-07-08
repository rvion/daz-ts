import type { FS } from './fsNode.js'

export const fs: FS = {
   readPartialJSON(_path, _bytes) {
      throw new Error('readPartialJSON not implemented in fsWeb.js')
   },
   // biome-ignore format: misc
   readJSON: async (path: string) => {
       if (path === '__test__') return { json: [1, 2, 3, 4, 5], gz: false, fileSize: 0 }

       const DAZ_LIB_ROOT = '/Volumes/ssd4t1/daz-lib/';
       const SERVER_URL = 'http://localhost:6661';

       if (path.startsWith(DAZ_LIB_ROOT)) {
           const relativePath = path.substring(DAZ_LIB_ROOT.length);
           const url = `${SERVER_URL}/${relativePath}`;
           console.log(`Fetching Daz file from server: ${url}`);
           const response = await fetch(url);
           if (!response.ok) {
               throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
           }
           const json = await response.json();
           return { json, gz: false, fileSize: 0 };
       }

       // Fallback for other paths, if any are still needed
       if (path === 'data/modifiers.json') return { json: (await import('../../data/modifiers.json')).default, gz: false, fileSize: 0 }
       if (path === 'data/processed_files.json') return { json: (await import('../../data/processed_files.json')).default, gz: false, fileSize: 0 }

       throw new Error(`'${path}' not implemented in readJSON`);
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
