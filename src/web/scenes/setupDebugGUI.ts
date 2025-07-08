import GUI from 'lil-gui'
import * as path from 'pathe'
import { getMgr } from '../../DI.js'
import { RVFigure } from '../../scene/RVFigure.js'
import { RVNode } from '../../scene/RVNode.js'
import { DazAssetType } from '../../spec.js'
import { string_RelPath } from '../../types.js'

export async function setupDebugGUI(
   //
   characterNode: RVNode,
   mainGui: GUI,
) {
   const character1 = characterNode as RVFigure

   // Character 1 controls
   const char1Folder = mainGui.addFolder('Character 1')
   char1Folder.add(character1, 'wireframeEnabled').name('Wireframe')
   char1Folder.add(character1, 'ghostModeEnabled').name('Ghost Mode')
   char1Folder.add(character1, 'boneHelperVisible').name('Show Skeleton')

   // add slider for `body_ctrl_WaistTwist` modifier
   // char1Folder.add(character1, 'body_ctrl_WaistTwist', 0, 1).name('Waist Twist')
   char1Folder
      .add({ logHierarchy: () => console.log(character1.getSkeletonHierarchyString()) }, 'logHierarchy')
      .name('Log Skeleton')

   // Pose selection
   const mgr = getMgr()
   type CachedFile = { assetType: DazAssetType; relPath: string_RelPath }
   const poses = (await mgr.getCachedFiles()).filter((f: CachedFile) => f.assetType === 'preset_pose')
   const poseMap = new Map<string, string>()
   poseMap.set('None', 'none') // Special value for no pose
   poses.forEach((p: CachedFile) => poseMap.set(path.basename(p.relPath), p.relPath))

   const state = {
      pose: 'none',
   }

   const allowedPoses = Array.from(poseMap.keys().filter((i) => i.toLowerCase().includes('seated'))).sort()
   char1Folder
      .add(state, 'pose', allowedPoses)
      .name('Select Pose')
      .onChange(async (poseName: string) => {
         const posePath = poseMap.get(poseName)
         if (!posePath || posePath === 'none') {
            // TODO: reset pose
            return
         }

         const poseFile = await mgr.loadPoseFile(posePath as string_RelPath)
         if (poseFile) {
            character1.applyPose(poseFile)
         }
      })

   // Open folders by default
   char1Folder.open()
}
