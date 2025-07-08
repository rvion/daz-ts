import { $$any_channel, $$channel } from '../spec.js'
import { RVScene } from './RVScene.js'

export class RVChannel /* extends RVNode */ {
   // override emoji: string = '📡'
   // this is where the RV... store the actual value
   value: unknown

   get type(): $$channel['type'] {
      return this.data.type
   }
   // TODO: this should be a getter to retrieve the default value,
   // not some overridable method
   /** @deprecated */
   // override get debugProperties(): string {
   //    return `${this.value}`
   // }
   getChannelValue(): unknown {
      if (this.data.type === 'float') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'bool') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'int') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'color') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'enum') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'float_color') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'file') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'string') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'image') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'ok') return this.data.value ?? this.data.current_value
      else if (this.data.type === 'alias') return `🔴REF:${this.data.target_channel}`
      else return '❓'
   }

   constructor(
      public readonly sceneDaz: RVScene,
      public readonly data: $$any_channel,
   ) {
      // super(data.id, '🔴⁉️', '🔴⁉️', data.id)
      this.value = this.getChannelValue()
   }
}
