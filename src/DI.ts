import { DazFigure } from './core/DazFileFigure.js'
import { DazGeometryInf } from './core/DazGeometry.js'
import { DazGeometryRef } from './core/DazGeometryRef.js'
import { DazNode } from './core/DazNode.js' // New import
import { DazNodeRef } from './core/DazNodeRef.js' // Corrected import path

// this object should be filled by DI.setup
export const GLOBAL = {
   DazGeometryRef: DazGeometryRef,
   DazGeometryInf: DazGeometryInf,
   DazNodeRef: DazNodeRef, // Renamed from DazNode
   DazNodeInf: DazNode, // Added DazNodeInf
   DazFigure: DazFigure,
}
