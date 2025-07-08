import type { PathInfo } from '../fs/PathInfo.js'
import {
   $$dson,
   $$material_instance,
   $$modifier,
   $$morph,
   $$node_instance,
   $$uv_set_instance,
   DazAssetType,
   string_DazId,
   string_DazUrl,
} from '../spec.js'
import type { Maybe, string_AbsPath, string_Ext, string_RelPath } from '../types.js'
import { ASSERT_, bang } from '../utils/assert.js'
import { fmtAbsPath } from '../utils/fmt.js'
import { DazAbstraction } from './_DazAbstraction.js'
import type { DazFileCharacter } from './DazFileCharacter.js'
import type { DazFileFigure } from './DazFileFigure.js'
import type { DazFileModifier } from './DazFileModifier.js'
import type { DazFilePose } from './DazFilePose.js'
import type { DazFileWearable } from './DazFileWearable.js'
import { DazGeometryDef } from './DazGeometryDef.js'
import { DazModifierDef } from './DazModifierDef.js'
import { DazModifierInst } from './DazModifierInst.js'
import { DazNodeDef } from './DazNodeDef.js'
import { DazNodeInst } from './DazNodeInst.js'

export type KnownDazFile = DazFileCharacter | DazFileWearable | DazFileFigure | DazFilePose | DazFileModifier

export abstract class DsonFile extends DazAbstraction<PathInfo, $$dson> {
   // #region --------------- scene nodes -----------------
   get sceneNodesList(): DazNodeInst[] {
      const value = Array.from(this.sceneNodes.values())
      Object.defineProperty(this, 'sceneNodesList', { value })
      return value
   }

   get sceneNodes(): Map<string_DazId, DazNodeInst> {
      const value = new Map<string_DazId, DazNodeInst>()
      const sceneNodes$: $$node_instance[] = this.data.scene?.nodes ?? []
      for (const item of sceneNodes$) value.set(item.id, new DazNodeInst(this.mgr, this, item))
      Object.defineProperty(this, 'sceneNodes', { value })
      return value
   }

   // #region --------------- scene uvs -----------------
   get sceneUvsList(): $$uv_set_instance[] {
      const value = Array.from(this.sceneUvs.values())
      Object.defineProperty(this, 'sceneUvsList', { value })
      return value
   }

   get sceneUvs(): Map<string_DazId, $$uv_set_instance> {
      const value = new Map<string_DazId, $$uv_set_instance>()
      for (const item of this.data.scene?.uvs ?? []) value.set(item.id, item)
      Object.defineProperty(this, 'sceneUvs', { value })
      return value
   }

   // #region --------------- scene modifiers -----------------
   get sceneModifiersList(): DazModifierInst[] {
      const value = Array.from(this.sceneModifiers.values())
      Object.defineProperty(this, 'sceneModifiersList', { value })
      return value
   }

   get sceneModifiers(): Map<string_DazId, DazModifierInst> {
      const value = new Map<string_DazId, DazModifierInst>()
      if (this.data.scene?.modifiers) {
         for (const item of this.data.scene.modifiers) {
            const node = new DazModifierInst(this.mgr, this, item)
            value.set(item.id, node)
         }
      }
      Object.defineProperty(this, 'sceneModifiers', { value })
      return value
   }

   // #region --------------- scene materials -----------------
   get sceneMaterialsList(): $$material_instance[] {
      const value = Array.from(this.sceneMaterials.values())
      Object.defineProperty(this, 'sceneMaterialsList', { value })
      return value
   }

   get sceneMaterials(): Map<string_DazId, $$material_instance> {
      const value = new Map<string_DazId, $$material_instance>()
      for (const item of this.data.scene?.materials ?? []) value.set(item.id, item)
      Object.defineProperty(this, 'sceneMaterials', { value })
      return value
   }

   // #region --------------- scene animations -----------------
   // get sceneAnimationsList(): $$channel_animation[] {
   //    const value = Array.from(this.sceneAnimations.values())
   //    Object.defineProperty(this, 'sceneAnimationsList', { value })
   //    return value
   // }

   // get sceneAnimations(): Map<string_DazId, $$channel_animation> {
   //    const value = new Map<string_DazId, $$channel_animation>()
   //    for (const item of this.data.scene?.animations ?? []) value.set(item.id, item)
   //    Object.defineProperty(this, 'sceneAnimations', { value })
   //    return value
   // }

   // #region --------------- Geometries -----------------------
   get geometryList(): DazGeometryDef[] {
      const value = [...this.geometries.values()]
      Object.defineProperty(this, 'geometryList', { value })
      return value
   }
   get geometries(): Map<string_DazId, DazGeometryDef> {
      const value = new Map<string_DazId, DazGeometryDef>()
      if (this.data.geometry_library) {
         for (const geometry$ of this.data.geometry_library) {
            const geometry = new DazGeometryDef(this.mgr, this, geometry$)
            value.set(geometry.dazId, geometry)
         }
      }
      Object.defineProperty(this, 'geometries', { value })
      return value
   }

   // #region --------------- Nodes -----------------------
   get nodeDefList(): DazNodeDef[] {
      const value = [...this.nodeDefMap.values()]
      Object.defineProperty(this, 'nodeDefList', { value })
      return value
   }
   get nodeDefMap(): Map<string_DazId, DazNodeDef> {
      const value = new Map<string_DazId, DazNodeDef>()
      if (this.data.node_library) {
         for (const node$ of this.data.node_library) {
            const node = new DazNodeDef(this.mgr, this, node$)
            value.set(node.dazId, node)
         }
      }
      Object.defineProperty(this, 'nodeDefMap', { value })
      return value
   }

   getNode_orNull(nodeId?: Maybe<string_DazId>): DazNodeDef | null {
      if (nodeId == null) return null
      return this.nodeDefMap.get(nodeId) ?? null
   }

   getNode_orCrash(nodeId?: Maybe<string_DazId>): DazNodeDef {
      if (nodeId == null) throw new Error(`Node ID is required to get node in ${this.kind} "${this.dazId}".`)
      const node = this.nodeDefMap.get(nodeId)
      if (node == null) throw new Error(`Node with ID "${nodeId}" not found in ${this.kind} "${this.dazId}".`)
      return node
   }

   // #region --------------- Modifiers -----------------------
   get modifierDefList(): DazModifierDef[] {
      const value = [...this.modifierDefMap.values()]
      Object.defineProperty(this, 'modifierDefList', { value })
      return value
   }
   get modifierDefMap(): Map<string_DazId, DazModifierDef> {
      const value = new Map<string_DazId, DazModifierDef>()
      if (this.data.modifier_library) {
         for (const modifier$ of this.data.modifier_library) {
            const modifier = new DazModifierDef(this.mgr, this, modifier$)
            value.set(modifier.dazId, modifier)
         }
      }
      Object.defineProperty(this, 'modifierDefMap', { value })
      return value
   }

   // #region morpth
   /** returns the first morph modifier */
   getMorphModifier(): $$morph | null {
      ASSERT_(this.modifierDefMap.size <= 1, 'too many modifiers in file; possibly wrong')
      if (this.modifierDefMap.size === 0) return null
      const firstModifier = bang(this.modifierDefList[0])
      return firstModifier.data.morph ?? null
   }
   getFirstAndOnlyModifier_orCrash(): $$modifier | null {
      ASSERT_(this.modifierDefMap.size <= 1, 'too many modifiers in file; possibly wrong')
      if (this.modifierDefMap.size === 0) return null
      const firstModifier = bang(this.modifierDefList[0])
      return firstModifier.data
   }

   // #region skin data
   hasSkinData(): boolean {
      const skinModifier = this.getSkinBindingModifier()
      return !!(skinModifier?.skin?.joints && skinModifier.skin.joints.length > 0)
   }

   /** returns the first skin binding modifier */
   getSkinBindingModifier(): $$modifier | null {
      for (const modifier of this.modifierDefMap.values()) {
         if (modifier.data.id === 'SkinBinding' || modifier.data.name === 'SkinBinding') {
            return modifier.data
         }
      }
      return null
   }

   // #region ---- main properties
   get dazId(): string_DazUrl { return this.data.asset_info.id } // biome-ignore format: misc
   get assetType(): DazAssetType { return this.data.asset_info.type ?? 'unknown' } // biome-ignore format: misc

   // #region ---- paths
   get absPath(): string_AbsPath { return this.source.absPath } // biome-ignore format: misc
   get relPath(): string_RelPath { return this.source.relPath } // biome-ignore format: misc
   get fileExt(): string_Ext { return this.source.fileExt } // biome-ignore format: misc
   get rootDir(): string { return this.source.rootDir } // biome-ignore format: misc
   get dazId_nice(): string { return this.dazId.replaceAll('%20', ' ') } // biome-ignore format: misc

   // #region ---- print methods
   override printHeader(): void {
      // console.log(`[${this.emoji} ${this.assetType} #${fmtDazId(this.dazId)}] ${fmtAbsPath(this.absPath)} `)
      console.log(`[${this.emoji}] ${this.assetType.padEnd(10)} ${fmtAbsPath(this.absPath)}`)
   }
}
