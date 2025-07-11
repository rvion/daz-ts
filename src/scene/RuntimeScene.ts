import chalk from 'chalk'
import GUI from 'lil-gui'
import * as THREE from 'three'
import { DsonFile, KnownDazFile } from '../core/DazFile.js'
import { DazGeometryDef } from '../core/DazGeometryDef.js'
import { DazModifierDef } from '../core/DazModifierDef.js'
import { DazNodeInst } from '../core/DazNodeInst.js'
import { DazMgr } from '../mgr.js'
import { $$modifier, dazId, string_DazUrl } from '../spec.js'
import { string_AbsPath, string_RelPath } from '../types.js'
import { bang } from '../utils/assert.js'
import { parseDazUrl } from '../utils/parseDazUrl.js'
import { CameraController } from '../web/CameraController.js'
import { RVFigure } from './RVFigure.js'
import { RVNode, RVNodeQuery } from './RVNode.js'
import {
   RVBone,
   RVCamera,
   RVGeometryInstance,
   RVLight,
   RVMaterialInstance,
   RVModifier,
   RVProp,
   RVUvSetInstance,
} from './RVTypes.js'

type KnownRVNodes = RVFigure | RVBone | RVCamera | RVLight | RVProp

type RVAddition = {
   file: KnownDazFile
   nodeMap: Map<string, RVNode>
   newTopLevelNodes: RVNode[]
   newNodesAttachedToExistingNodes: {
      node: RVNode
      attachedTo: RVNode
      at: string
   }[]
}

export class RuntimeScene extends RVNode {
   override emoji: string = '🎬'
   gui: GUI | null = null
   public sceneThree: THREE.Scene
   public camera: THREE.PerspectiveCamera
   public renderer?: THREE.WebGLRenderer
   public cameraController!: CameraController
   public selection: RVNode | null = null

   private animationId: number | null = null
   private isDisposed = false

   constructor(
      public mgr: DazMgr,
      width?: number,
      height?: number,
   ) {
      super(dazId`root`, '', '', 'RuntimeScene')
      this.sceneThree = this.object3d as THREE.Scene
      width = width ?? (typeof window !== 'undefined' ? window.innerWidth : 800)
      height = height ?? (typeof window !== 'undefined' ? window.innerHeight : 600)
      this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
      if (typeof window !== 'undefined') {
         this.renderer = new THREE.WebGLRenderer({ antialias: true })
      }

      this.setupScene()
      this.setupRenderer(width, height)
      this.setupCamera()
      this.setupLights()
      this.setupEventListeners()
      this.setupGui()
   }

   async loadFile(filepath: string) {
      const file = await this.mgr.loadFile(filepath)
      const summary = await file.addToScene(this)
      return {
         ...summary,
         get addedFigure_orCrash(): RVFigure {
            const figure = summary.newTopLevelNodes.find((n) => n instanceof RVFigure)
            if (!figure) throw new Error('No figure found in the loaded file')
            return figure
         },
      }
   }

   async addDazFileFromRelPath(relPath: string_RelPath): Promise<RVAddition> {
      return await this.mgr.loadFile(relPath).then((f) => this.addDazFile(f))
   }

   async addDazFileFromAbsPath(absPath: string_AbsPath): Promise<RVAddition> {
      return await this.mgr.loadFileFromAbsPath(absPath).then((f) => this.addDazFile(f))
   }

   async addDazFile(file: DsonFile): Promise<RVAddition> {
      const scene = file.data.scene
      const nodeMap = new Map<string, RVNode>()
      const newTopLevelNodes: RVNode[] = []
      const newNodesAttachedToExistingNodes: { node: RVNode; attachedTo: RVNode; at: string }[] = []

      if (!scene) {
         console.warn(`[❌] ${file.dazId} has no scene defined. nothing to add.`)
         return { nodeMap, newTopLevelNodes, newNodesAttachedToExistingNodes, file }
      }

      // Create all nodes
      for (const dNodeInst of file.sceneNodesList) {
         // parenting will be done right below once all nodes are created.
         const rvNode = await this.createRvNode(dNodeInst)
         if (rvNode) nodeMap.set(dNodeInst.dazId, rvNode)

         for (const dGeoInst of dNodeInst.geometries) {
            const dGeoDef: DazGeometryDef = await dGeoInst.resolveDef()
            const rvGeometry = new RVGeometryInstance(this, dGeoInst, dGeoDef)
            rvNode.addChild(rvGeometry)
            // console.log(`[🟢🟢🟢🟢🟢] ${rvGeometry.path}`)
            // if (rvGeometry) {
            //    rvNode.addChild(rvGeometry)
            //    nodeMap.set(geo.id, rvGeometry)
            // }
         }
      }

      // Parent the nodes
      for (const nodeInstance of file.sceneNodesList) {
         const rvNode = nodeMap.get(nodeInstance.dazId)
         if (!rvNode) continue

         const parentId = nodeInstance.parent?.asset_id
         // console.log(`[⁉️] parentId=${parentId} for ${nodeInstance.dazId}`)
         const parentNode = parentId ? (nodeMap.get(parentId) ?? this.findNodeById(parentId)) : this

         if (parentNode) {
            parentNode.addChild(rvNode)
            if (parentNode === this) newTopLevelNodes.push(rvNode)
            else newNodesAttachedToExistingNodes.push({ node: rvNode, attachedTo: parentNode, at: bang(parentId) })
         }
      }

      // Create and parent modifiers
      for (const dModInst of file.sceneModifiers.values()) {
         // console.log(`[⁉️] ${chalk.red(modifierInstance.url)}`)
         const dModDef: DazModifierDef = await dModInst.resolveDef()
         const parentUrl: string_DazUrl = bang(dModInst.data.parent ?? dModDef.data.parent)
         // const dazModifier = new DazModifier(this.mgr, file, modifierData)
         const rvModifier = new RVModifier(this, dModDef, dModInst)

         // console.log(`[⁉️] ${chalk.red(parentUrl)}`)
         // const parentNode = parentUrl ? nodeMap.get(parentUrl) : this
         let parentNode = this.findNodeByURL(parentUrl)
         if (parentNode == null) {
            console.log(chalk.red(`[⁉️] FAILURE to find ${parentUrl}`))
            console.log(`[⁉️] dModInst.data.parent=${dModInst.data.parent}`)
            console.log(`[⁉️]  dModDef.data.parent=${dModDef.data.parent}`)
            parentNode = this
         }
         parentNode?.addChild(rvModifier)
         nodeMap.set(dModInst.data.id, rvModifier)
         console.log(
            `➕ modifier id=${chalk.yellow(dModInst.data.id)} parent=${chalk.blue(parentUrl)} => ${parentNode?.dazId}(${parentNode?.uid_})`,
         )
      }

      // Create and parent materials
      for (const material of scene.materials ?? []) {
         const rvMaterial = new RVMaterialInstance(this, material)
         // Materials are parented to nodes, but the link is through geometry.
         // This needs more sophisticated handling. For now, add to scene root.
         this.addChild(rvMaterial)
         nodeMap.set(material.id, rvMaterial)
      }

      // Create and parent UV sets
      for (const uv of scene.uvs ?? []) {
         const rvUv = new RVUvSetInstance(this, uv)
         const parentNode = uv.parent ? nodeMap.get(uv.parent) : this
         parentNode?.addChild(rvUv)
         nodeMap.set(uv.id, rvUv)
      }

      this.refreshGui()
      return { nodeMap, newTopLevelNodes, newNodesAttachedToExistingNodes, file }
   }

   private async createRvNode(dNodeInst: DazNodeInst): Promise<KnownRVNodes> {
      const dNodeDef = await dNodeInst.resolveDef()
      if (dNodeDef.type === 'figure') return await new RVFigure(this, dNodeDef, dNodeInst).load()
      else if (dNodeDef.type === 'bone') return new RVBone(this, dNodeDef, dNodeInst)
      else if (dNodeDef.type === 'camera') return new RVCamera(this, dNodeDef, dNodeInst)
      else if (dNodeDef.type === 'light') return new RVLight(this, dNodeDef, dNodeInst)
      else if (dNodeDef.type === 'node') return new RVProp(this, dNodeDef, dNodeInst)
      else throw new Error(`Unsupported node type: ${dNodeDef.type} for ${dNodeInst.dazId}`)
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
         if (node instanceof RVMaterialInstance && !showMaterial) return // Skip materials if not requested
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
               `${node.channelValue ? `= ${node.channelValue}` : ''}`,
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

   setSelectedItem(node: RVNode | null): void {
      this.selection = node
      this.refreshGui()
   }

   private setupGui(): void {
      if (typeof window !== 'undefined') {
         this.gui = new GUI()
         this.gui.title('Scene Graph')
      }
   }

   private refreshGui(): void {
      if (!this.gui) return
      // Clear existing folders
      this.gui.children.forEach((c) => c.destroy())
      this.buildGuiNode(this, this.gui)
   }

   private buildGuiNode(rvNode: RVNode, parentGui: GUI): void {
      const folder = parentGui.addFolder(rvNode.object3d.name)
      folder.domElement.style.borderLeft = '2px solid #888'
      folder.domElement.style.marginLeft = '10px'

      // Add properties for the node itself
      if (rvNode instanceof RVModifier) {
         const mod: $$modifier = rvNode.dModDef.data
         // Assuming a 'value' property exists for demonstration
         if (mod.channel && 'current_value' in mod.channel) {
            folder.add(mod.channel, 'current_value').name('Value').listen()
         }
      }

      // Recursively add children
      for (const child of rvNode.children) {
         this.buildGuiNode(child, folder)
      }
   }

   private setupScene(): void {
      this.sceneThree.background = new THREE.Color(0x87ceeb) // Sky blue background
   }

   private setupRenderer(width: number, height: number): void {
      if (this.renderer) {
         if (typeof window !== 'undefined') {
            this.renderer.setPixelRatio(window.devicePixelRatio)
         }
         this.renderer.setSize(width, height)
         this.renderer.shadowMap.enabled = true
         this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      }
   }

   private setupCamera(): void {
      this.camera.position.set(0, 200, 200)
      this.camera.lookAt(0, 200, 0)
      if (typeof window !== 'undefined' && this.renderer) {
         this.cameraController = new CameraController(this.camera, this.renderer.domElement)
      }
   }

   private setupLights(): void {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      this.sceneThree.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 10, 7.5)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      this.sceneThree.add(directionalLight)
   }

   private setupEventListeners(): void {
      if (typeof window !== 'undefined') {
         window.addEventListener('resize', this.onWindowResize.bind(this))
      }
   }

   private onWindowResize(): void {
      if (this.isDisposed) return

      if (typeof window !== 'undefined') {
         this.camera.aspect = window.innerWidth / window.innerHeight
         this.camera.updateProjectionMatrix()
         this.renderer?.setSize(window.innerWidth, window.innerHeight)
      }
   }

   start(): void {
      if (this.isDisposed) return
      if (typeof document !== 'undefined') {
         const existingCanvas = document.querySelector('canvas')
         if (existingCanvas) {
            existingCanvas.remove()
         }
         if (this.renderer) {
            document.body.appendChild(this.renderer.domElement)
         }
      }
      this.animate()
   }

   private animate = (): void => {
      if (this.isDisposed) return
      this.animationId = requestAnimationFrame(this.animate)
      this.cameraController?.update()
      // Here you could add update logic for all RVNodes if needed
      this.renderer?.render(this.sceneThree, this.camera)
   }

   dispose(): void {
      if (this.isDisposed) return
      this.isDisposed = true

      if (this.animationId !== null) {
         cancelAnimationFrame(this.animationId)
         this.animationId = null
      }

      if (this.renderer && typeof document !== 'undefined' && document.body.contains(this.renderer.domElement)) {
         document.body.removeChild(this.renderer.domElement)
      }

      this.gui?.destroy()
      this.cameraController?.dispose()
      this.renderer?.dispose()

      if (typeof window !== 'undefined') {
         window.removeEventListener('resize', this.onWindowResize.bind(this))
      }
      console.log('✅ RuntimeScene disposed')
   }
}

type GraphPrintingConf = {
   showPath?: boolean
   showMaterial?: boolean
   maxDepth?: number
   /** default: true */
   emoji?: boolean
   /** default: true */
   colors?: boolean
   /** default: false */
   showName?: boolean
   /** default: true */
   showIndent?: boolean
}
