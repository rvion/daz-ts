import '../DI.js'

import './web.css'

import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { DazMgr } from '../mgr.js'
import { initSceneGenesis9 } from './scenes/genesis9.js';
import { fs } from '../fs/fsWeb.js';

export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
await mgr.loadModifiersDb()

async function main() {
   const char = await mgr.loadFile('People/Genesis 9/Genesis 9.duf')
   if (!(char instanceof DazFileCharacter)) throw new Error(`Expected a DazCharacter, got ${char.constructor.name}`)
   await initSceneGenesis9(char) // Ensure this completes
}

main().catch(console.error)
