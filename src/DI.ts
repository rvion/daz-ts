/** This module should always be loaded first */

import chalk from 'chalk'
import { DazFileCharacter } from './core/DazFileCharacter.js'
import { DazFileFigure } from './core/DazFileFigure.js'
import { DazFileModifier } from './core/DazFileModifier.js'
import { DazGeometry } from './core/DazGeometry.js'
import { DazGeometryRef } from './core/DazGeometryRef.js'
import { DazNode } from './core/DazNode.js' // New import
import { DazNodeRef } from './core/DazNodeRef.js' // Corrected import path
import type { DazMgr } from './mgr.js'
import type { number_Timestamp } from './types.js'

// -------- Class DI utilities --------
export const GLOBAL = {
   // files
   DazFileFigure: DazFileFigure,
   DazFileCharacter: DazFileCharacter,
   DazFileModifier: DazFileModifier,
   // geometry
   DazGeometryRef: DazGeometryRef,
   DazGeometryInf: DazGeometry,
   // node
   DazNodeRef: DazNodeRef, // Renamed from DazNode
   DazNodeInf: DazNode, // Added DazNodeInf
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
