import '../DI.js'

import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'

const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

// await mgr.summarize()
console.log(`[🤠] start`)
const entrypoints = [
   'People/Genesis 9/Genesis 9.duf',
   'People/Genesis 9/Poses/Daz Originals/Base Poses/Base Feminine/G9 Base Pose 09 Seated G9F.duf',
]
for (const entry of entrypoints) {
   await mgr.loadFileFromRelPath(entry)
}
// await mgr.loadFull_FromRelPath('People/Genesis 9/Poses/Daz Originals/Base Poses/Base Feminine/G9 Base Pose 09 Seated G9F.duf',)
console.log(`[🤠] done`)
