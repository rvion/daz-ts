import { scope, type } from 'arktype'

export type string_DazUrl = string & { __dazurl: true } // biome-ignore format: misc
export type string_DazId = string & { __dazid: true } // biome-ignore format: misc

// files
export type $$dson = typeof $$.dson.infer
export type $$dson_character = typeof $$.dson_character.infer
export type $$dson_wearable = typeof $$.dson_wearable.infer
export type $$dson_figure = typeof $$.dson_figure.infer

// core
export type $$node = typeof $$.node.infer
export type $$geometry_ref = typeof $$.geometry_ref.infer
export type $$geometry_inf = typeof $$.geometry_inf.infer

// misc
export type DsonFileVersion = string
export type $$asset_info = typeof $$.asset_info.infer

// ------------------------------------------------
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

const dazAssetType = type.enumerated(...dazAssetTypes).as<DazAssetType>()

export const $ = scope({
   dson: {
      file_version: 'string',
      asset_info: 'asset_info',
   },
   asset_info: {
      '+': 'reject',
      id: 'dazid',
      type: dazAssetType,
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
   image_map: {
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
   },
   dazid: type('string').as<string_DazId>(),
   geometry_ref: {
      '+': 'reject',
      id: 'dazid', // "Genesis9-1",
      url: 'dazurl', // "name://@selection#geometries/Genesis9:"
      name: 'string',
      label: 'string',
      type: "'subdivision_surface'",
      current_subdivision_level: 'number',
      edge_interpolation_mode: "'edges_only'",
      subd_normal_smoothing_mode: "'smooth_all_normals'",
      extra: 'geometry_extra[]',
   },
   geometry_inf: {
      '+': 'reject',
      id: 'dazid', // "Genesis9-1",
      // url: 'dazurl', // "name://@selection#geometries/Genesis9:"
      name: 'string',
      // label: 'string',
      type: "'subdivision_surface'",
      // current_subdivision_level: 'number',
      edge_interpolation_mode: "'edges_only'",
      subd_normal_smoothing_mode: "'smooth_all_normals'",
      extra: 'geometry_extra[]',
      'vertices?': {
         count: 'number',
         values: 'point3d[]',
      },
      'polygon_groups?': {
         count: 'number',
         values: 'string[]', // "l_forearm", "l_upperarm", "r_forearm", ...
      },
      'polygon_material_groups?': {
         count: 'number',
         values: 'string[]', // "Fingernails", "Toenails", "Legs", ...
      },
      'polylist?': {
         count: 'number',
         values: 'point6d[]', // [ 27, 0, 2184, 2186, 2210, 2208 ], ...
      },
      default_uv_set: 'dazurl', // "default_uv_set" : "/data/Daz%203D/Genesis%209/Base/UV%20Sets/Daz%203D/Base/Base%20Multi%20UDIM.dsf#Base%20Multi%20UDIM",
      'root_region?': 'root_region',
      graft: { '+': 'reject' },
   },
   root_region: {
      id: 'string',
      label: 'string',
      display_hint: "'cards_on' | 'cards_off'",
      'children?': 'root_region[]',
      'map?': { count: 'number', values: 'number[]' },
   },
   material_selection_sets: {
      name: 'string',
      'materials?': 'string[]',
   },
   geometry_extra: {
      '+': 'reject',
      type: "'studio_geometry_channels' | 'material_selection_sets'",
      'material_selection_sets?': 'material_selection_sets[]',
      'version?': 'string | number',
      'channels?': 'chanel[]',
   },
   point2d: ['number', 'number'], // [ 0, 0, 0 ],
   point3d: ['number', 'number', 'number'], // [ 0, 0, 0 ],
   point6d: ['number', 'number', 'number', 'number', 'number', 'number'], // [ 0, 0, 0 ],
   rotation_order: type.enumerated("'XYZ'", "'XZY'", "'YXZ'", "'YZX'", "'ZXY'", "'ZYX'"),
   node: {
      '+': 'reject',
      id: 'dazid', //  "Genesis9",
      url: 'string', //  "name://@selection/Genesis9:",
      'geometries?': 'geometry_ref[]',
      name: 'string',
      label: 'string', // "Genesis 9",
      'parent?': 'dazurl', // "#Genesis9",
      preview: {
         type: "'figure' | 'bone'",
         'oriented_box?': {
            min: 'point3d', // [ -63.24, -0.094, -13.15 ]
            max: 'point3d', // [ 63.241, 170.019, 14.524 ]
            'center_point?': 'point3d', // [ 0, 0, 0 ],
            'end_point?': 'point3d', // [ 0, 103.876, 0 ],
            'rotation_order?': 'rotation_order',
         },
      },
      extra: 'node_extra[]',
   },
   node_extra: {
      '+': 'reject',
      type: "'studio_node_channels'",
      version: 'string | number',
   },
   chanelType: type.enumerated('bool', 'enum', 'int', 'float', 'node', 'string', 'float_color', 'color', 'file'),
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
      'name?': 'string',
      'type?': 'chanelType',
      'label?': 'string',
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
      'image?': 'null',
      // enum specific
      'enum_values?': 'unknown[]',
      // file specific
      'file_type?': "'file_open'",
      'file_display_text?': 'string',
      'file_filter?': 'string',
      // ?
      'channel?': 'chanel',
   },
   modifier_library_extra_item: {
      '+': 'reject',
      'type?': 'string',
      'push_post_smooth?': 'boolean',
      'channels?': () => $.type('chanel').array(),
   },
   modifier_library_item: {
      '+': 'reject',
      id: 'dazid',
      'name?': 'string',
      'parent?': 'string',
      'extra?': 'modifier_library_extra_item[]',
      'url?': 'string',
      'channel?': 'chanel',
   },
   dazurl: type('string').as<string_DazUrl>(),
   material: {
      '+': 'reject',
      // meta
      id: 'dazid',
      'name?': 'string',
      'label?': 'string',
      // things to resolve
      'url?': 'dazurl', // "#Fingernails",",
      'geometry?': 'dazurl', // "#Genesis9-1"
      'uv_set?': 'dazurl', // "/data/Daz%203D/Genesis%209/Base/UV%20Sets/Daz%203D/Base/Base%20Multi%20UDIM.dsf#Base%20Multi%20UDIM",
      // misc
      'groups?': 'string[]', // [ "Fingernails" ]
      diffuse: {
         channel: 'chanel',
      },
      extra: 'material_extra[]',
      // 'parent?': 'string',
      // 'url?': 'string',
      // 'channels?': 'chanel[]',
      // 'extra?': { '+': 'reject' }, // TODO: define extra
   },
   material_extra: {
      '+': 'reject',
      type: "'studio/material/uber_iray' | 'studio_material_channels'",
      'version?': 'string | number',
      'channels?': 'chanel[]',
   },
   image: {
      '+': 'reject',
      id: 'dazid',
      name: 'string',
      'map_size?': ['number', 'number'],
      map_gamma: 'number',
      map: 'image_map[]',
      'scene?': 'scene',
   },
   scene: {
      '+': 'reject',
      nodes: 'node[]',
      modifiers: 'modifier_library_item[]',
      materials: 'material[]',
      extra: 'scene_extra[]',
   },
   scene_extra: {
      '+': 'reject',
      type: "'scene_post_load_script'",
      name: 'string',
      'version?': 'string | number',
      'script?': 'dazurl', // "data/Daz 3D/Genesis 9/Base/Tools/Utilities/Character Addon Loader.dse",
      'settings?': {
         '+': 'reject',
         PostLoadAddons: 'unknown',
         FigureInstanceID: 'dazurl',
         RunOnce: 'boolean',
         // '[string]': 'setting',
      },
   },
   dson_character: {
      '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      scene: 'scene',
      'geometry_library?': 'geometry_ref[]',
      'node_library?': { '+': 'reject' },
      'material_library?': 'material[]',
      'modifier_library?': 'modifier_library_item[]',
      'image_library?': 'image[]',
   },
   dson_figure: {
      // '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      // scene: 'scene',
      'geometry_library?': 'geometry_inf[]',
      'node_library?': { '+': 'reject' },
      // 'node_library?': { '+': 'reject' },
      // 'material_library?': 'material[]',
      // 'modifier_library?': 'modifier_library_item[]',
      // 'image_library?': 'image[]',
   },
   dson_wearable: {
      '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      scene: 'scene',
      'geometry_library?': 'geometry_ref[]',
      'node_library?': { '+': 'reject' },
      'material_library?': 'material[]',
      'modifier_library?': 'modifier_library_item[]',
      'image_library?': 'image[]',
   },
})

export const $$ = $.export()

// setting: {
//    '+': 'reject',
//    type: "'settings'",
//    value: {
//       '[string]': 'unknown',
//       // {
//       //    '+': 'reject',
//       //    type: "'settings'",
//       //    value: {
//       //       '+': 'reject',
//       //       AssetName: 'string',
//       //       AssetFile: 'dazurl',
//       //       'Presets?': {
//       //          '+': 'reject',
//       //          type: "'settings'",
//       //          value: 'unknown',
//       //       },
//       //    },
//       // },
//    },
//    // id: 'dazid',
//    // 'name': 'string',
// },
