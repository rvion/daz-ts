import { beforeAll, describe, expect, test } from 'bun:test'
import '../DI.js'

import * as THREE from 'three'
import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { RVCharacter } from './Character.js'

describe('RVCharacter Modifier Tests', () => {
   let rvCharacter: RVCharacter

   beforeAll(async () => {
      const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      await mgr.loadModifiersDb()
      const characterFile = await mgr.loadFile('People/Genesis 9/Genesis 9.duf')
      if (!(characterFile instanceof DazFileCharacter)) {
         throw new Error(`Expected DazCharacter, got ${characterFile.constructor.name}`)
      }
      rvCharacter = await RVCharacter.createFromFile(characterFile)
   })

   test('should apply body_ctrl_WaistTwist modifier', async () => {
      const lHand = rvCharacter.getBone_orCrash('l_hand')
      const initialPosition = lHand.getWorldPosition(new THREE.Vector3())

      await rvCharacter.setModifierValue('body_ctrl_WaistTwist', 8)
      rvCharacter.updateSkeletonMatrices()

      const finalPosition = lHand.getWorldPosition(new THREE.Vector3())
      expect(finalPosition.z).toBeLessThan(initialPosition.z)
   })

   test('find modifier by name', () => {
      expect(rvCharacter.applicableModifiers).toBeDefined()
      expect(rvCharacter.applicableModifiers.body_bs_ProportionArmsLength).toBeDefined()
      // rvCharacter.setModifierValue('body_bs_ProportionArmsLength', 3)
      // expect()
   })

   // 🔴 this test is failing
   test('should apply body_bs_ProportionArmsLength modifier', async () => {
      const lHand = rvCharacter.getBone_orCrash('l_hand')
      const initialPosition = lHand.getWorldPosition(new THREE.Vector3())
      console.log(`[🤠] ----`)
      await rvCharacter.setModifierValue('body_bs_ProportionArmsLength', 2)
      rvCharacter.updateSkeletonMatrices()
      console.log(`[🤠] ----`)

      const finalPosition = lHand.getWorldPosition(new THREE.Vector3())
      // expect(finalPosition.x).not.toBe(initialPosition.x)
      // expect(finalPosition.z).not.toBe(initialPosition.z)
      expect(finalPosition.y).toBeLessThan(initialPosition.y)
   })
})
