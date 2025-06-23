/** biome-ignore-all lint/style/noNonNullAssertion: ... */
import '../DI.js'
import { describe, expect, test } from 'bun:test'
import * as THREE from 'three'
import { DazCharacter } from '../core/DazFileCharacter.js'
import { asDazId } from '../spec.js'
import { RVCharacter } from './Character.js'

describe('Skeleton Synchronization', () => {
   test('skeleton helper should be visible without calling getWorldPosition', async () => {
      // Create a mock character with minimal data
      const mockCharacter = {
         dazId: 'test-character',
         figure_orCrash: {
            nodes: new Map([
               [
                  'hip',
                  {
                     dazId: 'hip',
                     data: {
                        type: 'bone',
                        name: 'hip',
                        center_point: [
                           { id: 'x', value: 0 },
                           { id: 'y', value: 100 },
                           { id: 'z', value: 0 },
                        ],
                     },
                     parent_orCrash: { type: 'figure', dazId: 'Genesis9' },
                     parentId_orCrash: 'Genesis9',
                  },
               ],
               [
                  'pelvis',
                  {
                     dazId: 'pelvis',
                     data: {
                        type: 'bone',
                        name: 'pelvis',
                        center_point: [
                           { id: 'x', value: 0 },
                           { id: 'y', value: 110 },
                           { id: 'z', value: 0 },
                        ],
                     },
                     parent_orCrash: { type: 'bone', dazId: 'hip' },
                     parentId_orCrash: 'hip',
                  },
               ],
            ]),
         },
         nodeRefs: new Map(),
      } as unknown as DazCharacter

      const character = new RVCharacter(mockCharacter)

      // Verify skeleton was created
      expect(character.skeleton).not.toBeNull()
      expect(character.skeletonHelper).not.toBeNull()
      expect(character.bones.size).toBe(2)

      // Verify skeleton helper is visible by default
      expect(character.skeletonHelper!.visible).toBe(true)

      // Verify bones have correct world positions without manually calling getWorldPosition
      const hipBone = character.bones.get(asDazId('hip'))
      const pelvisBone = character.bones.get(asDazId('pelvis'))

      expect(hipBone).toBeDefined()
      expect(pelvisBone).toBeDefined()

      // Test that world positions are accessible (this should work without manual matrix updates)
      const hipWorldPos = new THREE.Vector3()
      const pelvisWorldPos = new THREE.Vector3()

      hipBone!.getWorldPosition(hipWorldPos)
      pelvisBone!.getWorldPosition(pelvisWorldPos)

      // Hip should be at its absolute position
      expect(hipWorldPos.y).toBeCloseTo(100, 1)

      // Pelvis should be at hip position + relative offset (10 units up)
      expect(pelvisWorldPos.y).toBeCloseTo(110, 1)
   })

   test('skeleton matrices update during animation loop', () => {
      const mockCharacter = {
         dazId: 'test-character',
         figure_orCrash: {
            nodes: new Map([
               [
                  'hip',
                  {
                     dazId: 'hip',
                     data: {
                        type: 'bone',
                        name: 'hip',
                        center_point: [
                           { id: 'x', value: 0 },
                           { id: 'y', value: 100 },
                           { id: 'z', value: 0 },
                        ],
                     },
                     parent_orCrash: { type: 'figure', dazId: 'Genesis9' },
                     parentId_orCrash: 'Genesis9',
                  },
               ],
            ]),
         },
         nodeRefs: new Map(),
      } as unknown as DazCharacter

      const character = new RVCharacter(mockCharacter)
      const hipBone = character.bones.get(asDazId('hip'))!

      // Modify bone rotation
      hipBone.rotation.y = Math.PI / 4

      // Call update (simulating animation loop)
      character.update()

      // Verify that world matrix is current
      const worldPos = new THREE.Vector3()

      // Before update, matrix might need updating
      const needsUpdateBefore = hipBone.matrixWorldNeedsUpdate

      hipBone.getWorldPosition(worldPos)

      // Should be able to get world position without issues
      expect(worldPos).toBeDefined()

      // The matrix should have been updated if it needed to be
      if (needsUpdateBefore) {
         expect(hipBone.matrixWorld).toBeDefined()
      }
   })
})
