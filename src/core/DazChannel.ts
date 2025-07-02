import { $$channel, string_DazId } from '../spec.js'
import { bang } from '../utils/assert.js'
import { AnyDazAbstraction, DazAbstraction } from './_DazAbstraction.js'

export class DazChannel extends DazAbstraction<AnyDazAbstraction, $$channel> {
   get emoji() { return '🧪' } // biome-ignore format: misc
   get kind() { return 'modifier' } // biome-ignore format: misc
   get dazId(): string_DazId { return bang(this.data.id) } // biome-ignore format: misc
}
