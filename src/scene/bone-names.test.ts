import '../DI.js'
import { describe, expect, test } from 'bun:test'
import { mgr } from '../main.js'
import { RVCharacter } from './Character.js'

describe('Bone Names Debug', () => {
   test('should list all bone names to find arm bones', async () => {
      const characters = [...mgr.charactersByDazId.values()]
      expect(characters.length).toBeGreaterThan(0)

      const character = new RVCharacter(characters[0])
      expect(character.skeleton).toBeTruthy()
      expect(character.bones.size).toBeGreaterThan(0)

      console.log('=== ALL BONE NAMES ===')
      const boneNames = Array.from(character.bones.keys()).sort()

      // Filter for arm-related bones
      const armBones = boneNames.filter(
         (name) =>
            name.includes('arm') ||
            name.includes('shoulder') ||
            name.includes('shldr') ||
            (name.includes('l_') && (name.includes('upper') || name.includes('fore'))) ||
            (name.includes('r_') && (name.includes('upper') || name.includes('fore'))),
      )

      console.log('ARM-RELATED BONES:', armBones)

      // Also check for common patterns
      const leftBones = boneNames.filter((name) => name.startsWith('l_')).slice(0, 20)
      const rightBones = boneNames.filter((name) => name.startsWith('r_')).slice(0, 20)

      console.log('FIRST 20 LEFT BONES:', leftBones)
      console.log('FIRST 20 RIGHT BONES:', rightBones)
   })
})
