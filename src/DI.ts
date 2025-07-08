/** This module should always be loaded first */

import chalk from 'chalk'
import { DazFileCharacter } from './core/DazFileCharacter.js'
import { DazFileFigure } from './core/DazFileFigure.js'
import { DazFileModifier } from './core/DazFileModifier.js'
import { DazFilePose } from './core/DazFilePose.js'
import { DazGeometryDef } from './core/DazGeometryDef.js'
import { DazGeometryInst } from './core/DazGeometryInst.js'
import { DazNodeDef } from './core/DazNodeDef.js' // New import
import { DazNodeInst } from './core/DazNodeInst.js' // Corrected import path
import type { DazMgr } from './mgr.js'
import { RVFigure } from './scene/RVFigure.js'
import { RVMaterialInstance } from './scene/RVMaterialInstance.js'
import { RVModifier } from './scene/RVModifier.js'
import type { number_Timestamp } from './types.js'

// -------- Class DI utilities --------
export const GLOBAL = {
   // files
   DazFilePose: DazFilePose,
   DazFileFigure: DazFileFigure,
   DazFileCharacter: DazFileCharacter,
   DazFileModifier: DazFileModifier,

   // geometry
   DazGeometryInstance: DazGeometryInst,
   DazGeometry: DazGeometryDef,

   // node
   DazNodeInstance: DazNodeInst,
   DazNode: DazNodeDef, // Added DazNodeInf

   // rv
   RVMaterialInstance: RVMaterialInstance,
   RVModifier: RVModifier,
   RVFigure: RVFigure,
}

// -------- Timestamp utilities --------
export const programStartedAt = Date.now()
export const lastCheckpointAt = programStartedAt
export type Delta = {
   now: number_Timestamp
   fromStart: number_Timestamp
   fromLastCheckpoint: number_Timestamp
}

export function checkpoint(msg: string): void
export function checkpoint(fn: (delta: Delta) => void): void
export function checkpoint(fn: string | ((delta: Delta) => void)): void {
   const now = Date.now()
   const delta: Delta = {
      now: now as number_Timestamp,
      fromStart: (now - programStartedAt) as number_Timestamp,
      fromLastCheckpoint: (now - lastCheckpointAt) as number_Timestamp,
   }
   if (typeof fn === 'string') console.log(chalk.gray(`[${delta.fromStart}] ${fn}`))
   else fn(delta)
}

// -------- DazMgr instance --------
const mgrRef: { mgr: DazMgr | null } = { mgr: null }
export const registerMgrInstance = (mgr: DazMgr) => {
   if (mgrRef.mgr) console.warn(chalk.yellow('DazMgr instance already registered. Overwriting.'))
   mgrRef.mgr = mgr
}
export const getMgr = () => {
   if (!mgrRef.mgr) throw new Error('DazMgr instance not registered. Call registerMgrInstance first.')
   return mgrRef.mgr
}
