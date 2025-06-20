import { DazNode } from '../core/DazNode.js'
import { DazMgr } from '../mgr.js'
import { $$ } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { fmtDazUrl } from '../utils/fmt.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DazFile.js'

export class DazCharacter extends DsonFile {
   dson: typeof $$.duf_character.infer

   // instanciated data
   nodes: Map<string, DazNode> = new Map()

   constructor(
      public mgr: DazMgr,
      public meta: FileMeta,
      dson: typeof $$.dson.infer,
   ) {
      super(meta, dson) // base dson
      mgr.charactersByDazId.set(this.dazId, this) // register
      mgr.charactersByRelPath.set(this.relPath, this) // register
      this.dson = check_orCrash($$.duf_wearable, dson, this.dazId)

      // instanciate nodes
      this.dson.scene.nodes.forEach((node) => {
         this.nodes.set(node.id, new DazNode(mgr, this, node))
      })

      // print wearable infos
      this.printHeader()
      console.log(`  nodes: ${[...this.nodes.keys()]}`)

      // get geoURL
      const geometryUrls = new Set<string>()
      this.dson.scene.nodes.forEach((node) => {
         node.geometries?.forEach((geo) => {
            if (geo.url) geometryUrls.add(geo.url)
         })
      })

      console.log(`  urls: `)
      for (const url of geometryUrls.values()) console.log(`  - ${fmtDazUrl(url)}`)
   }
}
