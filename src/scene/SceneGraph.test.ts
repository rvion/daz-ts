import { beforeAll, describe, expect, test } from 'bun:test'
import '../DI.js'

import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import type { RVScene } from './RVScene.js'

describe('SceneGraph', () => {
   let mgr: DazMgr
   let runtimeScene: RVScene

   beforeAll(async () => {
      mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      await mgr.loadModifiersDb()
   })

   test('should build a scene graph from a character file', async () => {
      runtimeScene = mgr.createScene()
      const characterFile = await mgr.loadGenesis9CharacterFile()
      await runtimeScene.loadFile(characterFile)

      // Add a utility method to print the scene graph for debugging
      const sceneGraphString = runtimeScene.getSceneGraphAsString({ maxDepth: 4 })
      expect(sceneGraphString).toStrictEqual([
         '#root (RuntimeScene)',
         '    #Genesis9 (RVFigure)',
         '       #Genesis9-1 (RVGeometryInstance)',
         '       #hip (RVBone)',
         '          #pelvis (RVBone)',
         '             #l_thigh (RVBone)',
         '             #r_thigh (RVBone)',
         '          #spine1 (RVBone)',
         '             #spine2 (RVBone)',
         '       #body_bs_Navel_HD3 (RVModifier)',
         '          #value (RVChannel) = 0',
         '       #head_bs_MouthRealism_HD3 (RVModifier)',
         '          #value (RVChannel) = 0',
         '       #SkinBinding (RVModifier)',
         '       #facs_ctrl_EyeRestingFocalPoint (RVModifier)',
         '          #value (RVChannel) = 0',
      ])

      // Initial basic assertion
      expect(runtimeScene.children.length).toBeGreaterThan(0)
   })
})
