import '../DI.js'

import { describe, expect, test } from 'bun:test'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { RVCharacter } from './Character.js'

describe('Skinning Debug', () => {
   test('should debug skin data structure', async () => {
      const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      await mgr.loadGenesis9CharacterFile()

      const characters = [...mgr.charactersByDazId.values()]
      expect(characters.length).toBeGreaterThan(0)

      const character = new RVCharacter(characters[0])
      expect(character.skeleton).toBeTruthy()
      expect(character.bones.size).toBeGreaterThan(0)

      // Debug the first geometry with skin data
      for (const nodeRef of character.character.nodeRefs.values()) {
         if (!nodeRef.geometryRefs) continue

         for (const geometryRef of nodeRef.geometryRefs.values()) {
            const resolvedInf = geometryRef.resolvedGeometryInf
            if (!resolvedInf) continue

            if (resolvedInf.hasSkinData(character.figure_orCrash)) {
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
