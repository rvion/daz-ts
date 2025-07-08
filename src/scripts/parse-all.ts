import { basename } from 'pathe'
import '../DI.js'

import chalk from 'chalk'
import { checkpoint } from '../DI.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { fmtNumber } from '../utils/fmt.js'

checkpoint('1')
export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
const assets = await mgr.getCachedFiles()
console.log(assets.length)
checkpoint('2')
console.log(
   `found ${fmtNumber(assets.length)} assets:`,
   assets.map((i) => basename(i.relPath)),
)
const NOT_FOUND: string[] = []
let ix = 0
for (const a of assets /* .slice(1300) */) {
   if (a.assetType === 'preset_render_settings') continue
   checkpoint(`loading morph ${ix++}/${assets.length}`)
   try {
      const _x = await mgr.loadFileFromRelPath(a.relPath)
      // console.log(`[🤠] --------------------------------------------------`, x.constructor.name)
   } catch (err) {
      if (err instanceof Error) {
         if (err.message.startsWith('ENOENT')) {
            console.error(chalk.red(`[🟡] File not found: "${a.relPath}" ⁉️`))
            NOT_FOUND.push(a.relPath)
            continue
         }
      }

      throw err
   }
}
checkpoint('✅ done')
if (NOT_FOUND.length > 0) {
   console.log(chalk.red('MISSING_FILES:'))
   console.log(chalk.red(NOT_FOUND.map((i) => `- ${i}`).join('\n')))
}
// // duf are user files
// for (const asset of assets.duf) {
//    await mgr.loadAbsPath(asset)
// }
