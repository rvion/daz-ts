import type { PathInfo } from '../fs/PathInfo.js'
import type { RuntimeScene } from '../scene/RuntimeScene.js'
import type { AddToSceneSummary } from '../scene/RVTypes.js'
import {
   $$dson,
   $$material_instance,
   $$modifier,
   $$modifier_instance,
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
import { DazGeometry } from './DazGeometry.js'
import { DazModifier } from './DazModifier.js'
import { DazNode } from './DazNode.js'
import { DazNodeInstance } from './DazNodeInstance.js'

export type KnownDazFile = DazFileCharacter | DazFileWearable | DazFileFigure | DazFilePose | DazFileModifier

export abstract class DsonFile extends DazAbstraction<PathInfo, $$dson> {
   public async addToScene(runtimeScene: RuntimeScene): Promise<AddToSceneSummary> {
      const summary: AddToSceneSummary = {
         newTopLevelNodes: [],
         newNodesAttachedToExistingNodes: [],
      }
      const scene = this.data.scene
      if (!scene) {
         return summary
      }

      const { newTopLevelNodes, newNodesAttachedToExistingNodes } = await runtimeScene.addDazFile(this)

      summary.newTopLevelNodes.push(...newTopLevelNodes)
      summary.newNodesAttachedToExistingNodes.push(...newNodesAttachedToExistingNodes)

      return summary
   }
   // #region --------------- scene nodes -----------------
   get sceneNodesList(): DazNodeInstance[] {
      const value = Array.from(this.sceneNodes.values())
      Object.defineProperty(this, 'sceneNodesList', { value })
      return value
   }

   get sceneNodes(): Map<string_DazId, DazNodeInstance> {
      const value = new Map<string_DazId, DazNodeInstance>()
      const sceneNodes$: $$node_instance[] = this.data.scene?.nodes ?? []
      for (const item of sceneNodes$) value.set(item.id, new DazNodeInstance(this.mgr, this, item))
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
   get sceneModifiersList(): $$modifier_instance[] {
      const value = Array.from(this.sceneModifiers.values())
      Object.defineProperty(this, 'sceneModifiersList', { value })
      return value
   }

   get sceneModifiers(): Map<string_DazId, $$modifier_instance> {
      const value = new Map<string_DazId, $$modifier_instance>()
      for (const item of this.data.scene?.modifiers ?? []) value.set(item.id, item)
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
   get geometryList(): DazGeometry[] {
      const value = [...this.geometries.values()]
      Object.defineProperty(this, 'geometryList', { value })
      return value
   }
   get geometries(): Map<string_DazId, DazGeometry> {
      const value = new Map<string_DazId, DazGeometry>()
      if (this.data.geometry_library) {
         for (const geometry$ of this.data.geometry_library) {
            const geometry = new DazGeometry(this.mgr, this, geometry$)
            value.set(geometry.dazId, geometry)
         }
      }
      Object.defineProperty(this, 'geometries', { value })
      return value
   }

   // #region --------------- Nodes -----------------------
   get nodeList(): DazNode[] {
      const value = [...this.nodes.values()]
      Object.defineProperty(this, 'nodeList', { value })
      return value
   }
   get nodes(): Map<string_DazId, DazNode> {
      const value = new Map<string_DazId, DazNode>()
      if (this.data.node_library) {
         for (const node$ of this.data.node_library) {
            const node = new DazNode(this.mgr, this, node$)
            value.set(node.dazId, node)
         }
      }
      Object.defineProperty(this, 'nodes', { value })
      return value
   }

   getNode_orNull(nodeId?: Maybe<string_DazId>): DazNode | null {
      if (nodeId == null) return null
      return this.nodes.get(nodeId) ?? null
   }

   getNode_orCrash(nodeId?: Maybe<string_DazId>): DazNode {
      if (nodeId == null) throw new Error(`Node ID is required to get node in ${this.kind} "${this.dazId}".`)
      const node = this.nodes.get(nodeId)
      if (node == null) throw new Error(`Node with ID "${nodeId}" not found in ${this.kind} "${this.dazId}".`)
      return node
   }

   // #region --------------- Modifiers -----------------------
   get modifierList(): DazModifier[] {
      const value = [...this.modifiers.values()]
      Object.defineProperty(this, 'modifierList', { value })
      return value
   }
   get modifiers(): Map<string_DazId, DazModifier> {
      const value = new Map<string_DazId, DazModifier>()
      if (this.data.modifier_library) {
         for (const modifier$ of this.data.modifier_library) {
            const modifier = new DazModifier(this.mgr, this, modifier$)
            value.set(modifier.dazId, modifier)
         }
      }
      Object.defineProperty(this, 'modifiers', { value })
      return value
   }

   // #region morpth
   /** returns the first morph modifier */
   getMorphModifier(): $$morph | null {
      ASSERT_(this.modifiers.size <= 1, 'too many modifiers in file; possibly wrong')
      if (this.modifiers.size === 0) return null
      const firstModifier = bang(this.modifierList[0])
      return firstModifier.data.morph ?? null
   }
   getFirstAndOnlyModifier_orCrash(): $$modifier | null {
      ASSERT_(this.modifiers.size <= 1, 'too many modifiers in file; possibly wrong')
      if (this.modifiers.size === 0) return null
      const firstModifier = bang(this.modifierList[0])
      return firstModifier.data
   }

   // #region skin data
   hasSkinData(): boolean {
      const skinModifier = this.getSkinBindingModifier()
      return !!(skinModifier?.skin?.joints && skinModifier.skin.joints.length > 0)
   }

   /** returns the first skin binding modifier */
   getSkinBindingModifier(): $$modifier | null {
      for (const modifier of this.modifiers.values()) {
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
