import { basename, resolve } from 'pathe'
import '../DI.js'

import chalk from 'chalk'
import { DazModifier } from '../core/DazModifier.js'
import { checkpoint } from '../DI.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { $$modifier, string_DazGroup, string_DazId, string_DazUrl } from '../spec.js'
import { string_AbsPath, string_RelPath } from '../types.js'
import { fmtAbsPath, fmtNumber } from '../utils/fmt.js'
import { DazUrlParts, parseDazUrl } from '../utils/parseDazUrl.js'

// allocate mgr
checkpoint('1')
export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

// load all cached files
const assets = await mgr.getCachedFiles()
console.log(assets.length)

// retrieve all modfiers we care about
const modfiers = assets
   .filter((a) => a.assetType === 'modifier') //
   .filter((a) => !a.relPath.includes('/Worker Uniform'))
   .filter((a) => !a.relPath.includes('/Sue Yee'))
   .filter((a) => !a.relPath.includes('/AprilYSH'))
   .filter((a) => !a.relPath.includes('dForce'))
   .filter((a) => !a.relPath.includes('Toon'))

checkpoint('2')

// print short summary about scope
console.log(
   `found ${fmtNumber(modfiers.length)} character assets:`,
   modfiers.map((i) => basename(i.relPath)),
)

// load all modifiers
let ix = 0
const NOT_FOUND: string[] = []
const MODIFIERS: DazModifier[] = []
for (const a of modfiers /* .slice(1300) */) {
   checkpoint(`loading morph ${ix++}/${modfiers.length}`)
   try {
      const _x = await mgr.loadFile(a.relPath)
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

//2025-07-02:10:12 =>  2.029.124
//2025-07-02:10:14 =>  1.889.540

export type ModifierDBEntry = {
   path: string_AbsPath
   id: string_DazId
   name?: string
   type?: string
   label1?: string
   label2?: string
   iconL?: string
   iconS?: string
   source?: string_DazUrl
   parent?: string_DazUrl
   region?: string
   group?: string_DazGroup
   channel?: 1
   morph?: 1
   skin?: 1
   formula?: 1
   in?: string_RelPath[]
   out?: string_RelPath[]
}

// must be serializable to JSON
export type ModifierDB = Record<string, ModifierDBEntry>

function buildJsonDb(modifiers: DazModifier[]) {
   const db: ModifierDB = {}

   // for each modifier
   for (const modifier of modifiers) {
      const d: $$modifier = modifier.data
      const id: string_DazId = d.id ?? d.name

      if (!id) {
         console.warn(`Modifier without id/name found in ${modifier.source.relPath}`)
         continue
      }

      const formulas_ = d.formulas ?? []
      const formulaOutputs: DazUrlParts[] = (formulas_.map((i) => i.output) ?? []) //
         .map(parseDazUrl)

      const formulaInput: DazUrlParts[] = formulas_
         .flatMap((f) => f.operations.map((x) => ('url' in x ? x.url : null)))
         .filter(Boolean)
         // biome-ignore lint/style/noNonNullAssertion: misc
         .map((a) => parseDazUrl(a!))

      const path = modifier.source.absPath
      const ENTRY: ModifierDBEntry = {
         path,
         id,
         name: d.name,
         type: d.presentation?.type,
         label1: d.label ? d.label : undefined,
         label2: d.presentation?.label ? d.presentation?.label : undefined,
         iconL: d.presentation?.icon_large ? resolve(path, d.presentation?.icon_large) : undefined,
         iconS: d.presentation?.icon_small ? resolve(path, d.presentation?.icon_small) : undefined,
         source: d.source,
         parent: d.parent, // ? getDazUrlParts(d.parent) : undefined,
         // chanel: d.channel?.,
         region: d.region,
         group: d.group,
         channel: d.channel ? 1 : undefined,
         morph: d.morph ? 1 : undefined,
         skin: d.skin ? 1 : undefined,
         formula: d.formulas?.length ? 1 : undefined,
         in: formulaInput.length ? formulaInput.map((i) => i.file_path) : undefined,
         out: formulaOutputs.length ? formulaOutputs.map((i) => i.file_path) : undefined,
      }
      db[id] = ENTRY
   }
   return db
}

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
// print colorful summary
const finalCol = buildSummary({ color: true })
console.log(finalCol)

// save summary to file
const final = buildSummary({ color: false })
mgr.fs.writeFile('data/modifiers-debug.txt', final)

// save json db to file
const jsonDb = buildJsonDb(MODIFIERS)
const jsonDbString = JSON.stringify(jsonDb, null, 2)
mgr.fs.writeFile('data/modifiers.json', jsonDbString)
console.log(`[✅] saved data/modifiers.json with ${Object.keys(jsonDb).length} modifiers`)

// print missing files
if (NOT_FOUND.length > 0) {
   console.log(chalk.red('MISSING_FILES:'))
   console.log(chalk.red(NOT_FOUND.map((i) => `- ${i}`).join('\n')))
}

// done
checkpoint('✅ done')
