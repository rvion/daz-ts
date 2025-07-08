import { beforeAll, beforeEach, describe, expect, test } from 'bun:test'
import '../DI.js'

import * as THREE from 'three'
import { DazFileCharacter } from '../core/DazFileCharacter.js'
import { GLOBAL } from '../DI.js'
import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { dazUrl } from '../spec.js'
import { ASSERT_INSTANCE_OF, bang } from '../utils/assert.js'
import { RuntimeScene } from './RuntimeScene.js'
import { RVFigure } from './RVFigure.js'
import { RVModifier } from './RVModifier.js'

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
      const res = await characterFile.addToScene(scene)
      rvFigure = ASSERT_INSTANCE_OF(res.newTopLevelNodes[0], GLOBAL.RVFigure)
      await rvFigure.loadModifierFile('body_ctrl_WaistTwist') // Load the waist twist modifier
   })

   test('should apply body_ctrl_WaistTwist modifier', async () => {
      const lHand = rvFigure.getBone_orCrash('l_hand')
      const rHand = rvFigure.getBone_orCrash('r_hand')
      const initialLPosition = lHand.getWorldPosition(new THREE.Vector3())
      const initialRPosition = rHand.getWorldPosition(new THREE.Vector3())

      expect(rvFigure.findNodeById('spine1')?.getSceneGraphAsString_simple({ maxDepth: 2 })).toStrictEqual([
         '🦴 #spine1 = cnt(0.0,98.9,-0.8), end(0.0,106.7,-0.8), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '    🦴 #spine2 = cnt(0.0,106.8,-1.1), end(0.0,113.9,-1.1), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '       🦴 #spine3 = cnt(0.0,114.3,-2.3), end(0.0,126.8,-2.3), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
      ])

      console.log(`[🤠] -----------`)
      const spine1RotYurl = dazUrl`spine1:/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#spine1?rotation/y`
      const valueBefore = rvFigure.getValueFromUrl(spine1RotYurl)
      expect(valueBefore).toBe(0)

      console.log(`[🤠] -----------`)
      await rvFigure.setModifierValue('body_ctrl_WaistTwist', 0.8)

      expect(scene.getSceneGraphAsString_simple({ maxDepth: 4 })).toStrictEqual([
         '🎬 #root',
         '    🧑 #Genesis9',
         '       📐 #Genesis9-1',
         '       🦴 #hip = cnt(0.0,97.1,0.5), end(0.0,80.9,0.2), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          🦴 #pelvis = cnt(0.0,99.0,-0.3), end(0.0,80.0,-0.3), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             🦴 #l_thigh = cnt(7.6,88.7,-0.4), end(9.3,48.2,-1.8), ort(1.9,5.0,2.5), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             🦴 #r_thigh = cnt(-7.6,88.7,-0.4), end(-9.3,48.2,-1.8), ort(1.9,-5.0,-2.5), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          🦴 #spine1 = cnt(0.0,98.9,-0.8), end(0.0,106.7,-0.8), ort(0*), rot(0.0,16.0,0.0), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)' /* 🔶 UPDATED */,
         '             🦴 #spine2 = cnt(0.0,106.8,-1.1), end(0.0,113.9,-1.1), ort(0*), rot(0.0,16.0,0.0), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)' /* 🔶 UPDATED */,
         '       🛠️ #body_bs_Navel_HD3 = value(undefined=0.0)',
         '       🛠️ #head_bs_MouthRealism_HD3 = value(undefined=0.0)',
         '       🛠️ #SkinBinding',
         '       🛠️ #facs_ctrl_EyeRestingFocalPoint = value(undefined=0.0)',
         '       🛠️ #body_ctrl_WaistTwist = value(undefined=0.8)',
      ])
      console.log(`[🤠] -----------`)
      const valueAfter = rvFigure.getValueFromUrl(spine1RotYurl)
      expect(valueAfter).toBe(16.0) // 0.8 * 20 = 16 degrees

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
         '       🦴 #hip = cnt(0.0,97.1,0.5), end(0.0,80.9,0.2), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          🦴 #pelvis = cnt(0.0,99.0,-0.3), end(0.0,80.0,-0.3), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             🦴 #l_thigh = cnt(7.6,88.7,-0.4), end(9.3,48.2,-1.8), ort(1.9,5.0,2.5), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             🦴 #r_thigh = cnt(-7.6,88.7,-0.4), end(-9.3,48.2,-1.8), ort(1.9,-5.0,-2.5), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          🦴 #spine1 = cnt(0.0,98.9,-0.8), end(0.0,106.7,-0.8), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             🦴 #spine2 = cnt(0.0,106.8,-1.1), end(0.0,113.9,-1.1), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '       🛠️ #body_bs_Navel_HD3 = value(undefined=0.0)',
         '       🛠️ #head_bs_MouthRealism_HD3 = value(undefined=0.0)',
         '       🛠️ #SkinBinding',
         '       🛠️ #facs_ctrl_EyeRestingFocalPoint = value(undefined=0.0)',
         '       🛠️ #body_ctrl_WaistTwist = value(undefined=0.0)',
      ])

      // change arm length
      await rvFigure.loadModifierFile('body_bs_ProportionArmsLength')
      await rvFigure.setModifierValue('body_bs_ProportionArmsLength', 1.3)

      expect(scene.getSceneGraphAsString_simple({ maxDepth: 4 })).toStrictEqual([
         '🎬 #root',
         '    🧑 #Genesis9',
         '       📐 #Genesis9-1',
         '          🛠️ #body_bs_ProportionArmsLength = value(undefined=1.3)',
         '       🦴 #hip = cnt(0.0,97.1,0.5), end(0.0,80.9,0.2), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          🦴 #pelvis = cnt(0.0,99.0,-0.3), end(0.0,80.0,-0.3), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             🦴 #l_thigh = cnt(7.6,88.7,-0.4), end(9.3,48.2,-1.8), ort(1.9,5.0,2.5), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             🦴 #r_thigh = cnt(-7.6,88.7,-0.4), end(-9.3,48.2,-1.8), ort(1.9,-5.0,-2.5), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          🦴 #spine1 = cnt(0.0,98.9,-0.8), end(0.0,106.7,-0.8), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             🦴 #spine2 = cnt(0.0,106.8,-1.1), end(0.0,113.9,-1.1), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '       🛠️ #body_bs_Navel_HD3 = value(undefined=0.0)',
         '       🛠️ #head_bs_MouthRealism_HD3 = value(undefined=0.0)',
         '       🛠️ #SkinBinding',
         '       🛠️ #facs_ctrl_EyeRestingFocalPoint = value(undefined=0.0)',
         '       🛠️ #body_ctrl_WaistTwist = value(undefined=0.0)',
      ])

      // Check that the figure is selected
      expect(scene.selection).toBeInstanceOf(RVFigure)
      expect(scene.selection?.dazId).toBe(rvFigure.dazId)

      rvFigure.updateSkeletonMatrices()

      // Check scene graph for modifier and channel
      const modifierNode = bang(rvFigure.findNodeById('body_bs_ProportionArmsLength'))
      expect(modifierNode).toBeInstanceOf(RVModifier)
      expect(modifierNode.emoji).toBe('🛠️')

      const channelNode = modifierNode.channels.value
      expect(channelNode).toBeDefined()

      // Check path resolution
      expect(modifierNode.path).toBe('/root/Genesis9/Genesis9-1/body_bs_ProportionArmsLength')

      // check hand position changed
      const finalPosition = lHand.getWorldPosition(new THREE.Vector3())
      expect(finalPosition.y).toBeLessThan(initialPosition.y) // hand should be lower
      expect(finalPosition.x).toBeGreaterThan(initialPosition.x) // hand should be further away
   })
})
