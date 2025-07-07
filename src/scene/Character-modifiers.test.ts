import { beforeAll, beforeEach, describe, expect, test } from 'bun:test'
import '../DI.js'

import * as THREE from 'three'
import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { bang } from '../utils/assert.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVFigure } from './RVFigure.js'
import { RVModifier } from './RVTypes.js'

const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)

describe('RVFigure Modifier Tests', () => {
   let rvFigure: RVFigure
   let scene: RuntimeScene

   beforeAll(async () => {
      await mgr.loadModifiersDb()
   })

   beforeEach(async () => {
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

      await rvFigure.setModifierValue('body_ctrl_WaistTwist', 0.5)

      rvFigure.updateSkeletonMatrices()
      const finalPosition = lHand.getWorldPosition(new THREE.Vector3())
      const finalRPosition = rHand.getWorldPosition(new THREE.Vector3())

      // Check that the hands position has changed
      // twist to the left:
      expect(finalPosition.z).toBeLessThan(initialLPosition.z) // left hand should move closer
      expect(finalRPosition.z).toBeGreaterThan(initialRPosition.z) // right hand should move further away

      console.log(scene.getSceneGraphAsString_simple({ maxDepth: 3 }).join('\n'))
   })

   test('find modifier by name', () => {
      expect(rvFigure.applicableModifiers).toBeDefined()
      expect(rvFigure.applicableModifiers.body_bs_ProportionArmsLength).toBeDefined()
   })

   test('should apply body_bs_ProportionArmsLength modifier and update scene graph', async () => {
      // start hand position
      const lHand = rvFigure.getBone_orCrash('l_hand')
      rvFigure.updateSkeletonMatrices()
      const initialPosition = lHand.getWorldPosition(new THREE.Vector3())
      expect(scene.getSceneGraphAsString_simple({ maxDepth: 4 })).toStrictEqual([
         '🎬 #root',
         '    🧑 #Genesis9',
         '       📐 #Genesis9-1',
         '       🦴 #hip',
         '          🦴 #pelvis',
         '             🦴 #l_thigh',
         '             🦴 #r_thigh',
         '          🦴 #spine1',
         '             🦴 #spine2',
         '       🛠️ #body_bs_Navel_HD3',
         '          📡 #value = 0',
         '       🛠️ #head_bs_MouthRealism_HD3',
         '          📡 #value = 0',
         '       🛠️ #SkinBinding',
         '       🛠️ #facs_ctrl_EyeRestingFocalPoint',
         '          📡 #value = 0',
      ])
      // change arm length
      await rvFigure.setModifierValue('body_bs_ProportionArmsLength', 1.3)

      expect(scene.getSceneGraphAsString_simple({ maxDepth: 4 })).toStrictEqual([
         '🎬 #root',
         '    🧑 #Genesis9',
         '       📐 #Genesis9-1',
         '          🛠️ #body_bs_ProportionArmsLength',
         '             📡 #value = 0',
         '       🦴 #hip',
         '          🦴 #pelvis',
         '             🦴 #l_thigh',
         '             🦴 #r_thigh',
         '          🦴 #spine1',
         '             🦴 #spine2',
         '       🛠️ #body_bs_Navel_HD3',
         '          📡 #value = 0',
         '       🛠️ #head_bs_MouthRealism_HD3',
         '          📡 #value = 0',
         '       🛠️ #SkinBinding',
         '       🛠️ #facs_ctrl_EyeRestingFocalPoint',
         '          📡 #value = 0',
      ])

      // Check that the figure is selected
      expect(scene.selection).toBeInstanceOf(RVFigure)
      expect(scene.selection?.dazId).toBe(rvFigure.dazId)

      rvFigure.updateSkeletonMatrices()

      // Check scene graph for modifier and channel
      const modifierNode = bang(rvFigure.children[0].children.find((c) => c.dazId === 'body_bs_ProportionArmsLength'))
      expect(modifierNode).toBeInstanceOf(RVModifier)
      expect(modifierNode.emoji).toBe('🛠️')

      const channelNode = modifierNode.children[0]
      expect(channelNode).toBeDefined()
      expect(channelNode.object3d.name).toBe('value')
      expect(channelNode.emoji).toBe('📡')

      // Check path resolution
      expect(modifierNode.path).toBe('/root/Genesis9/Genesis9-1/body_bs_ProportionArmsLength')
      expect(channelNode.path).toBe('/root/Genesis9/Genesis9-1/body_bs_ProportionArmsLength/value')

      // check hand position changed
      const finalPosition = lHand.getWorldPosition(new THREE.Vector3())
      expect(finalPosition.y).toBeLessThan(initialPosition.y) // hand should be lower
      expect(finalPosition.x).toBeGreaterThan(initialPosition.x) // hand should be further away
   })
})
