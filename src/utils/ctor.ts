export type CtorProps<T> = T extends {
   new (...args: infer ARGS): any
}
   ? ARGS
   : never
