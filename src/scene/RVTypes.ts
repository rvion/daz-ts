import { RVNode } from './RVNode.js'

export interface AddToSceneSummary {
   newTopLevelNodes: RVNode[]
   newNodesAttachedToExistingNodes: {
      node: RVNode
      attachedTo: RVNode
      at: string
   }[]
}
