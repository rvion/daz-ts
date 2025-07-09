import { resolve } from 'pathe'
import '../DI.js'

import chalk from 'chalk'
import { DazModifierDef } from '../core/DazModifierDef.js'
import { checkpoint } from '../DI.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { $$modifier, string_DazGroup, string_DazId, string_DazUrl } from '../spec.js'
import { string_AbsPath, string_RelPath } from '../types.js'
import { bang } from '../utils/assert.js'
import { fmtAbsPath } from '../utils/fmt.js'
import { DazUrlParts, parseDazUrl } from '../utils/parseDazUrl.js'

// allocate mgr
checkpoint('1')
export const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

// load all cached files
const fileEnties = await mgr.loadFileIndex()
console.log(`${fileEnties.length} assets in library`)

const modifierEntries = fileEnties.filter((a) => a.assetType === 'modifier')
console.log(`${modifierEntries.length} modifiers in library`)

const topicEntries = modifierEntries
   .filter((a) => !a.relPath.includes('/Worker Uniform'))
   .filter((a) => !a.relPath.includes('/Sue Yee'))
   .filter((a) => !a.relPath.includes('/AprilYSH'))
   .filter((a) => !a.relPath.includes('dForce'))
   .filter((a) => !a.relPath.includes('Toon'))

console.log(`${topicEntries.length} interesting modifiers in library`)

checkpoint('2')

// load all modifiers
let ix = 0
const NOT_FOUND: string[] = []
const MODIFIERS: DazModifierDef[] = []
for (const file of topicEntries /* .slice(1300) */) {
   if (ix++ % 100 === 0) checkpoint(`loading morph ${ix}/${topicEntries.length}`)
   try {
      const _x = await mgr.loadFileFromRelPath(file.relPath)
      if (_x.modifierDefList.length > 1) {
         console.log(`[🔴] more than one modifier found in file ${fmtAbsPath(file.relPath)}`)
         process.exit(1)
      }
      MODIFIERS.push(..._x.modifierDefList)
      // console.log(`[🤠] --------------------------------------------------`, x.constructor.name)
   } catch (err) {
      if (err instanceof Error) {
         if (err.message.startsWith('ENOENT')) {
            console.error(chalk.red(`[🟡] File not found: "${file.relPath}" ⁉️`))
            NOT_FOUND.push(file.relPath)
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
   inFiles?: string_RelPath[]
   outFiles?: string_RelPath[]
   inChans?: string_RelPath[]
   outChans?: string_RelPath[]
}

// must be serializable to JSON
export type ModifierDB = Record<string, ModifierDBEntry>

function buildJsonDb(modifiers: DazModifierDef[]) {
   const db: ModifierDB = {}
   const dedupe = (x: string_RelPath[]): string_RelPath[] => [...new Set<string_RelPath>(x).keys()]

   // for each modifier
   for (const modifier of modifiers) {
      const d: $$modifier = modifier.data
      const id: string_DazId = d.id ?? d.name

      if (!id) {
         console.warn(`Modifier without id/name found in ${modifier.source.relPath}`)
         continue
      }

      const formulas_ = d.formulas ?? []

      // #region outputs
      const formulaOutputs: DazUrlParts[] = (formulas_.map((i) => i.output) ?? []) //
         .map((a) => {
            const parts = parseDazUrl(bang(a))
            bang(parts.property_path)
            bang(parts.asset_id)
            return parts
         })
      const formulaOutputFiles = dedupe(formulaOutputs.map((i) => i.file_path).filter(Boolean))
      const formulaOutputChans: string[] = dedupe(
         formulaOutputs
            .map((i) => (i.file_path ? `${i.file_path}#${i.asset_id}?${bang(i.property_path)}` : ''))
            .filter(Boolean),
      )

      // #region inputs
      const formulaInput: DazUrlParts[] = formulas_
         .flatMap((f) => f.operations.map((x) => ('url' in x ? x.url : null)))
         .filter(Boolean)
         .map((a) => {
            const parts = parseDazUrl(bang(a))
            bang(parts.property_path)
            bang(parts.asset_id)
            return parts
         })

      const formulaInputFiles = dedupe(formulaInput.map((i) => i.file_path).filter(Boolean))
      const formulaInputChans: string[] = dedupe(
         formulaInput
            .map((i) => (i.file_path ? `${i.file_path}#${i.asset_id}?${bang(i.property_path)}` : ''))
            .filter(Boolean),
      )

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
         // files
         inFiles: formulaInputFiles.length ? formulaInputFiles : undefined,
         outFiles: formulaOutputFiles.length ? formulaOutputFiles : undefined,
         // chans
         inChans: formulaInputChans.length ? formulaInputChans : undefined,
         outChans: formulaOutputChans.length ? formulaOutputChans : undefined,
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

// save modifier dependencies graph to file
// const modifierGraph = buildModifierDependenciesGraph(jsonDb)
// mgr.fs.writeFile('data/modifier-dependencies.md', modifierGraph)
// console.log(`[✅] saved data/modifier-dependencies.md`)

// print missing files
if (NOT_FOUND.length > 0) {
   console.log(chalk.red('MISSING_FILES:'))
   console.log(chalk.red(NOT_FOUND.map((i) => `- ${i}`).join('\n')))
}

// done
checkpoint('✅ done')
