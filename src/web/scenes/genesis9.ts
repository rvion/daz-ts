import { getMgr } from '../../DI.js'
import { DazMgr } from '../../mgr.js'
import { RuntimeScene } from '../../scene/RuntimeScene.js'
import { setupDebugGUI } from './setupDebugGUI.js'

export let scene: RuntimeScene | null = null

export async function initSceneGenesis9(mgr: DazMgr) {
   // If a scene already exists, dispose of it properly
   if (scene) {
      scene.dispose()
      scene = null
   }

   // 1. Initialize the main scene manager
   scene = mgr.createScene()
   const action1 = await scene.loadFile('People/Genesis 9/Genesis 9.duf')
   const character = action1.addedFigure_orCrash
   const action2 = await scene.loadFile('People/Genesis 9/Genesis 9.duf')
   const character2 = action1.addedFigure_orCrash
   character2.x+=50

   // Adjust camera for a wider view to see both characters
   // Assuming characters are around 170 units (cm) tall
   const characterAvgHeight = 170
   scene.camera.position.set(0, characterAvgHeight * 1.75, 300) // Position camera further back
   scene.camera.lookAt(0, characterAvgHeight / 2, 0) // Look at the center point between characters at mid-height
   scene.camera.updateProjectionMatrix()

   console.log(`[🤠] Character loaded`, character)
   // 4. Setup debug GUI
   await setupDebugGUI(character, scene)

   // 5. Start the rendering loop
   scene.start()
   console.log('RuntimeScene initialized with RVFigure.')
}

export function cleanupSceneGenesis9(rt: RuntimeScene) {
   if (scene) {
      scene.dispose()
      scene = null
      console.log('RuntimeScene cleaned up.')
   }

   if (rt.gui) {
      rt.gui.destroy()
      rt.gui = null
      console.log('GUI cleaned up.')
   }
}
