import '../DI.js'

import { checkpoint } from '../DI.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'

export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
console.log(await mgr.summarize())
checkpoint('done')
