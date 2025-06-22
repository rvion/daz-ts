import { DazGeometryInf } from './core/DazGeometryInf.js'
import { DazGeometryRef } from './core/DazGeometryRef.js'
import { DazNode } from './core/DazNode.js'

// this object should be filled by DI.setup
export const GLOBAL = {
   DazGeometryRef: DazGeometryRef,
   DazGeometryInf: DazGeometryInf,
   DazNode: DazNode,
}
