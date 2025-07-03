import '../DI.js'

import { describe, expect, test } from 'bun:test'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { dazIds } from '../spec.js'
import { RVCharacter } from './Character.js'

describe('Bone Names Debug', () => {
   test('should list all bone names to find arm bones', async () => {
      const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      const dazChar = await mgr.loadGenesis9CharacterFile()

      const characters = [dazChar]
      expect(characters.length).toBeGreaterThan(0)
      expect(characters[0].relPath).toBe('People/Genesis 9/Genesis 9.duf')

      const character = await RVCharacter.createFromFile(characters[0])
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

      // biome-ignore format: misc
      expect(armBones).toStrictEqual(dazIds([
         "l_eyelidupper", "l_forearm", "l_forearmtwist1", "l_forearmtwist2", "l_lipupper", "l_shoulder",
         "l_upperarm", "l_upperarmtwist1", "l_upperarmtwist2", "r_eyelidupper", "r_forearm", "r_forearmtwist1",
         "r_forearmtwist2", "r_lipupper", "r_shoulder", "r_upperarm", "r_upperarmtwist1", "r_upperarmtwist2"
      ]))

      // Also check for common patterns
      const leftBones = boneNames.filter((name) => name.startsWith('l_')).slice(0, 20)
      const rightBones = boneNames.filter((name) => name.startsWith('r_')).slice(0, 20)

      // biome-ignore format: misc
      expect(leftBones).toStrictEqual(dazIds([
         "l_bigtoe1", "l_bigtoe2", "l_browinner", "l_browouter", "l_cheek", "l_cheeklower", "l_ear", "l_eye",
         "l_eyelidlower", "l_eyelidupper", "l_foot", "l_forearm", "l_forearmtwist1", "l_forearmtwist2",
         "l_hand", "l_hand_anchor", "l_index1", "l_index2", "l_index3", "l_indexmetacarpal"
      ]))

      // biome-ignore format: misc
      expect(rightBones).toStrictEqual(dazIds([
         "r_bigtoe1", "r_bigtoe2", "r_browinner", "r_browouter", "r_cheek", "r_cheeklower", "r_ear", "r_eye",
         "r_eyelidlower", "r_eyelidupper", "r_foot", "r_forearm", "r_forearmtwist1", "r_forearmtwist2",
         "r_hand", "r_hand_anchor", "r_index1", "r_index2", "r_index3", "r_indexmetacarpal"
      ]))

      // console.log('ARM-RELATED BONES:', armBones)
      // console.log('FIRST 20 LEFT BONES:', leftBones)
      // console.log('FIRST 20 RIGHT BONES:', rightBones)
   })
})
