import type { PathInfo } from '../fs/PathInfo.js'
import { DazMgr } from '../mgr.js'
import { $$, $$dson, string_DazUrl } from '../spec.js'
import { check_orCrash } from '../utils/arkutils.js'
import { ASSERT_, bang } from '../utils/assert.js'
import { DsonFile } from './DazFile.js'

export class DazFilePose extends DsonFile {
   emoji = '👤'
   kind = 'character'

   static async init(mgr: DazMgr, meta: PathInfo, dson: $$dson): Promise<DazFilePose> {
      const json = await check_orCrash($$.dson_pose, dson, dson.asset_info.id)
      const self = new DazFilePose(mgr, meta, json)
      self.printHeader()
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
   get changes(): { url: string_DazUrl; value: number }[] | undefined {
      return this.data.scene?.animations?.map((x) => {
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
