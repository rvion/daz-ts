src/scene/RuntimeScene.ts:117-134
```
      // Create all nodes
      for (const dNodeInst of file.sceneNodesList) {
         // parenting will be done right below once all nodes are created.
         const rvNode = await this.createRvNode(dNodeInst)
         console.log(`[🤠] created ${rvNode.dNodeDef.type} ${dNodeInst.dazId}`)
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
```

when loading `/Volumes/ssd4t1/daz-lib/People/Genesis 9/Genesis 9.duf`
it resolves `/Volumes/ssd4t1/daz-lib/data/Daz 3D/Genesis 9/Base/Genesis9.dsf`
and load a bunch of nodes.

It starts with  RVFigure then a bunch of bones for it :

```
[🤠] created figure Genesis9
RuntimeScene.ts:121 [🤠] created bone hip
RuntimeScene.ts:121 [🤠] created bone pelvis
RuntimeScene.ts:121 [🤠] created bone l_thigh
...

```

but there is a bug. the rvfigure previously had a custom  load method.
I think this load method should no longer be called directly, but every node RVNode added should have some kind of load method that should be called in reversed addition order. It would make the RVFigure load its skeletton at the end of the file loading, and so it could find it's bone using it's children property rather than having a whole bunch of specific code to build those. This amongst other things will allow to move the threejs bone instance to the RVBone instance too and not have everything duplicated in RVFIgure.

src/scene/RVFigure.ts:46-56
```
async load(): Promise<this> {
   await this.buildSkeleton()
   await this.buildMeshes()

   ASSERT_(this.skeleton != null, 'skeleton should not be null after buildSkeleton')
   ASSERT_(this.skeletonHelper != null, 'skeletonHelper should not be null after buildSkeleton')

   // Initial skeleton matrix update to ensure proper display
   this.updateSkeletonMatrices()
   return this
}
```