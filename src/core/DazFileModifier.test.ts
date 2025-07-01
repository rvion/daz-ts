import { describe, expect, it } from 'bun:test'
import '../DI.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { dazId, dazUrl, string_DazUrl } from '../spec.js'
import { KnownDazFile } from './_DsonFile.js'
import { DazFileModifier } from './DazFileModifier.js'

describe('DazFileModifier', () => {
   it('should parse modifier file and resolve URLs', async () => {
      const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

      expect(mgr.countPerTypePerExt.get('total').get('modifier').x).toBe(0)
      // Initialize the modifier
      const entrypoint = 'data/DAZ 3D/Genesis 9/Base/Morphs/Daz 3D/Base Pose/body_ctrl_HipBend.dsf'
      const modifier = await mgr.loadFile(entrypoint)
      // entrypoint should itself references
      expect(mgr.countPerTypePerExt.get('total').get('modifier').x).toBe(3)

      if (!(modifier instanceof DazFileModifier)) {
         throw new Error('Expected modifier to be an instance of DazFileModifier')
      }

      // Test basic properties
      expect(modifier.dazId).toBe(
         dazUrl('/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBend.dsf'),
      )
      expect(modifier.assetType).toBe('modifier')
      expect(modifier.emoji).toBe('🔧')

      // Test modifier library access
      expect(modifier.modifierLibrary).toHaveLength(1)
      expect(modifier.modifierLibrary[0].id).toBe(dazId('CTRLHipBend'))
      expect(modifier.modifierLibrary[0].name).toBe('body_ctrl_HipBend')

      // Test scene modifiers
      expect(modifier.sceneModifiers).toHaveLength(1)
      expect(modifier.sceneModifiers[0].id).toBe(dazId('body_ctrl_HipBend'))

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

      // Test URL resolution - should resolve multiple files now
      expect(modifier.resolvedUrls.size).toBeGreaterThan(0)
      expect(modifier.resolvedUrls.has('/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#Genesis9')).toBe(true)

      // Check that we resolved the expected files
      const resolvedIds = [...modifier.resolvedUrls.values()].map((f: KnownDazFile) => f.dazId).sort()
      expect(resolvedIds).toContain('/data/Daz%203D/Genesis%209/Base/Genesis9.dsf')
      expect(resolvedIds).toContain(
         '/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBendFwd.dsf',
      )
      expect(resolvedIds).toContain(
         '/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBendBck.dsf',
      )
   })
   it('can resolve stuff', async () => {
      const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      const url = dazUrl`/data/Daz%203D/G9ToonCommon/Genesis%209%20Toon%20Floating%20Iris/G9ToonFloatingIris.dsf#G9ToonFloatingIris`
      const parts = mgr.parseUrl(url)
      expect(parts).toStrictEqual({
         idInFile: dazId`G9ToonFloatingIris`,
         nodeRef: undefined,
         property: undefined,
         srcPath: 'data/Daz 3D/G9ToonCommon/Genesis 9 Toon Floating Iris/G9ToonFloatingIris.dsf',
      })

      await mgr.loadFile(`/data/AprilYSH/EirgridGenesis/EirgridHairG9/Morphs/AprilYSH/Base/body_cbs_head_x30n.dsf`)
      expect(1).toBe(1)
   })
})
