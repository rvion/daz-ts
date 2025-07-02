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

export const bong = <T>(stuff: Maybe<T>, msg?: string): T => {
   if (stuff == null) {
      console.error(`⁉️`, msg ?? 'Expected value to be defined, but it was null or undefined')
   }
   return stuff as T
}

export const NUMBER_OR_CRASH = (x: unknown, message: string): number => {
   if (typeof x !== 'number' || Number.isNaN(x) || !Number.isFinite(x)) {
      throw new Error(`Expected a valid number, but got: ${x}. ${message}`)
   }
   return x
}

export const ASSERT_ERROR = (err: unknown): Error => {
   if (!(err instanceof Error)) {
      throw new Error(`Expected an Error, but got: ${typeof err} - ${err}`)
   }
   return err
}

export const ASSERT_INSTANCE_OF = <T>(
   //
   obj: unknown,
   // biome-ignore lint/suspicious/noExplicitAny: ...
   cls: new (...args: any[]) => T,
   message?: string,
): T => {
   if (!(obj instanceof cls)) {
      throw new Error(`Expected instance of ${cls.name}, but got: ${typeof obj} - ${obj}. ${message}`)
   }
   return obj
}

export const assertXYZChanels = (
   chans?: Maybe<{ id?: string; value?: unknown }[]>,
): { x: number; y: number; z: number } => {
   if (chans == null) throw new Error('center_point must have channels')
   ASSERT_(chans.length === 3, 'center_point must have exactly 3 channels (x, y, z)')
   ASSERT_(chans[0].id === 'x', `channel name should be x. (${JSON.stringify(chans[0])})`)
   ASSERT_(chans[1].id === 'y', `channel name should be y. (${JSON.stringify(chans[1])})`)
   ASSERT_(chans[2].id === 'z', `channel name should be z. (${JSON.stringify(chans[2])})`)
   const x = NUMBER_OR_CRASH(chans[0].value, 'x must be a number')
   const y = NUMBER_OR_CRASH(chans[1].value, 'y must be a number')
   const z = NUMBER_OR_CRASH(chans[2].value, 'z must be a number')
   return { x, y, z }
}
