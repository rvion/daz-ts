/** biome-ignore-all lint/complexity/useLiteralKeys: fts */
import chalk from 'chalk'
import { nanoid } from 'nanoid'
import * as THREE from 'three'
import { GLOBAL } from '../DI.js'
import { $$node, string_DazId, string_DazUrl } from '../spec.js'
import { Maybe, string_RelPath } from '../types.js'
import { assertXYZChanels, bang } from '../utils/assert.js'
import { parseDazUrl } from '../utils/parseDazUrl.js'
import { GraphPrintingConf, RuntimeScene } from './RuntimeScene.js'
import { RVChannel } from './RVChannel.js'

export type RVNodeQuery = {
   id?: Maybe<string_DazId>
   instPath?: Maybe<string_RelPath>
   defPath?: Maybe<string_RelPath>
}

/**
 * Base class for a runtime node in the scene graph.
 * Each RVNode wraps a THREE.Object3D to integrate with the three.js renderer,
 * and maintains its own parent/child hierarchy.
 */
export abstract class RVNode {
   uid_ = nanoid(4)
   readonly emoji: string = '❓'
   public object3d: THREE.Object3D
   public readonly children: RVNode[] = []
   public parent?: RVNode
   abstract sceneDaz: RuntimeScene

   /**
    * Called after the node is created and parented in the scene graph.
    * Subclasses should override this to perform any specific loading logic,
    * such as building meshes or skeletons.
    */
   async load(): Promise<this> {
      return this
   }

   setupNodeChannels(data: $$node): void {
      // 'center_point?': 'any_channel[]
      if (data.center_point) {
         assertXYZChanels(data.center_point)
         this.channels['center_point/x'] = new RVChannel(this.sceneDaz, bang(data.center_point[0]))
         this.channels['center_point/y'] = new RVChannel(this.sceneDaz, bang(data.center_point[1]))
         this.channels['center_point/z'] = new RVChannel(this.sceneDaz, bang(data.center_point[2]))
      }
      // 'end_point?': 'any_channel[]
      if (data.end_point) {
         assertXYZChanels(data.end_point)
         this.channels['end_point/x'] = new RVChannel(this.sceneDaz, bang(data.end_point[0]))
         this.channels['end_point/y'] = new RVChannel(this.sceneDaz, bang(data.end_point[1]))
         this.channels['end_point/z'] = new RVChannel(this.sceneDaz, bang(data.end_point[2]))
      }
      // 'orientation?': 'any_channel[]
      if (data.orientation) {
         assertXYZChanels(data.orientation)
         this.channels['orientation/x'] = new RVChannel(this.sceneDaz, bang(data.orientation[0]))
         this.channels['orientation/y'] = new RVChannel(this.sceneDaz, bang(data.orientation[1]))
         this.channels['orientation/z'] = new RVChannel(this.sceneDaz, bang(data.orientation[2]))
      }
      // 'rotation?': 'any_channel[]
      if (data.rotation) {
         assertXYZChanels(data.rotation)
         this.channels['rotation/x'] = new RVChannel(this.sceneDaz, bang(data.rotation[0]))
         this.channels['rotation/y'] = new RVChannel(this.sceneDaz, bang(data.rotation[1]))
         this.channels['rotation/z'] = new RVChannel(this.sceneDaz, bang(data.rotation[2]))
      }
      // 'translation?': 'any_channel[]
      if (data.translation) {
         assertXYZChanels(data.translation)
         this.channels['translation/x'] = new RVChannel(this.sceneDaz, bang(data.translation[0]))
         this.channels['translation/y'] = new RVChannel(this.sceneDaz, bang(data.translation[1]))
         this.channels['translation/z'] = new RVChannel(this.sceneDaz, bang(data.translation[2]))
      }
      // 'scale?': 'any_channel[]
      if (data.scale) {
         this.channels['scale/x'] = new RVChannel(this.sceneDaz, bang(data.scale[0]))
         this.channels['scale/y'] = new RVChannel(this.sceneDaz, bang(data.scale[1]))
         this.channels['scale/z'] = new RVChannel(this.sceneDaz, bang(data.scale[2]))
      }
      // 'general_scale?': 'any_channel',
      if (data.general_scale) {
         this.channels['general_scale'] = new RVChannel(this.sceneDaz, bang(data.general_scale))
      }
   }

   setValueAtUrl(url: string_DazUrl, value: unknown): void {
      const res = parseDazUrl(url)
      const node = bang(this.findNodeByURL(url))
      node.setPropertyValue(res.property_path, value)
   }

   getValueFromUrl(url: string_DazUrl): unknown {
      const res = parseDazUrl(url)
      const node = this.findNodeByURL(url)
      const value = node?.getPropertyValue(res.property_path)
      console.log(`[getValueFromUrl()] node ${url}`, node?.constructor.name, node?.path, `= ${value}`)
      if (!res.node_path) throw new Error(`[RVFigure] ❌ Invalid URL: ${url} - missing node_path`)
      return value
   }

   /** lazily initialized record of property channels */
   get channels(): Record<string, RVChannel> {
      const value: Record<string, RVChannel> = {}
      Object.defineProperty(this, 'channels', { value })
      return value
   }

   setPropertyValue(propertyPath: Maybe<string>, value: unknown): void {
      if (!propertyPath) throw new Error(`propertyPath is required for ${this.constructor.name}`)
      const channel = this.channels[propertyPath]
      if (!channel) throw new Error(`[RVNode] ❌ No channel found for propertyPath: ${propertyPath} in ${this.constructor.name}`) // biome-ignore format: misc
      channel.value = value
   }
   getPropertyValue(propertyPath: Maybe<string>): unknown {
      if (!propertyPath) throw new Error(`propertyPath is required for ${this.constructor.name}`)
      const channel = this.channels[propertyPath]
      if (!channel) throw new Error(`[RVNode] ❌ No channel found for propertyPath: ${propertyPath} in ${this.constructor.name}`) // biome-ignore format: misc
      return channel.value
   }

   get debugProperties(): unknown {
      // properties are named like center_point/x, or rotation/y
      // we need to make this debug as dense as property to not spam the console
      if (Object.keys(this.channels).length === 0) return undefined

      const entries = Object.entries(this.channels)
      const groupped = entries.reduce(
         (acc, [key, channel]) => {
            const [group, prop] = key.split('/')
            if (!acc[group]) acc[group] = {}
            acc[group][prop] = channel
            return acc
         },
         {} as Record<string, Record<string, RVChannel>>,
      )

      function fmtValue(value: unknown): string {
         if (typeof value === 'number') return value.toFixed(1)
         if (typeof value === 'string') return `"${value}"`
         return String(value)
      }

      return `${Object.entries(groupped)
         .map(([k, v]) => {
            const category = k
               .replace(/_point$/, '')
               .replace(`center`, 'cnt')
               .replace('rotation', 'rot')
               .replace('orientation', 'ort')
               .replace('translation', 'trs')
            const keys = Object.keys(v)
            const isXYZ = keys[0] === 'x' && keys[1] === 'y' && keys[2] === 'z'
            if (isXYZ) {
               const values = keys.map((k2) => v[k2].value)
               const isOnly0 = values.length === 3 && values.every((v2) => v2 === 0)
               if (isOnly0) return `${category}(0*)`
               return `${category}(${values.map(fmtValue).join(',')})`
            }
            return `${category}(${Object.entries(v)
               .map(([k2, v2]) => `${k2}=${fmtValue(v2.value)}`)
               .join(',')})`
         })
         .join(', ')}`
   }

   constructor(
      public readonly dazId: string_DazId,
      public readonly dazInstPath: string_RelPath,
      public readonly dazDefPath: string_RelPath,
      name: string,
   ) {
      this.object3d = new THREE.Object3D()
      this.object3d.name = name || dazId || 'RVNode'
   }

   match(q: RVNodeQuery): boolean {
      if (q.id && this.dazId !== q.id) return false
      if (q.instPath && this.dazInstPath !== q.instPath) return false
      if (q.defPath && this.dazDefPath !== q.defPath) return false
      return true
   }

   /** Adds a child node to this node. */
   addChild(child: RVNode) {
      if (child.parent) child.parent.removeChild(child)
      this.children.push(child)
      child.parent = this
      this.object3d.add(child.object3d)
   }

   /** Removes a child node from this node. */
   removeChild(child: RVNode) {
      const index = this.children.indexOf(child)
      if (index > -1) {
         this.children.splice(index, 1)
         child.parent = undefined
         this.object3d.remove(child.object3d)
      }
   }

   get path(): string {
      const parentPath = this.parent?.path ?? ''
      return `${parentPath}/${this.dazId}`
   }

   findNodeByURL(url: string_DazUrl): RVNode | undefined {
      const parts = parseDazUrl(url)
      const q: RVNodeQuery = {
         id: parts.asset_id,
         defPath: parts.file_path,
      }
      return this.findNode(q)
   }

   findNode(q: RVNodeQuery): RVNode | undefined {
      // console.log(`[🤠] query: ${JSON.stringify(q)}`)
      const traverse = (node: RVNode): RVNode | undefined => {
         const isMatching = node.match(q)
         // console.log(` node {${node.dazId} ! ${node.dazDefPath}} matches? ${isMatching ? '🟢' : '❌'}`)
         if (isMatching) return node
         for (const child of node.children) {
            const found = traverse(child)
            if (found) return found
         }
         return undefined
      }
      return traverse(this)
   }

   findNodeById(id: string): RVNode | undefined {
      const traverse = (node: RVNode): RVNode | undefined => {
         if (node.dazId === id) return node
         for (const child of node.children) {
            const found = traverse(child)
            if (found) return found
         }
         return undefined
      }
      return traverse(this)
   }

   getSceneGraphAsString_simple = (p: GraphPrintingConf = {}) =>
      this.getSceneGraphAsString({ maxDepth: 3, emoji: true, showMaterial: false, ...p })

   getSceneGraphAsString(p: GraphPrintingConf = {}): string[] {
      const lines: string[] = []
      const {
         showPath = false,
         showMaterial = false,
         maxDepth = Infinity,
         emoji,
         colors = false, // Default to true for colors
         showName = false,
         showIndent = true,
      } = p
      const traverse = (node: RVNode, depth = 0) => {
         if (depth > maxDepth) return
         if (node instanceof GLOBAL.RVMaterialInstance && !showMaterial) return // Skip materials if not requested
         let indent = '   '.repeat(depth)
         if (colors) indent = chalk.gray.dim(indent)
         let id: string = node.dazId
         let path: string = node.dazDefPath
         if (colors) id = chalk.red(id)
         if (colors) path = chalk.blue(path)
         lines.push(
            [
               showIndent ? indent : '',
               `${emoji ? `${node.emoji}` : ''}`,
               showPath ? path : '',
               `#${id}`,
               showName ? `${node.object3d.name}` : '',
               !emoji ? `(${node.constructor.name})` : '',
               `${node.debugProperties ? `= ${node.debugProperties}` : ''}`,
            ]
               .filter(Boolean)
               .join(' '),
         )
         for (const child of node.children) {
            traverse(child, depth + 1)
         }
      }
      traverse(this)
      return lines
   }
}
