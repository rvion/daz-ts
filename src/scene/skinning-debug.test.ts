import '../DI.js'

import { describe, expect, test } from 'bun:test'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'

describe('Skinning Debug', () => {
   test('should debug skin data structure', async () => {
      const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      const scene = mgr.createScene()
      const action = await scene.loadFile('People/Genesis 9/Genesis 9.duf')
      const character = action.addedFigure_orCrash
      expect(scene.getSceneGraphAsString({ maxDepth: 3, emoji: true, showMaterial: false })).toStrictEqual([
         '🎬 #root',
         '    🧑 #Genesis9',
         '       📐 #Genesis9-1',
         '       🦴 #hip = cnt(0.0,97.1,0.5), end(0.0,80.9,0.2), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          🦴 #pelvis = cnt(0.0,99.0,-0.3), end(0.0,80.0,-0.3), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          🦴 #spine1 = cnt(0.0,98.9,-0.8), end(0.0,106.7,-0.8), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '       🛠️ #body_bs_Navel_HD3 = value(undefined=0.0)',
         '       🛠️ #head_bs_MouthRealism_HD3 = value(undefined=0.0)',
         '       🛠️ #SkinBinding',
         '       🛠️ #facs_ctrl_EyeRestingFocalPoint = value(undefined=0.0)',
      ])
      expect(character.skeleton).toBeTruthy()
      expect(character.bones.size).toBeGreaterThan(0)

      // Debug the first geometry with skin data
      for (const nodeInstance of character.dazCharacter.sceneNodes.values()) {
         for (const dazGeometryInstance of nodeInstance.geometries) {
            const resolvedInf = await dazGeometryInstance.resolveDef()
            const figure = await character.dazCharacter.resolve()
            if (figure.hasSkinData()) {
               const skinData = resolvedInf.getSkinWeightsForThree()
               if (skinData) {
                  console.log('=== SKIN DATA DEBUG ===')
                  console.log('Bone names:', skinData.boneNames)
                  console.log('Bone names count:', skinData.boneNames.length)
                  console.log('Bone indices length:', skinData.boneIndices.length)
                  console.log('Bone weights length:', skinData.boneWeights.length)
                  console.log('First 20 bone indices:', skinData.boneIndices.slice(0, 20))
                  console.log('First 20 bone weights:', skinData.boneWeights.slice(0, 20))

                  // Check skeleton bone mapping
                  console.log('=== SKELETON MAPPING ===')
                  console.log('Skeleton bones count:', character.skeleton?.bones.length)
                  console.log('Character bones count:', character.bones.size)

                  // Check bone name mapping
                  const unmappedBones: string[] = []
                  for (const boneName of skinData.boneNames) {
                     if (!character.boneNameToIndex.has(boneName)) {
                        unmappedBones.push(boneName)
                     }
                  }

                  if (unmappedBones.length > 0) {
                     console.log('UNMAPPED BONES:', unmappedBones)
                  }

                  // Check for invalid bone indices
                  const maxBoneIndex = Math.max(...skinData.boneIndices)
                  const maxValidIndex = skinData.boneNames.length - 1
                  console.log('Max bone index in data:', maxBoneIndex)
                  console.log('Max valid index (boneNames.length - 1):', maxValidIndex)

                  if (maxBoneIndex > maxValidIndex) {
                     console.log('ERROR: Bone indices exceed boneNames array bounds!')
                  }

                  return // Only debug first skinned geometry
               }
            }
         }
      }
   })
})
