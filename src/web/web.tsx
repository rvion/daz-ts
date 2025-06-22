import '../DI.js'

import './web.css'
import { fs } from '../utils/fsWeb.js'

// ------------------------------
import { DazMgr } from '../mgr.js'
import { initSceneGenesis9 } from './scenes/genesis9.js'
import { DazCharacter } from '../core/DazFileCharacter.js'
export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
const char = await mgr.loadFull_FromRelPath('People/Genesis 9/Genesis 9.duf')
if (! (char instanceof DazCharacter)) throw new Error(`Expected a DazCharacter, got ${char.constructor.name}`)
   initSceneGenesis9(char)

// ------------------------------
// import { initSceneBox } from "./scenes/box.js"
// initSceneBox()