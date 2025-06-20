import type { ArkErrors } from 'arktype'
import { Type, type } from 'arktype'
import chalk from 'chalk'

// biome-ignore lint/suspicious/noExplicitAny: ...
export const check = <T>(typ: Type<T, any>, obj: unknown, id: string): T => {
   const t = typ(obj)
   if (t instanceof type.errors) {
      printArkResultInConsole(t, id)
   }
   return t as T
}

// biome-ignore lint/suspicious/noExplicitAny: ...
export const check_orCrash = <T>(typ: Type<T, any>, obj: unknown, id: string): T => {
   const t = typ(obj)
   if (t instanceof type.errors) {
      printArkResultInConsole(t, id)
      throw new Error(`ArkErrors encountered: ${t.toString()}`)
   }
   return t as T
}

export function printArkResultInConsole(res: ArkErrors, id: string) {
   console.log(chalk.red(`   ❌ Ark validation failed for "${id}":`))
   for (const error of res) {
      console.log(chalk.red(`   - ${error.path.join('.')} : ${error.message}`))
   }
   console.log(chalk.red(`   - ${res.length} errors found`))
}
