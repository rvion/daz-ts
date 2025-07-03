import '../DI.js';

import './web.css';

import { fs } from '../fs/fsWeb.js';
import { DazMgr } from '../mgr.js';
import { initSceneGenesis9 } from './scenes/genesis9.js';

export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
await mgr.loadModifiersDb()

async function main() {
   await initSceneGenesis9(mgr)
}

main().catch(console.error)
