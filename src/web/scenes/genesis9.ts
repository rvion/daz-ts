import { DazMgr } from '../../mgr.js'
import { RVScene } from '../../scene/RVScene.js'
import { bang } from '../../utils/assert.js'
import { setupDebugGUI } from './setupDebugGUI.js'

export let scene: RVScene | null = null

export async function initSceneGenesis9(mgr: DazMgr) {
   // If a scene already exists, dispose of it properly
   if (scene) scene.dispose()

   // 1. Initialize the main scene manager
   scene = mgr.createScene()
   const action1 = await scene.loadFileFromRelPath('People/Genesis 9/Genesis 9.duf')
   const figure = action1.addedFigure_orCrash
   await figure.loadModifierFile('body_ctrl_WaistTwist') // Load the waist twist modifier
   // await figure.loadModifierFile('Amala_figure_ctrl_Character') // Load the waist twist modifier
   await figure.loadModifierFile('head_ctrl_ProportionHeadSize_scl')

   // Adjust camera for a wider view to see both characters
   // Assuming characters are around 170 units (cm) tall
   const characterAvgHeight = 170
   scene.camera.position.set(0, characterAvgHeight * 1.75, 300) // Position camera further back
   scene.camera.lookAt(0, characterAvgHeight / 2, 0) // Look at the center point between characters at mid-height
   scene.camera.updateProjectionMatrix()

   console.log(`[🤠] Character loaded`, figure)
   // 4. Setup debug GUI
   await setupDebugGUI(figure, bang(scene.mainGui))

   // 5. Start the rendering loop
   scene.start()
   scene.centerCameraOnNodeId('head') // Center camera on the right hand bone
   console.log('RuntimeScene initialized with RVFigure.')
}

export function cleanupSceneGenesis9(rt: RVScene) {
   if (scene) {
      scene.dispose()
      scene = null
      console.log('RuntimeScene cleaned up.')
   }

   if (rt.mainGui) {
      rt.mainGui.destroy()
      rt.mainGui = null
      console.log('Main GUI cleaned up.')
   }
   if (rt.sceneGraphGui) {
      rt.sceneGraphGui.destroy()
      rt.sceneGraphGui = null
      console.log('Scene Graph GUI cleaned up.')
   }
}
