import { DazMgr } from '../mgr.js'
import { $$ } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { fmtDazUrl } from '../utils/fmt.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DsonFile.js'

export class DazWearable extends DsonFile {
   dson: typeof $$.duf_wearable.infer

   constructor(mgr: DazMgr, meta: FileMeta, dson: typeof $$.dson.infer) {
      super(mgr, meta, dson) // base dson
      mgr.wearablesByDazId.set(this.dazId, this) // register
      mgr.wearablesByRelPath.set(this.relPath, this) // register
      this.dson = check_orCrash($$.duf_wearable, dson, this.dazId)

      // instanciate nodes
      this.dson.scene.nodes.forEach((nodeData) => this.hydrateNode(nodeData))

      // print char infos
      this.printHeader()
      console.log(`  nodes: ${[...this.nodes.keys()]}`)

      const geometryUrls = new Set<string>()
      this.dson.scene.nodes.forEach((node) => {
         node.geometries?.forEach((geo) => {
            if (geo.url) geometryUrls.add(geo.url)
         })
      })
      console.log(`  urls: ${[...geometryUrls].map(fmtDazUrl).join(', ')}`)
   }
}
