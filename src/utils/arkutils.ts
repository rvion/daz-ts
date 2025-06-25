import type { ArkErrors } from 'arktype'
import { Type, type } from 'arktype'
import chalk from 'chalk'
import { getMgr } from '../DI.js'
import { readableStringify } from './readableStringify.js'
import { simplifyObject } from './simplifyObject.js'

export const check = <T>(
   // biome-ignore lint/suspicious/noExplicitAny: ...
   typ: Type<T, any>,
   obj: unknown,
   id: string,
): T => {
   const t = typ(obj)
   if (t instanceof type.errors) {
      printArkResultInConsole(t, id, obj)
   }
   return t as T
}

export const check_orCrash = <T>(
   // biome-ignore lint/suspicious/noExplicitAny: ...
   typ: Type<T, any>,
   obj: unknown,
   id: string,
): T => {
   const t = typ(obj)
   if (t instanceof type.errors) {
      printArkResultInConsole(t, id, obj)
      throw new Error(`ArkErrors encountered: ${t.toString()}`)
   }
   return t as T
}

const dbg = (obj: unknown) => readableStringify(simplifyObject(obj, { maxObjListElements: 3 /* 1000 */ }), 5)

let maxErrors = 100
function printArkResultInConsole(
   //
   res: ArkErrors,
   id: string,
   obj: unknown,
) {
   console.log(chalk.red(`   ❌ Ark validation failed for "${id}":`))
   getMgr().fs.writeFile('tmp/ark-errors.json', dbg(obj))
   // console.log(chalk.cyan(readableStringify(simplifyObject(obj))))
   for (const error of res) {
      maxErrors--
      if (maxErrors <= 0) {
         //    // process.exit(1)
         throw new Error(`   - Too many errors, stopping output to avoid clutter.`)
      }
      console.log(chalk.red(`   - ${error.path.join('.')} : ${error.message}`))
      // console.log(chalk.red.underline(`data: ${dbg(error.)}`))
   }
   console.log(chalk.red(`   - ${res.length} errors found`))
}
