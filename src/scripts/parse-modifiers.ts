import { basename } from 'pathe'
import '../DI.js'

import chalk from 'chalk'
import { DazModifier } from '../core/DazModifier.js'
import { checkpoint } from '../DI.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { fmtAbsPath, fmtNumber } from '../utils/fmt.js'

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
const NOT_FOUND: string[] = []
let ix = 0
const MODIFIERS: DazModifier[] = []
for (const a of modfiers /* .slice(1300) */) {
   checkpoint(`loading morph ${ix++}/${modfiers.length}`)
   try {
      const _x = await mgr.loadFile_noResolve(a.relPath)
      MODIFIERS.push(..._x.modifierList)
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

function buildSummary(p: { color: boolean }) {
   let final: string = ''
   const FMT = (colorFn: (str: string) => string, str: string) => {
      if (!p.color) return str
      return colorFn(str)
   }
   for (const x of MODIFIERS) {
      const d = x.data
      const name = d.name ?? d.label ?? d.id
      const debug: string = [
         d.formulas
            ? FMT(chalk.blue, '[formula]') //
            : /*           */ '[       ]',
         d.morph
            ? FMT(chalk.green, '[morph]') //
            : /*            */ '[     ]',
         d.skin
            ? FMT(chalk.yellow, '[skin]') //
            : /*             */ '[    ]',
         d.region ? `[${d.region.padEnd(8)}]` : `[${' '.repeat(8)}]`,
         name.padEnd(50, ' '),
         FMT(fmtAbsPath, x.source.absPath),
      ].join(' ')
      const line = `${debug}`
      final += line + '\n'
   }
   return final
}
const finalCol = buildSummary({ color: true })
console.log(finalCol)

const final = buildSummary({ color: false })
mgr.fs.writeFile('data/modifiers-debug.txt', final)
