import type { Maybe } from '../types.js'

export const ASSERT = (condition: boolean, message: string): asserts condition => {
   if (!condition) {
      throw new Error(`Assertion failed: ${message}`)
   }
}

export const bang = <T>(stuff: Maybe<T>): T => {
   if (stuff == null) {
      throw new Error('Expected value to be defined, but it was null or undefined')
   }
   return stuff as T
}
