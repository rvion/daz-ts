import GUI from 'lil-gui'
import { DazFileCharacter } from '../../core/DazFileCharacter.js'
import { RVCharacter } from '../../scene/Character.js'
import { RuntimeScene } from '../../scene/RuntimeScene.js'

export let runtimeScene: RuntimeScene | null = null
let gui: GUI | null = null

export async function initSceneGenesis9(characterData: DazFileCharacter) {
   // If a scene already exists, dispose of it properly
   if (runtimeScene) {
      runtimeScene.dispose()
      runtimeScene = null
   }

   // 1. Initialize the main scene manager
   runtimeScene = new RuntimeScene()

   // 2. Create new character instances from Daz data
   const character = new RVCharacter(characterData)
   const character2 = new RVCharacter(characterData)

   // Assuming Daz units are cm, 75 => 75cm => 0.75m
   character.x = -75 // Position character 1 to the left
   character2.setPosition(75, 0, 0)

   // 3. Add the characters to the scene
   runtimeScene.addCharacter(character)
   runtimeScene.addCharacter(character2)

   // Adjust camera for a wider view to see both characters
   // Assuming characters are around 170 units (cm) tall
   const characterAvgHeight = 170
   runtimeScene.camera.position.set(0, characterAvgHeight * 0.75, 300) // Position camera further back
   runtimeScene.camera.lookAt(0, characterAvgHeight / 2, 0) // Look at the center point between characters at mid-height
   runtimeScene.camera.updateProjectionMatrix()

   // 4. Setup debug GUI
   setupDebugGUI(character)

   // 5. Start the rendering loop
   runtimeScene.start()

   console.log('RuntimeScene initialized with RVCharacter.')
}

function setupDebugGUI(character1: RVCharacter) {
   // Dispose existing GUI if present
   if (gui) {
      gui.destroy()
   }

   gui = new GUI()
   gui.title('Debug Controls')

   // Character 1 controls
   const char1Folder = gui.addFolder('Character 1')
   char1Folder.add(character1, 'wireframeEnabled').name('Wireframe')
   char1Folder.add(character1, 'ghostModeEnabled').name('Ghost Mode')
   char1Folder.add(character1, 'boneHelperVisible').name('Show Skeleton')
   char1Folder
      .add({ logHierarchy: () => console.log(character1.skeletonHierarchyString) }, 'logHierarchy')
      .name('Log Skeleton')

   // Open folders by default
   char1Folder.open()
}

export function cleanupSceneGenesis9() {
   if (runtimeScene) {
      runtimeScene.dispose()
      runtimeScene = null
      console.log('RuntimeScene cleaned up.')
   }

   if (gui) {
      gui.destroy()
      gui = null
      console.log('GUI cleaned up.')
   }
}
