import { DazMgr } from '../mgr.js'
import { $$, $$dson, $$dson_pose } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { ASSERT_, bang } from '../utils/assert.js'
import { FileMeta } from '../walk.js'
import { DsonFile } from './_DsonFile.js'

export class DazFilePose extends DsonFile<$$dson_pose> {
   emoji = '👤'
   kind = 'character'

   static async init(mgr: DazMgr, meta: FileMeta, dson: $$dson): Promise<DazFilePose> {
      const json = check_orCrash($$.dson_pose, dson, dson.asset_info.id)
      const self = new DazFilePose(mgr, meta, json)
      self.printHeader()
      mgr.poseByDazId.set(self.dazId, self)
      mgr.poseByRelPath.set(self.relPath, self)

      // init
      // todo
      return self
   }

   // "scene" : {
   // "animations" : [
   // 	{
   // 		"url" : "name://@selection/l_bigtoe2:?rotation/x/value",
   // 		"keys" : [ [ 0, 0 ] ]
   // 	},
   // 	{
   // 		"url" : "name://@selection/l_bigtoe2:?rotation/y/value",
   // 		"keys" : [ [ 0, 0 ] ]
   // 	},
   // ...
   get changes() {
      return this.data.scene.animations.map((x) => {
         const fst = bang(x.keys[0])
         const [at, value] = fst
         ASSERT_(at === 0, `Expected first key time to be 0, got ${at} for ${x.url}`)
         return {
            url: x.url,
            value: value,
         }
      })
   }
}
