import { describe, expect, it } from 'bun:test'
import { dazId, string_DazId, string_DazUrl } from '../spec.js'
import { getPathFromDazUrl, parseDazUrl } from './parseDazUrl.js'
import { sampleDazFormulaOutputs } from './parseDazUrl.samples.js'

describe('parseDazUrl', () => {
   it('works with modifier parents', () => {
      const parents: string_DazUrl[] = [
         '/data/Daz%203D/Genesis%209/Base/Tools/Projection%20Templates/G9%20Footwear/G9FootwearTemplate.dsf#l_thigh',
         '/data/Daz%203D/Genesis%209%20Starter%20Essentials/G9%20Base%20Shorts/EssentialShortsG9.dsf#EssentialShorts',
         '/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#r_thigh',
      ] as string_DazUrl[]
      const res = parents.map(parseDazUrl)
      expect(res).toStrictEqual([
         {
            scheme: 'id',
            node_path: undefined,
            file_path: 'data/Daz 3D/Genesis 9/Base/Tools/Projection Templates/G9 Footwear/G9FootwearTemplate.dsf',
            asset_id: 'l_thigh' as string_DazId,
            property_path: undefined,
         },
         {
            scheme: 'id',
            node_path: undefined,
            file_path: 'data/Daz 3D/Genesis 9 Starter Essentials/G9 Base Shorts/EssentialShortsG9.dsf',
            asset_id: 'EssentialShorts' as string_DazId,
            property_path: undefined,
         },
         {
            scheme: 'id',
            node_path: undefined,
            file_path: 'data/Daz 3D/Genesis 9/Base/Genesis9.dsf',
            asset_id: 'r_thigh' as string_DazId,
            property_path: undefined,
         },
      ])
   })
   it('respect the spec', () => {
      expect(parseDazUrl('hips:morphs/Daphne#daphne?value' as string_DazUrl)).toStrictEqual({
         scheme: 'id',
         node_path: 'hips' as string_DazId,
         file_path: 'morphs/Daphne',
         asset_id: 'daphne' as string_DazId,
         property_path: 'value',
      })
   })
   it('parses simple URLs', () => {
      // found in People/Genesis 9/Genesis 9.duf
      const t1 = '/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#Genesis9-1' as string_DazUrl
      expect(getPathFromDazUrl(t1)).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')

      const parts = parseDazUrl(t1)
      expect(parts.file_path).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')
      expect(parts.asset_id).toBe(dazId('Genesis9-1'))
      expect(parts.node_path).toBeUndefined()
      expect(parts.property_path).toBeUndefined()
      expect(parts.scheme).toBe('id')
   })

   it('parses URLs with node reference prefix', () => {
      const url = 'l_thigh:/data/Daz 3D/Genesis 9/Base/Genesis9.dsf#l_thigh?rotation/x' as string_DazUrl
      const parts = parseDazUrl(url)

      expect(parts.file_path).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')
      expect(parts.asset_id).toBe(dazId('l_thigh'))
      expect(parts.node_path).toBe(dazId('l_thigh'))
      expect(parts.property_path).toBe('rotation/x')
      expect(parts.scheme).toBe('id')
   })

   it('parses URLs with properties but no node prefix', () => {
      const url =
         'Genesis9:/data/Daz 3D/Genesis 9/Base/Morphs/Daz 3D/Base/head_bs_Head.dsf#head_bs_Head?value' as string_DazUrl
      const parts = parseDazUrl(url)

      expect(parts.file_path).toBe('data/Daz 3D/Genesis 9/Base/Morphs/Daz 3D/Base/head_bs_Head.dsf')
      expect(parts.asset_id).toBe(dazId('head_bs_Head'))
      expect(parts.node_path).toBe(dazId('Genesis9'))
      expect(parts.property_path).toBe('value')
      expect(parts.scheme).toBe('id')
   })

   it('parses local references', () => {
      const url = '#Genesis9?value' as string_DazUrl
      const parts = parseDazUrl(url)

      expect(parts.file_path).toBe('')
      expect(parts.asset_id).toBe(dazId('Genesis9'))
      expect(parts.node_path).toBeUndefined()
      expect(parts.property_path).toBe('value')
      expect(parts.scheme).toBe('id')
   })

   it('parses URLs without fragments', () => {
      const url = 'data/Daz 3D/Genesis 9/Base/Genesis9.dsf' as string_DazUrl
      const parts = parseDazUrl(url)

      expect(parts.file_path).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')
      expect(parts.asset_id).toBeNull()
      expect(parts.node_path).toBeUndefined()
      expect(parts.property_path).toBeUndefined()
      expect(parts.scheme).toBe('id')
   })

   it('handles complex property paths', () => {
      const url =
         'FrontLeftBraid:/data/AprilYSH/EirgridGenesis/EirgridHairG9/aprilyshEirgridHair_428373.dsf#FrontLeftBraid?center_point/x' as string_DazUrl
      const parts = parseDazUrl(url)

      expect(parts.file_path).toBe('data/AprilYSH/EirgridGenesis/EirgridHairG9/aprilyshEirgridHair_428373.dsf')
      expect(parts.asset_id).toBe(dazId('FrontLeftBraid'))
      expect(parts.node_path).toBe(dazId('FrontLeftBraid'))
      expect(parts.property_path).toBe('center_point/x')
      expect(parts.scheme).toBe('id')
   })

   it('handles URLs with encoded characters', () => {
      const url =
         'Genesis9:/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBend.dsf#body_ctrl_HipBend?value' as string_DazUrl
      const parts = parseDazUrl(url)

      expect(parts.file_path).toBe('data/Daz 3D/Genesis 9/Base/Morphs/Daz 3D/Base Pose/body_ctrl_HipBend.dsf')
      expect(parts.asset_id).toBe(dazId('body_ctrl_HipBend'))
      expect(parts.node_path).toBe(dazId('Genesis9'))
      expect(parts.property_path).toBe('value')
      expect(parts.scheme).toBe('id')
   })

   describe('sample URLs from daz.output.ts', () => {
      it('parses all sample URLs without throwing', () => {
         for (const url of sampleDazFormulaOutputs) {
            expect(() => parseDazUrl(url as string_DazUrl)).not.toThrow()
         }
      })

      it('correctly extracts paths from sample URLs', () => {
         // Test a few specific examples
         const url1 = 'aprilyshEirgridHair_428373:#body_cbs_shoulder_backl?value' as string_DazUrl
         const parts1 = parseDazUrl(url1)
         expect(parts1.file_path).toBe('')
         expect(parts1.node_path).toBe(dazId('aprilyshEirgridHair_428373'))
         expect(parts1.asset_id).toBe(dazId('body_cbs_shoulder_backl'))
         expect(parts1.property_path).toBe('value')
         expect(parts1.scheme).toBe('id')

         const url2 =
            'FrontLeftBraid:/data/AprilYSH/EirgridGenesis/EirgridHairG9/aprilyshEirgridHair_428373.dsf#FrontLeftBraid?center_point/x' as string_DazUrl
         const parts2 = parseDazUrl(url2)
         expect(parts2.file_path).toBe('data/AprilYSH/EirgridGenesis/EirgridHairG9/aprilyshEirgridHair_428373.dsf')
         expect(parts2.node_path).toBe(dazId('FrontLeftBraid'))
         expect(parts2.asset_id).toBe(dazId('FrontLeftBraid'))
         expect(parts2.property_path).toBe('center_point/x')
         expect(parts2.scheme).toBe('id')
      })
   })

   it('parses URLs with "id" scheme', () => {
      const url = 'id:/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#Genesis9-1' as string_DazUrl
      const parts = parseDazUrl(url)
      expect(parts.scheme).toBe('id')
      expect(parts.file_path).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')
      expect(parts.asset_id).toBe(dazId('Genesis9-1'))
      expect(parts.node_path).toBeUndefined()
   })

   it('parses URLs with "name" scheme', () => {
      const url = 'name:/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#Genesis9-1' as string_DazUrl
      const parts = parseDazUrl(url)
      expect(parts.scheme).toBe('name')
      expect(parts.file_path).toBe('data/Daz 3D/Genesis 9/Base/Genesis9.dsf')
      expect(parts.asset_id).toBe(dazId('Genesis9-1'))
      expect(parts.node_path).toBeUndefined()
   })

   it('parses complex URLs with node path and scheme', () => {
      const url = 'name:hips/rfoot:figures/Victor#rfoot?translation' as string_DazUrl
      const parts = parseDazUrl(url)
      expect(parts.scheme).toBe('name')
      expect(parts.node_path).toBe(dazId('hips/rfoot'))
      expect(parts.file_path).toBe('figures/Victor')
      expect(parts.asset_id).toBe(dazId('rfoot'))
      expect(parts.property_path).toBe('translation')
   })
})
