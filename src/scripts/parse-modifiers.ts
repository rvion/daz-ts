import { basename } from 'pathe'
import '../DI.js'

import { checkpoint } from '../DI.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { fmtNumber } from '../utils/fmt.js'

checkpoint('1')
export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
const assets = await mgr.getCachedFiles()
console.log(assets.length)
const modfiers = assets.filter((a) => a.assetType === 'modifier')
checkpoint('2')
console.log(
   `found ${fmtNumber(modfiers.length)} character assets:`,
   modfiers.map((i) => basename(i.relPath)),
)
let ix = 0
for (const a of modfiers) {
   checkpoint(`loading morph ${ix++}/${modfiers.length} ---------------------------------------------`)
   const x = await mgr.loadFile(a.relPath)
   console.log(`[🤠] --------------------------------------------------`, x.constructor.name)
}
checkpoint('✅ done')
// // duf are user files
// for (const asset of assets.duf) {
//    await mgr.loadAbsPath(asset)
// }
