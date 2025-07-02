import '../DI.js'

import { describe, expect, test } from 'bun:test'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { RVCharacter } from './Character.js'

describe('Skinning Debug', () => {
   test('should debug skin data structure', async () => {
      const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      const dazChar = await mgr.loadGenesis9CharacterFile()
      console.log(`[🤠] A`)
      await dazChar.resolve() // ensure all data is loaded
      console.log(`[🤠] B`)

      const character = new RVCharacter(dazChar)
      expect(character.skeleton).toBeTruthy()
      expect(character.bones.size).toBeGreaterThan(0)

      // Debug the first geometry with skin data
      for (const nodeRef of character.character.nodeInstances.values()) {
         if (!nodeRef.geometryInstances) continue

         for (const geometryRef of nodeRef.geometryInstances.values()) {
            const resolvedInf = geometryRef.geometry
            if (!resolvedInf) continue

            if (character.figure_orCrash.hasSkinData()) {
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
                     if (!character.boneNameToIndexMap.has(boneName)) {
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
