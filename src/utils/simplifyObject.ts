export function simplifyObject(
   obj: unknown,
   opts: {
      maxObjListElements?: number
      maxNumListElements?: number
      maxStringLength?: number
   } = {},
): unknown {
   const maxObjListElements = opts.maxObjListElements ?? 3
   const maxNumListElements = opts.maxNumListElements ?? 10
   const maxStringLength = opts.maxStringLength ?? 1000

   // string
   if (typeof obj === 'string') {
      return obj.length > maxStringLength ? `${obj.slice(0, maxStringLength)}...` : obj
   }
   // null and other primitives
   if (typeof obj !== 'object' || obj === null) return obj
   // array
   if (Array.isArray(obj)) {
      const item0 = obj[0]
      const maxListElements = typeof item0 === 'number' ? maxNumListElements : maxObjListElements
      const removedItems = Math.max(obj.length - maxListElements, 0)
      return obj
         .slice(0, maxListElements)
         .map((i) => simplifyObject(i, opts))
         .concat(removedItems ? { __removed__: removedItems } : [])
   }
   // object
   const out: any = {}
   for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue
      out[key] = simplifyObject(value, opts)
   }
   return out
}
