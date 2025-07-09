import { beforeAll, describe, expect, test } from 'bun:test'
import '../DI.js'

import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import type { RVScene } from './RVScene.js'

describe('SceneGraph', () => {
   let mgr: DazMgr
   let scene: RVScene

   beforeAll(async () => {
      mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      await mgr.loadModifiersDb()
   })

   test('should build a scene graph from a character file', async () => {
      scene = mgr.createScene()
      await scene.loadFileFromRelPath(mgr.genesis9baseDufRelPath)

      // Add a utility method to print the scene graph for debugging
      const sceneGraphString = scene.getSceneGraphAsString({ maxDepth: 4 })
      expect(sceneGraphString).toStrictEqual([
         '#root (RVScene)',
         '    #Genesis9 (RVFigure)',
         '       #Genesis9-1 (RVGeometryInstance)',
         '       #hip (RVBone) = cnt(0.0,97.1,0.5), end(0.0,80.9,0.2), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          #pelvis (RVBone) = cnt(0.0,99.0,-0.3), end(0.0,80.0,-0.3), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             #l_thigh (RVBone) = cnt(7.6,88.7,-0.4), end(9.3,48.2,-1.8), ort(1.9,5.0,2.5), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             #r_thigh (RVBone) = cnt(-7.6,88.7,-0.4), end(-9.3,48.2,-1.8), ort(1.9,-5.0,-2.5), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '          #spine1 (RVBone) = cnt(0.0,98.9,-0.8), end(0.0,106.7,-0.8), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '             #spine2 (RVBone) = cnt(0.0,106.8,-1.1), end(0.0,113.9,-1.1), ort(0*), rot(0*), trs(0*), scale(1.0,1.0,1.0), general_scale(undefined=1.0)',
         '       #body_bs_Navel_HD3 (RVModifier) = value(undefined=0.0)',
         '       #head_bs_MouthRealism_HD3 (RVModifier) = value(undefined=0.0)',
         '       #SkinBinding (RVModifier)',
         '       #facs_ctrl_EyeRestingFocalPoint (RVModifier) = value(undefined=0.0)',
      ])

      // Initial basic assertion
      expect(scene.children.length).toBeGreaterThan(0)
   })
})
