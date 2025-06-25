import { beforeAll, describe, expect, test } from 'bun:test'
import '../DI.js'

import * as THREE from 'three'
import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { dazId } from '../spec.js'
import { bang } from '../utils/assert.js'
import { RVCharacter } from './Character.js'

async function loadGenesis9Character(): Promise<DazFileCharacter> {
   // Create DazMgr instance with the same path as main.ts
   const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

   // Load Genesis 9 character from the same path as main.ts
   const character = await mgr.loadRelPath('People/Genesis 9/Genesis 9.duf')
   if (!(character instanceof DazFileCharacter))
      throw new Error(`Expected DazCharacter, got ${character.constructor.name}`)
   return character
}

describe('RVCharacter Skeleton Tests', () => {
   let character: DazFileCharacter
   let rvCharacter: RVCharacter

   beforeAll(async () => {
      console.log(`[🤠] 🔴`)
      character = await loadGenesis9Character()
      rvCharacter = new RVCharacter(character)
   })

   test('should create character with resolved figure', () => {
      expect(character.figure).toBeDefined()
      expect(character.figure).not.toBeNull()
   })

   test('should build skeleton with bones', () => {
      expect(rvCharacter.bones.size).toBeGreaterThan(0)
   })

   test('should have proper bone hierarchy', () => {
      const hierarchyString = rvCharacter.skeletonHierarchyString
      expect(hierarchyString).toContain('=== Skeleton Hierarchy ===')
      expect(hierarchyString.length).toBeGreaterThan(50)
   })

   test('should have bones with proper local and world positions', () => {
      const worldPos = new THREE.Vector3()
      let bonesWithPositions = 0

      for (const [boneId, bone] of rvCharacter.bones) {
         bone.getWorldPosition(worldPos)

         // Check that positions are reasonable numbers (not NaN or Infinity)
         expect(bone.position.x).toBeFinite()
         expect(bone.position.y).toBeFinite()
         expect(bone.position.z).toBeFinite()
         expect(worldPos.x).toBeFinite()
         expect(worldPos.y).toBeFinite()
         expect(worldPos.z).toBeFinite()

         bonesWithPositions++

         // Log first few bones for inspection
         if (bonesWithPositions <= 5) {
            console.log(`Bone ${boneId}: local(${bone.position.x.toFixed(2)}, ${bone.position.y.toFixed(2)}, ${bone.position.z.toFixed(2)}) world(${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)})`) // biome-ignore format: misc
         }
      }

      expect(bonesWithPositions).toBeGreaterThan(0)
   })

   test('should have reasonable bone hierarchy structure', () => {
      // Check that head is higher than feet
      const headBone = rvCharacter.bones.get(dazId('head'))
      const toeBone = rvCharacter.bones.get(dazId('lToe'))

      if (headBone && toeBone) {
         const headWorldPos = new THREE.Vector3()
         const toeWorldPos = new THREE.Vector3()

         headBone.getWorldPosition(headWorldPos)
         toeBone.getWorldPosition(toeWorldPos)

         expect(headWorldPos.y).toBeGreaterThan(toeWorldPos.y)
         expect(headWorldPos.y).toBeGreaterThan(150 /* cm */)
         expect(toeWorldPos.y).toBeLessThan(10 /* cm */)
      }
   })

   test('should have proper parent-child relationships', () => {
      const hipBone = bang(rvCharacter.bones.get(dazId('hip')))
      const pelvisBone = bang(rvCharacter.bones.get(dazId('pelvis')))
      expect(hipBone.children).toContain(pelvisBone)
   })

   test('debug controls should work', () => {
      // Test wireframe toggle
      const initialWireframe = rvCharacter.wireframeEnabled
      rvCharacter.toggleWireframe()
      expect(rvCharacter.wireframeEnabled).toBe(!initialWireframe)

      // Test ghost mode toggle
      const initialGhost = rvCharacter.ghostModeEnabled
      rvCharacter.toggleGhostMode()
      expect(rvCharacter.ghostModeEnabled).toBe(!initialGhost)

      // Test bone helper toggle
      const initialBoneHelper = rvCharacter.boneHelperVisible
      rvCharacter.toggleBoneHelperVisibility()
      expect(rvCharacter.boneHelperVisible).toBe(!initialBoneHelper)
   })

   test('should generate expected hierarchy string format', () => {
      const hierarchyString = rvCharacter.skeletonHierarchyString

      // Should contain bone names and position data
      expect(hierarchyString).toContain('hip:')
      expect(hierarchyString).toContain('local(')
      expect(hierarchyString).toContain('world(')

      // Should show proper indentation for hierarchy
      const lines = hierarchyString.split('\n')
      const hipLine = lines.find((line) => line.includes('hip:'))
      const pelvisLine = lines.find((line) => line.includes('pelvis:'))

      if (hipLine && pelvisLine) {
         // Pelvis should be indented more than hip (child relationship)
         const hipIndent = hipLine.match(/^(\s*)/)?.[1]?.length || 0
         const pelvisIndent = pelvisLine.match(/^(\s*)/)?.[1]?.length || 0
         expect(pelvisIndent).toBeGreaterThan(hipIndent)
      }
   })
})
