import chalk from 'chalk'
import { $$formula, string_DazUrl } from '../spec.js'
import { bang } from '../utils/assert.js'
import { parseDazUrl } from '../utils/parseDazUrl.js'
import { RVFigure } from './RVFigure.js'

export class FormulaHelper {
   constructor(public figure: RVFigure) {}

   private autoAddParensIfNecessary(str: string): string {
      if (str.startsWith('(')) return str
      if (str.includes(' ')) return `(${str})`
      return str
   }

   getValueFromUrl(url: string_DazUrl): number {
      // console.log(`[🧐] attempting to get the value at ${url}`)
      const res = parseDazUrl(url)
      // console.log(`           ${JSON.stringify(res)}`)
      if (!res.node_path) throw new Error(`[RVFigure] ❌ Invalid URL: ${url} - missing node_path`)
      // const node = this.getBone_orCrash(res.node_path)
      // node.

      return 0.5
   }

   printFormula(formula: $$formula, result: number | null): void {
      const stack: string[] = []
      for (const op of formula.operations) {
         switch (op.op) {
            case 'push':
               if ('url' in op) stack.push(chalk.underline(op.url) + `(=${this.getValueFromUrl(op.url)})`)
               else if ('val' in op) stack.push(JSON.stringify(op.val))
               break
            // @ts-ignore
            case 'add': {
               stack.push(`${bang(stack.pop())} ${chalk.green('+')} ${bang(stack.pop())}`)
               break
            }
            // @ts-ignore
            case 'sub': {
               stack.push(`${bang(stack.pop())} ${chalk.yellow('-')} ${bang(stack.pop())}`)
               break
            }
            case 'mult': {
               const a = this.autoAddParensIfNecessary(bang(stack.pop()))
               const b = this.autoAddParensIfNecessary(bang(stack.pop()))
               stack.push(`${b} ${chalk.red('*')} ${a}`)
               break
            }
            // @ts-ignore
            case 'div':
               {
                  const a = this.autoAddParensIfNecessary(bang(stack.pop()))
                  const b = this.autoAddParensIfNecessary(bang(stack.pop()))
                  stack.push(`${b} ${chalk.blue('/')} ${a}`)
               }
               break
            default:
               throw new Error(`[evaluateFormula] ❌ Unknown formula operation: ${op.op}`)
         }
      }
      console.log(`${chalk.blue(formula.output)} = ${stack[0]}${result != null ? ` = ${result}` : ''}`)
   }

   evaluate(formula: $$formula): number {
      // ---------
      // console.log(`     formula:`)
      // for (const op of formula.operations) console.log(`        ${JSON.stringify(op)}`)
      // console.log(`        => ${JSON.stringify(formula.output)}`)

      // ---------
      const stack: number[] = []
      for (const op of formula.operations) {
         switch (op.op) {
            case 'push':
               if ('url' in op) {
                  const value = this.getValueFromUrl(op.url)
                  stack.push(value)
               } else if ('val' in op) {
                  if (typeof op.val !== 'number') {
                     throw new Error(`[evaluateFormula] ❌ Invalid value in push operation: ${JSON.stringify(op)}`)
                  }
                  stack.push(op.val)
               }
               break
            case 'mult': {
               stack.push(bang(stack.pop()) * bang(stack.pop()))
               break
            }
            // @ts-ignore
            case 'add': {
               stack.push(bang(stack.pop()) + bang(stack.pop()))
               break
            }
            // @ts-ignore
            case 'sub': {
               stack.push(bang(stack.pop()) - bang(stack.pop()))
               break
            }
            // @ts-ignore
            case 'div':
               {
                  const a = bang(stack.pop())
                  const b = bang(stack.pop())
                  stack.push(b / a)
               }
               break
            default:
               throw new Error(`[evaluateFormula] ❌ Unknown formula operation: ${op.op}`)
         }
      }
      const result = bang(stack[0], `❌ empty formula stack`)
      return result
   }
}
