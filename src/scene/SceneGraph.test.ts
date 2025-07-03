import { beforeAll, describe, expect, test } from 'bun:test'
import '../DI.js'

import { fs } from '../fs/fsNode.js'
import { DazMgr } from '../mgr.js'
import { RuntimeScene } from './RuntimeScene.js'

describe('SceneGraph', () => {
   let mgr: DazMgr
   let runtimeScene: RuntimeScene

   beforeAll(async () => {
      mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)
      await mgr.loadModifiersDb()
   })

   test('should build a scene graph from a character file', async () => {
      runtimeScene = new RuntimeScene(800, 600)
      const characterFile = await mgr.loadGenesis9CharacterFile()
      await runtimeScene.addDazFile(characterFile)

      // Add a utility method to print the scene graph for debugging
      const sceneGraphString = (runtimeScene as any).getSceneGraphAsString()
      console.log(sceneGraphString)

      // Initial basic assertion
      expect(runtimeScene.children.length).toBeGreaterThan(0)
   })
})
