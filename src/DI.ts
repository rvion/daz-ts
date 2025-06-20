import { DazGeometry } from './core/DazGeometry.js'
import { DazNode } from './core/DazNode.js'

// this object should be filled by DI.setup
export const GLOBAL = {
   DazGeometry: DazGeometry,
   DazNode: DazNode,
}
