const tab: string = '  '

// this function print a simplified version of an object
// where every array only retaisn it's first 3 elements max
// biome-ignore lint/suspicious/noExplicitAny: okay here
export function readableStringify(obj: any, maxLevel = 3, level = 0): string {
   if (level > maxLevel) return JSON.stringify(obj)
   if (typeof obj !== 'object' || obj === null) return JSON.stringify(obj)
   const indent = tab.repeat(level + 1)
   let result = '{\n'
   const keys = Object.keys(obj)
   for (let i = 0; i < keys.length; i++) {
      // biome-ignore lint/style/noNonNullAssertion: okay here
      const key = keys[i]!
      // biome-ignore lint/suspicious/noExplicitAny: okay here
      const value = (obj as any)[key]
      if (value === undefined) continue
      const valueType = typeof value

      const coma = i < keys.length - 1 ? ',' : ''
      //   if (i > 0) result += ','
      const thisIndent = indent // i > 0 ? indent.slice(1) : indent
      if (Array.isArray(value)) {
         result += `${thisIndent}${JSON.stringify(key)}: [\n`
         result += value.map((v) => `${indent}${tab}${readableStringify(v, maxLevel, level + 2)}`).join(',\n')
         result += `\n${thisIndent}]${coma}`
         // result += `${thisIndent}${JSON.stringify(key)}: ${JSON.stringify(value)}`
      } else if (valueType === 'object' && value !== null) {
         result += `${thisIndent}${JSON.stringify(key)}: ${readableStringify(value, maxLevel, level + 1)}${coma}`
      } else {
         const formattedValue = valueType === 'string' ? JSON.stringify(value) : value
         result += `${thisIndent}${JSON.stringify(key)}: ${formattedValue}${coma}`
      }
      result += '\n'
   }
   result += `${tab.repeat(Math.max(0, level))}}`

   return result
}
