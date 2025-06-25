import { describe, expect, it } from 'bun:test'
import '../DI.js'
import { DazMgr } from '../mgr.js'
import { asDazId, string_DazUrl } from '../spec.js'
import { fs } from '../utils/fsNode.js'
import { DazFileModifier } from './DazFileModifier.js'

describe('DazFileModifier', () => {
   it('should parse modifier file and resolve URLs', async () => {
      const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

      // Initialize the modifier
      const modifier = await mgr.loadFull_FromRelPath(
         'data/DAZ 3D/Genesis 9/Base/Morphs/Daz 3D/Base Pose/body_ctrl_HipBend.dsf',
      )
      if (!(modifier instanceof DazFileModifier)) {
         throw new Error('Expected modifier to be an instance of DazFileModifier')
      }

      // Test basic properties
      expect(modifier.dazId).toBe(
         asDazId('/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBend.dsf'),
      )
      expect(modifier.assetType).toBe('modifier')
      expect(modifier.emoji).toBe('🔧')

      // Test modifier library access
      expect(modifier.modifierLibrary).toHaveLength(1)
      expect(modifier.modifierLibrary[0].id).toBe(asDazId('CTRLHipBend'))
      expect(modifier.modifierLibrary[0].name).toBe('body_ctrl_HipBend')

      // Test scene modifiers
      expect(modifier.sceneModifiers).toHaveLength(1)
      expect(modifier.sceneModifiers[0].id).toBe(asDazId('body_ctrl_HipBend'))

      // Test formula outputs
      const outputs = modifier.formulaOutputs
      expect(outputs).toHaveLength(2)
      expect(outputs).toContain(
         'Genesis9:/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBendFwd.dsf#body_ctrl_HipBendFwd?value',
      )
      expect(outputs).toContain(
         'Genesis9:/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBendBck.dsf#body_ctrl_HipBendBck?value',
      )

      // Test parent references
      const parentRefs = modifier.parentRefs
      expect(parentRefs).toHaveLength(1)
      expect(parentRefs[0]).toBe('/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#Genesis9' as string_DazUrl)

      // Test URL resolution
      expect(modifier.resolvedUrls.size).toBeGreaterThan(0)
      expect(modifier.resolvedUrls.has('/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#Genesis9')).toBe(true)
      expect([...modifier.resolvedUrls.values()].map((f) => f.dazId)).toStrictEqual([asDazId('.')])
   })
})
