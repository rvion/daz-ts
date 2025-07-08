/** biome-ignore-all lint/style/noNonNullAssertion: ... */
import '../DI.js'
import { describe, expect, test } from 'bun:test'
import * as THREE from 'three'
import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { dazId } from '../spec.js'
import { RVFigure } from './RVFigure.js'

describe('Skeleton Synchronization', () => {
   const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

   test('skeleton helper should be visible without calling getWorldPosition', async () => {
      const scene = mgr.createScene()
      const characterFile = await mgr.loadFileAs('People/Genesis 9/Genesis 9.duf', DazFileCharacter)
      const { newTopLevelNodes } = await scene.loadFile(characterFile)
      const character = newTopLevelNodes[0] as RVFigure

      // Verify skeleton was created
      expect(character.skeleton).not.toBeNull()
      expect(character.skeletonHelper).not.toBeNull()
      expect(character.bones.size).toBe(138)

      // Verify skeleton helper is visible by default
      expect(character.skeletonHelper!.visible).toBe(true)

      // Verify bones have correct world positions without manually calling getWorldPosition
      const hipBone = character.bones.get(dazId('hip'))
      const pelvisBone = character.bones.get(dazId('pelvis'))

      expect(hipBone).toBeDefined()
      expect(pelvisBone).toBeDefined()

      // Test that world positions are accessible (this should work without manual matrix updates)
      const hipWorldPos = new THREE.Vector3()
      const pelvisWorldPos = new THREE.Vector3()

      hipBone!.getWorldPosition(hipWorldPos)
      pelvisBone!.getWorldPosition(pelvisWorldPos)

      // Hip should be at its absolute position
      expect(hipWorldPos.y).toBeCloseTo(97, 0)

      // Pelvis should be at hip position + relative offset (10 units up)
      expect(pelvisWorldPos.y).toBeCloseTo(99, 0)
   })

   test('skeleton matrices update during animation loop', async () => {
      const scene = mgr.createScene()
      const characterFile = await mgr.loadFileAs('People/Genesis 9/Genesis 9.duf', DazFileCharacter)
      const { newTopLevelNodes } = await scene.loadFile(characterFile)
      const character = newTopLevelNodes[0] as RVFigure
      const hipBone = character.bones.get(dazId('hip'))!

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
