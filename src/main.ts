import './DI.js'
import { DazMgr } from './mgr.js'
import { fs } from './utils/fsNode.js'

// export const mgr = new DazMgr(`C:/Users/Public/Documents/My DAZ 3D Library/`)
export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

// await mgr.summarize()
console.log(`[🤠] start`)
await mgr.loadFull_FromRelPath('People/Genesis 9/Genesis 9.duf')
console.log(`[🤠] done`)
