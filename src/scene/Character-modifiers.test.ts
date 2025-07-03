import { beforeAll, describe, expect, test } from 'bun:test'
import '../DI.js'

import * as THREE from 'three'
import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { RVFigure } from './RVFigure.js'

describe('RVFigure Modifier Tests', () => {
   let rvFigure: RVFigure

   beforeAll(async () => {
      const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      await mgr.loadModifiersDb()
      const scene = mgr.createScene()
      const characterFile = await mgr.loadFileAs('People/Genesis 9/Genesis 9.duf', DazFileCharacter)
      const { newTopLevelNodes } = await characterFile.addToScene(scene)
      rvFigure = newTopLevelNodes[0] as RVFigure
   })

   test('should apply body_ctrl_WaistTwist modifier', async () => {
      const lHand = rvFigure.getBone_orCrash('l_hand')
      const initialPosition = lHand.getWorldPosition(new THREE.Vector3())

      await rvFigure.setModifierValue('body_ctrl_WaistTwist', 8)
      rvFigure.updateSkeletonMatrices()

      const finalPosition = lHand.getWorldPosition(new THREE.Vector3())
      expect(finalPosition.z).toBeLessThan(initialPosition.z)
   })

   test('find modifier by name', () => {
      expect(rvFigure.applicableModifiers).toBeDefined()
      expect(rvFigure.applicableModifiers.body_bs_ProportionArmsLength).toBeDefined()
      // rvFigure.setModifierValue('body_bs_ProportionArmsLength', 3)
      // expect()
   })

   // 🔴 this test is failing
   test('should apply body_bs_ProportionArmsLength modifier', async () => {
      const lHand = rvFigure.getBone_orCrash('l_hand')
      const initialPosition = lHand.getWorldPosition(new THREE.Vector3())
      console.log(`[🤠] ----`)
      await rvFigure.setModifierValue('body_bs_ProportionArmsLength', 2)
      rvFigure.updateSkeletonMatrices()
      console.log(`[🤠] ----`)

      const finalPosition = lHand.getWorldPosition(new THREE.Vector3())
      // expect(finalPosition.x).not.toBe(initialPosition.x)
      // expect(finalPosition.z).not.toBe(initialPosition.z)
      expect(finalPosition.y).toBeLessThan(initialPosition.y)
   })
})
