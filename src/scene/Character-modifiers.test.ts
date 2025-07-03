import { beforeAll, describe, expect, test } from 'bun:test'
import '../DI.js'

import * as THREE from 'three'
import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVFigure } from './RVFigure.js'

const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
describe('RVFigure Modifier Tests', () => {
   let rvFigure: RVFigure
   let scene: RuntimeScene

   beforeAll(async () => {
      await mgr.loadModifiersDb()
      scene = mgr.createScene()
      const characterFile = await mgr.loadFileAs('People/Genesis 9/Genesis 9.duf', DazFileCharacter)
      const { newTopLevelNodes } = await characterFile.addToScene(scene)
      rvFigure = newTopLevelNodes[0] as RVFigure
   })

   test('should apply body_ctrl_WaistTwist modifier', async () => {
      const lHand = rvFigure.getBone_orCrash('l_hand')
      const rHand = rvFigure.getBone_orCrash('r_hand')
      const initialLPosition = lHand.getWorldPosition(new THREE.Vector3())
      const initialRPosition = rHand.getWorldPosition(new THREE.Vector3())
      await rvFigure.setModifierValue('body_ctrl_WaistTwist', 8)
      rvFigure.updateSkeletonMatrices()
      const finalPosition = lHand.getWorldPosition(new THREE.Vector3())
      const finalRPosition = rHand.getWorldPosition(new THREE.Vector3())
      // Check that the hands position has changed
      // twist to the left:
      expect(finalPosition.z).toBeLessThan(initialLPosition.z) // left hand should move closer
      expect(finalRPosition.z).toBeGreaterThan(initialRPosition.z) // right hand should move further away
   })

   test('find modifier by name', () => {
      expect(rvFigure.applicableModifiers).toBeDefined()
      expect(rvFigure.applicableModifiers.body_bs_ProportionArmsLength).toBeDefined()
   })

   // 🔴 this test is failing
   test.only('should apply body_bs_ProportionArmsLength modifier', async () => {
      expect(scene.getSceneGraphAsString_simple()).toStrictEqual([
         '- RuntimeScene (❓)',
         '  - Figure_Genesis9 (🧑‍🎤)',
         '    - Bone_hip (🦴)',
      ])
      // start hand position
      const lHand = rvFigure.getBone_orCrash('l_hand')
      rvFigure.updateSkeletonMatrices()
      const initialPosition = lHand.getWorldPosition(new THREE.Vector3())

      // change arm length
      await rvFigure.setModifierValue('body_bs_ProportionArmsLength', 1.3, { printFormulas: 3 })

      rvFigure.updateSkeletonMatrices()
      expect(scene.getSceneGraphAsString_simple()).toStrictEqual([
         '- RuntimeScene (❓)',
         '  - Figure_Genesis9 (🧑‍🎤)',
         '    - Bone_hip (🦴)',
         '    - body_bs_ProportionArmsLength (🛠️)',
      ])

      // check hand position changed
      const finalPosition = lHand.getWorldPosition(new THREE.Vector3())
      expect(finalPosition.y).toBeLessThan(initialPosition.y) // hand should be lower
      expect(finalPosition.x).toBeGreaterThan(initialPosition.x) // hand should be further away
      // expect(finalPosition.z).toBe(initialPosition.z) // hand should be lower

      /*
      check we properly have new RVModifiers in the graph
      check some modifers have chanels in the graph.
      check chanel values
      */
   })
})
