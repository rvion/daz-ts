import { scope, type } from 'arktype'

export type DazAssetType = (typeof dazAssetTypes)[number]
export const dazAssetTypes = [
   // extra
   'unknown',
   // known
   'animation',
   'camera',
   'character',
   'clothing',
   'environment',
   'figure',
   'hair',
   'light',
   'material',
   'modifier',
   'morph',
   'pose',
   'preset_dform',
   'preset_hierarchical_material',
   'preset_hierarchical_pose',
   'preset_layered_image',
   'preset_layered_image',
   'preset_light',
   'preset_material',
   'preset_pose',
   'preset_render_settings',
   'preset_shader',
   'preset_simulation_settings',
   'prop',
   'scene_subset',
   'scene',
   'script',
   'shader',
   'utility',
   'uv_set',
   'wearable',
] as const

const knownType = type.enumerated(...dazAssetTypes)

export const $ = scope({
   duf: {
      file_version: 'string',
      asset_info: 'asset_info',
   },
   asset_info: {
      '+': 'reject',
      id: 'string',
      type: knownType,
      contributor: 'contributor',
      revision: 'string',
      modified: 'string',
   },
   contributor: {
      '+': 'reject',
      author: 'string',
      email: 'string',
      website: 'string',
   },
   image_map: () =>
      $.type({
         '+': 'reject',
         'url?': 'string', // "/Runtime/Textures/DAZ/Characters/Genesis9/Base/Eyes/Split/Genesis9_Eyes_Iris_01.png",
         label: 'string', // "Iris",
         'active?': 'boolean', // true,
         'color?': ['number', 'number', 'number'], // [ 0, 0, 0 ],
         'transparency?': 'number', // 1,
         'invert?': 'boolean', // false,
         'rotation?': 'number', // 0,
         'xmirror?': 'boolean', // false,
         'ymirror?': 'boolean', // false,
         'xscale?': 'number', // 1,
         'yscale?': 'number', // 1,
         'xoffset?': 'number', // 0,
         'yoffset?': 'number', // 0,
         'operation?': "'blend_source_over'", // "blend_source_over"
      }),
   scene_node_geometry: () =>
      $.type({
         '+': 'reject',
         // "Genesis9-1",
         id: 'string',
         // "name://@selection#geometries/Genesis9:"
         url: 'string',
      }),
   scene_node: () =>
      $.type({
         '+': 'reject',
         //  "Genesis9",
         id: 'string',
         //  "name://@selection/Genesis9:",
         url: 'string',
         geometries: $.type('scene_node_geometry').array(),
      }),
   chanelType: type.enumerated('bool', 'enum', 'int', 'float', 'node', 'string'),
   presentation: {
      '+': 'reject',
      'type?': 'string',
      'label?': 'string',
      'description?': 'string',
      'icon_large?': 'string',
      'colors?': type({}),
   },
   chanel: {
      '+': 'reject',
      'id?': 'string',
      'type?': 'chanelType',
      'label?': 'string',
      'enum_values?': 'unknown[]',
      'visible?': 'boolean',
      'value?': 'unknown',
      'current_value?': 'unknown',
      'min?': 'number',
      'max?': 'number',
      'clamped?': 'boolean',
      'step_size?': 'number',
      'group?': 'string',
      'invalid_without_map?': 'boolean',
      'display_as_percent?': 'boolean',
      'default_image_gamma?': 'number',
      'mappable?': 'boolean',
      'presentation?': 'presentation',
      // ?
      'channel?': 'chanel',
   },
   modifier_library: () =>
      $.type({
         '+': 'reject',
         id: 'string',
         'name?': 'string',
         'parent?': 'string',
         'extra?': type({
            '+': 'reject',
            'type?': 'string',
            'push_post_smooth?': 'boolean',
            'channels?': () => $.type('chanel').array(),
         }).array(),
      }).array(),
   duf_wearable: () =>
      $.type({
         '+': 'reject',
         file_version: 'string',
         asset_info: 'asset_info',
         scene: type({}),
         'geometry_library?': type({}),
         'node_library?': type({}),
         'material_library?': type({}),
         'modifier_library?': 'modifier_library',
         'image_library?': () =>
            $.type({
               '+': 'reject',
               id: 'string',
               name: 'string',
               'map_size?': ['number', 'number'],
               map_gamma: 'number',
               map: 'image_map[]',
               'scene?': () =>
                  $.type({
                     '+': 'reject',
                     nodes: 'scene_node[]',
                  }),
            }).array(),
      }),
})

export const $$ = $.export()
