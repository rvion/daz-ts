import GUI from 'lil-gui'
import * as THREE from 'three'
import { DsonFile } from '../core/DazFile.js'
import { DazNodeInstance } from '../core/DazNodeInstance.js'
import { DazMgr } from '../mgr.js'
import { CameraController } from '../web/CameraController.js'
import { RVFigure } from './RVFigure.js'
import { RVNode } from './RVNode.js'
import {
   RVBone,
   RVCamera,
   RVLight,
   RVMaterialInstance,
   RVModifierInstance,
   RVProp,
   RVUvSetInstance,
} from './RVTypes.js'

export class RuntimeScene extends RVNode {
   gui: GUI | null = null
   public scene: THREE.Scene
   public camera: THREE.PerspectiveCamera
   public renderer?: THREE.WebGLRenderer
   public cameraController!: CameraController
   public selection: RVNode | null = null

   private animationId: number | null = null
   private isDisposed = false

   constructor(
      //
      public mgr: DazMgr,
      width?: number,
      height?: number,
   ) {
      super(undefined, 'RuntimeScene')
      this.scene = this.object3d as THREE.Scene
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

   async addDazFile(file: DsonFile): Promise<{
      nodeMap: Map<string, RVNode>
      newTopLevelNodes: RVNode[]
      newNodesAttachedToExistingNodes: { node: RVNode; attachedTo: RVNode; at: string }[]
   }> {
      const scene = file.data.scene
      const nodeMap = new Map<string, RVNode>()
      const newTopLevelNodes: RVNode[] = []
      const newNodesAttachedToExistingNodes: { node: RVNode; attachedTo: RVNode; at: string }[] = []

      if (!scene) {
         return { nodeMap, newTopLevelNodes, newNodesAttachedToExistingNodes }
      }

      // Create all nodes
      for (const nodeInstance of file.sceneNodesList) {
         const rvNode = await this.createRvNode(nodeInstance)
         if (rvNode) {
            nodeMap.set(nodeInstance.dazId, rvNode)
         }
      }

      // Parent the nodes
      for (const nodeInstance of file.sceneNodesList) {
         const rvNode = nodeMap.get(nodeInstance.dazId)
         if (!rvNode) continue

         const parentId = nodeInstance.parent?.asset_id
         const parentNode = parentId ? (nodeMap.get(parentId) ?? this.findNodeById(parentId)) : this

         if (parentNode) {
            parentNode.add(rvNode)
            if (parentNode === this) {
               newTopLevelNodes.push(rvNode)
            } else {
               newNodesAttachedToExistingNodes.push({
                  node: rvNode,
                  attachedTo: parentNode,
                  at: parentId!,
               })
            }
         }
      }

      // Create and parent modifiers
      for (const modifier of scene.modifiers ?? []) {
         const rvModifier = new RVModifierInstance(modifier)
         const parentNode = modifier.parent ? nodeMap.get(modifier.parent) : this
         parentNode?.add(rvModifier)
         nodeMap.set(modifier.id, rvModifier)
      }

      // Create and parent materials
      for (const material of scene.materials ?? []) {
         const rvMaterial = new RVMaterialInstance(material)
         // Materials are parented to nodes, but the link is through geometry.
         // This needs more sophisticated handling. For now, add to scene root.
         this.add(rvMaterial)
         nodeMap.set(material.id, rvMaterial)
      }

      // Create and parent UV sets
      for (const uv of scene.uvs ?? []) {
         const rvUv = new RVUvSetInstance(uv)
         const parentNode = uv.parent ? nodeMap.get(uv.parent) : this
         parentNode?.add(rvUv)
         nodeMap.set(uv.id, rvUv)
      }

      this.refreshGui()
      return { nodeMap, newTopLevelNodes, newNodesAttachedToExistingNodes }
   }

   private async createRvNode(nodeInstance: DazNodeInstance): Promise<RVNode | null> {
      const node = await nodeInstance.resolve()
      if (!node) {
         return null
      }
      switch (node.type) {
         case 'figure':
            return await new RVFigure(nodeInstance).load()
         case 'bone':
            return new RVBone(nodeInstance)
         case 'camera':
            return new RVCamera(nodeInstance)
         case 'light':
            return new RVLight(nodeInstance)
         case 'node':
            return new RVProp(nodeInstance)
         default:
            return null
      }
   }

   findNodeById(id: string): RVNode | undefined {
      const traverse = (node: RVNode): RVNode | undefined => {
         if (node.dazId === id) {
            return node
         }
         for (const child of node.children) {
            const found = traverse(child)
            if (found) {
               return found
            }
         }
         return undefined
      }
      return traverse(this)
   }

   getSceneGraphAsString(): string {
      const lines: string[] = []
      const traverse = (node: RVNode, depth = 0) => {
         const indent = '  '.repeat(depth)
         lines.push(`${indent}- ${node.object3d.name} (${node.constructor.name})`)
         for (const child of node.children) {
            traverse(child, depth + 1)
         }
      }
      traverse(this)
      return lines.join('\n')
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
      if (rvNode instanceof RVModifierInstance) {
         const mod = rvNode.data as any
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
      this.scene.background = new THREE.Color(0x87ceeb) // Sky blue background
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
      this.scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 10, 7.5)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      this.scene.add(directionalLight)
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
      this.renderer?.render(this.scene, this.camera)
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
