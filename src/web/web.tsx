import '../DI.js'

import { fs } from '../utils/fsWeb.js'
import './web.css'

import { DazCharacter } from '../core/DazFileCharacter.js'
import { DazMgr } from '../mgr.js'
import { initSceneGenesis9 } from './scenes/genesis9.js';
export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

async function main() {
   const char = await mgr.loadFull_FromRelPath('People/Genesis 9/Genesis 9.duf')
   if (!(char instanceof DazCharacter)) throw new Error(`Expected a DazCharacter, got ${char.constructor.name}`)
   await initSceneGenesis9(char) // Ensure this completes
}

main().catch(console.error)
