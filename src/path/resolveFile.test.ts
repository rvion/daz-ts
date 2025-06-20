import { describe, expect, it } from 'bun:test'
import { string_DazUrl } from '../spec.js'
import { getPathFromDazUrl } from './resolveFile.js'

describe('resolveFile', () => {
   it('works', () => {
      // found in People/Genesis 9/Genesis 9.duf
      const t1 = '/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#Genesis9-1' as string_DazUrl

      expect(getPathFromDazUrl(t1)).toBe('/data/Daz 3D/Genesis 9/Base/Genesis9.dsf')
   })
})
