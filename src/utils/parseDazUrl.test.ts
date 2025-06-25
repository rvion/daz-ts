import { describe, expect, it } from 'bun:test'
import { dazId, string_DazUrl } from '../spec.js'
import { getDazUrlParts, getPathFromDazUrl } from './parseDazUrl.js'
import { sampleDazFormulaOutputs } from './parseDazUrl.samples.js'

describe('parseDazUrl', () => {
   it('parses simple URLs', () => {
      // found in People/Genesis 9/Genesis 9.duf
      const t1 = '/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#Genesis9-1' as string_DazUrl
      expect(getPathFromDazUrl(t1)).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')

      const parts = getDazUrlParts(t1)
      expect(parts.srcPath).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')
      expect(parts.idInFile).toBe(dazId('Genesis9-1'))
      expect(parts.nodeRef).toBeUndefined()
      expect(parts.property).toBeUndefined()
   })

   it('parses URLs with node reference prefix', () => {
      const url = 'l_thigh:/data/Daz 3D/Genesis 9/Base/Genesis9.dsf#l_thigh?rotation/x' as string_DazUrl
      const parts = getDazUrlParts(url)

      expect(parts.srcPath).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')
      expect(parts.idInFile).toBe(dazId('l_thigh'))
      expect(parts.nodeRef).toBe(dazId('l_thigh'))
      expect(parts.property).toBe('rotation/x')
   })

   it('parses URLs with properties but no node prefix', () => {
      const url =
         'Genesis9:/data/Daz 3D/Genesis 9/Base/Morphs/Daz 3D/Base/head_bs_Head.dsf#head_bs_Head?value' as string_DazUrl
      const parts = getDazUrlParts(url)

      expect(parts.srcPath).toBe('data/Daz 3D/Genesis 9/Base/Morphs/Daz 3D/Base/head_bs_Head.dsf')
      expect(parts.idInFile).toBe(dazId('head_bs_Head'))
      expect(parts.nodeRef).toBe(dazId('Genesis9'))
      expect(parts.property).toBe('value')
   })

   it('parses local references', () => {
      const url = '#Genesis9?value' as string_DazUrl
      const parts = getDazUrlParts(url)

      expect(parts.srcPath).toBe('')
      expect(parts.idInFile).toBe(dazId('Genesis9'))
      expect(parts.nodeRef).toBeUndefined()
      expect(parts.property).toBe('value')
   })

   it('parses URLs without fragments', () => {
      const url = 'data/Daz 3D/Genesis 9/Base/Genesis9.dsf' as string_DazUrl
      const parts = getDazUrlParts(url)

      expect(parts.srcPath).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')
      expect(parts.idInFile).toBeNull()
      expect(parts.nodeRef).toBeUndefined()
      expect(parts.property).toBeUndefined()
   })

   it('handles complex property paths', () => {
      const url =
         'FrontLeftBraid:/data/AprilYSH/EirgridGenesis/EirgridHairG9/aprilyshEirgridHair_428373.dsf#FrontLeftBraid?center_point/x' as string_DazUrl
      const parts = getDazUrlParts(url)

      expect(parts.srcPath).toBe('data/AprilYSH/EirgridGenesis/EirgridHairG9/aprilyshEirgridHair_428373.dsf')
      expect(parts.idInFile).toBe(dazId('FrontLeftBraid'))
      expect(parts.nodeRef).toBe(dazId('FrontLeftBraid'))
      expect(parts.property).toBe('center_point/x')
   })

   it('handles URLs with encoded characters', () => {
      const url =
         'Genesis9:/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBend.dsf#body_ctrl_HipBend?value' as string_DazUrl
      const parts = getDazUrlParts(url)

      expect(parts.srcPath).toBe('data/Daz 3D/Genesis 9/Base/Morphs/Daz 3D/Base Pose/body_ctrl_HipBend.dsf')
      expect(parts.idInFile).toBe(dazId('body_ctrl_HipBend'))
      expect(parts.nodeRef).toBe(dazId('Genesis9'))
      expect(parts.property).toBe('value')
   })

   describe('sample URLs from daz.output.ts', () => {
      it('parses all sample URLs without throwing', () => {
         for (const url of sampleDazFormulaOutputs) {
            expect(() => getDazUrlParts(url as string_DazUrl)).not.toThrow()
         }
      })

      it('correctly extracts paths from sample URLs', () => {
         // Test a few specific examples
         const url1 = 'aprilyshEirgridHair_428373:#body_cbs_shoulder_backl?value' as string_DazUrl
         const parts1 = getDazUrlParts(url1)
         expect(parts1.srcPath).toBe('')
         expect(parts1.nodeRef).toBe(dazId('aprilyshEirgridHair_428373'))
         expect(parts1.idInFile).toBe(dazId('body_cbs_shoulder_backl'))
         expect(parts1.property).toBe('value')

         const url2 =
            'FrontLeftBraid:/data/AprilYSH/EirgridGenesis/EirgridHairG9/aprilyshEirgridHair_428373.dsf#FrontLeftBraid?center_point/x' as string_DazUrl
         const parts2 = getDazUrlParts(url2)
         expect(parts2.srcPath).toBe('data/AprilYSH/EirgridGenesis/EirgridHairG9/aprilyshEirgridHair_428373.dsf')
         expect(parts2.nodeRef).toBe(dazId('FrontLeftBraid'))
         expect(parts2.idInFile).toBe(dazId('FrontLeftBraid'))
         expect(parts2.property).toBe('center_point/x')
      })
   })
})
