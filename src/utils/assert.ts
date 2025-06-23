import type { Maybe } from '../types.js'

export const ASSERT = (condition: boolean, message: string): asserts condition => {
   if (!condition) {
      throw new Error(`Assertion failed: ${message}`)
   }
}

export const ASSERT_ = (condition: boolean, message: string): void => {
   if (!condition) {
      throw new Error(`Assertion failed: ${message}`)
   }
}

export const bang = <T>(stuff: Maybe<T>, msg?: string): T => {
   if (stuff == null) {
      throw new Error(msg ?? 'Expected value to be defined, but it was null or undefined')
   }
   return stuff as T
}

export const NUMBER_OR_CRASH = (x: unknown, message: string): number => {
   if (typeof x !== 'number' || Number.isNaN(x) || !Number.isFinite(x)) {
      throw new Error(`Expected a valid number, but got: ${x}. ${message}`)
   }
   return x
}
