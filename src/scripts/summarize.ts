import '../DI.js'
import { DazMgr } from '../mgr.js'
import { fs } from '../utils/fsNode.js'

export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
console.log(await mgr.summarize())
