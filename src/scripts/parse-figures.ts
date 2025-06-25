import '../DI.js'
import { checkpoint } from '../DI.js'

import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'

checkpoint('1')
export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
checkpoint('2')
const assets = await mgr.getCachedFiles()
checkpoint('3')
console.log(assets.length)
checkpoint('4')

// // duf are user files
// for (const asset of assets.duf) {
//    await mgr.loadAbsPath(asset)
// }
