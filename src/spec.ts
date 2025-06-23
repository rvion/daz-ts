import { scope, type } from 'arktype'

export type string_DazUrl = string & { __dazurl: true }
export type string_DazId = string & { __dazid: true }

export const asDazId = (s: string): string_DazId => s as string_DazId

// files
export type $$dson = typeof $$.dson.infer
export type $$dson_character = typeof $$.dson_character.infer
export type $$dson_wearable = typeof $$.dson_wearable.infer
export type $$dson_figure = typeof $$.dson_figure.infer
export type $$dson_pose = typeof $$.dson_pose.infer

export type $$chanel = typeof $$.chanel.infer
export type $$rotation_order = typeof $$.rotation_order.infer
// core
export type $$node_ref = typeof $$.node_ref.infer
export type $$node = typeof $$.node_inf.infer
export type $$node_type = typeof $$.node_type.infer
export type $$geometry_ref = typeof $$.geometry_ref.infer
export type $$geometry = typeof $$.geometry_inf.infer
export type $$modifier_inf = typeof $$.modifier_inf.infer
// export type $$skin = typeof $$.skin.infer
export type $$point2d = typeof $$.point2d.infer
export type $$point3d = typeof $$.point3d.infer
export type $$point6d = typeof $$.point6d.infer

// misc
export type DsonFileVersion = string
export type $$asset_info = typeof $$.asset_info.infer

// ------------------------------------------------
export type DazAssetType = (typeof dazAssetTypes)[number]

// biome-ignore format: misc
export const dazAssetTypes = [
   'unknown', // extra
   'animation', 'camera', 'character', 'clothing', 'environment', 'figure', 'hair', 'light', 'material',
   'modifier', 'morph', 'pose', 'preset_dform', 'preset_hierarchical_material', 'preset_hierarchical_pose',
   'preset_layered_image', 'preset_layered_image', 'preset_light', 'preset_material', 'preset_pose',
   'preset_render_settings', 'preset_shader', 'preset_simulation_settings', 'prop', 'scene_subset',
   'scene', 'script', 'shader', 'utility', 'uv_set', 'wearable',
   /* e.g. dicktator */ 'preset_properties', 'preset_shape'
] as const

const dazAssetType = type.enumerated(...dazAssetTypes).as<DazAssetType>()

export const $ = scope({
   // #region DSON core ------------------------------------------------------------------------
   dson: { file_version: 'string', asset_info: 'asset_info' },
   contributor: { '+': 'reject', author: 'string', email: 'string', website: 'string' },
   asset_info: {
      '+': 'reject',
      id: 'dazid',
      type: dazAssetType,
      contributor: 'contributor',
      revision: 'string',
      modified: 'string',
   },

   // #region Core stuff ------------------------------------------------------------------------
   dazid: type('string').as<string_DazId>(),
   dazurl: type('string').as<string_DazUrl>(),

   point2d: ['number', 'number'], // [ 0, 0, 0 ],
   point3d: ['number', 'number', 'number'], // [ 0, 0, 0 ],
   point6d: ['number', 'number', 'number', 'number', 'number', 'number'], // [ 0, 0, 0 ],
   rotation_order: type.enumerated('ZYX', 'YXZ', 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX'),

   // #region Core files- ------------------------------------------------------------------------
   dson_character: {
      '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      'material_library?': 'material[]',
      scene: 'scene', // scene is a bunch of refs
      // 🗑️❓ 'image_library?': 'image[]',
      // 🗑️❓ 'node_library?': 'node_ref[]', // Character .duf might also have a node_library of node_refs
      // 🗑️❓ 'geometry_library?': 'geometry_ref[]', // Character .duf might reference geometries
      // 🗑️❓ 'modifier_library?': 'modifier_ref[]',
   },

   dson_figure: {
      // '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      // scene: 'scene', // .dsf figure files usually don't have a "scene" block in the same way .duf files do
      'geometry_library?': 'geometry_inf[]', // .dsf figure defines its geometries
      'node_library?': 'node_inf[]', // .dsf figure defines its nodes (skeleton, etc.)
      'modifier_library?': 'modifier_inf[]', // And modifiers
      // 🗑️❓ 'uv_set_library?': { '+': 'reject' }, // TODO: Define uv_set_library if needed
      // 🗑️❓ 'material_library?': 'material[]', // Can also define materials
      // 🗑️❓ 'image_library?': 'image[]', // And images
   },

   dson_pose: {
      '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      scene: 'scene_pose', // .dsf figure files usually don't have a "scene" block in the same way .duf files do
      // 'geometry_library?': 'geometry_inf[]', // .dsf figure defines its geometries
      // 'node_library?': 'node_inf[]', // .dsf figure defines its nodes (skeleton, etc.)
      // 'modifier_library?': 'modifier_inf[]', // And modifiers
      // 🗑️❓ 'uv_set_library?': { '+': 'reject' }, // TODO: Define uv_set_library if needed
      // 🗑️❓ 'material_library?': 'material[]', // Can also define materials
      // 🗑️❓ 'image_library?': 'image[]', // And images
   },

   dson_wearable: {
      '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      scene: 'scene',
      'geometry_library?': 'geometry_ref[]',
      'node_library?': 'node_ref[]', // Wearable .duf might also have a node_library of node_refs
      'material_library?': 'material[]',
      'modifier_library?': 'modifier_ref[]',
      'image_library?': 'image[]',
   },

   // #region Pose ------------------------------------------------------------------------
   scene_pose: {
      '+': 'reject',
      animations: 'animation[]',
   },
   animation: {
      '+': 'reject',
      url: 'dazurl',
      keys: 'point2d[]',
   },

   // #region Images ------------------------------------------------------------------------
   image: {
      '+': 'reject',
      id: 'dazid',
      name: 'string',
      'map_size?': ['number', 'number'],
      map_gamma: 'number',
      map: 'image_map[]',
      'scene?': 'scene',
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

   // #region Scene ------------------------------------------------------------------------
   scene: {
      // Typically found in .duf files
      '+': 'reject',
      nodes: 'node_ref[]', // Changed from node[] to node_ref[]
      modifiers: 'modifier_ref[]',
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

   // #region Geometry.Ref ------------------------------------------------------------------------
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

   // #region Geometry.Inf ------------------------------------------------------------------------
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
      extra: 'geometry_extra[]',
      // 'skin?': 'skin',
   },
   // skin: {
   //    'vertex_weights?': 'skin_weights[]',
   //    // ... other skin properties if they exist
   // },
   // skin_weights: ['string', 'point2d[]'], // [ "bone_name", [ [vertex_index, weight], ... ] ]
   root_region: {
      id: 'string',
      label: 'string',
      display_hint: "'cards_on' | 'cards_off'",
      'children?': 'root_region[]',
      'map?': { count: 'number', values: 'number[]' },
   },
   geometry_extra: {
      '+': 'reject',
      type: "'studio_geometry_channels' | 'material_selection_sets'",
      'material_selection_sets?': 'material_selection_sets[]',
      'version?': 'string | number',
      'channels?': 'channel_container[]', // Updated
   },
   material_selection_sets: { name: 'string', 'materials?': 'string[]' },
   // #region Nodes.Ref ------------------------------------------------------------------------
   node_ref: {
      // Represents a node reference, typically in .duf files
      '+': 'reject',
      id: 'dazid',
      url: 'dazurl', // Changed from string to dazurl
      'geometries?': 'geometry_ref[]',
      name: 'string',
      label: 'string',
      'parent?': 'dazurl',
      'preview?': 'node_ref_preview', // Adjusted preview structure
      'extra?': 'node_ref_extra[]', // extra is optional in some contexts
   },
   node_ref_preview: {
      // For .duf style node preview
      type: "'figure' | 'bone'",
      'oriented_box?': { min: 'point3d', max: 'point3d' },
      'center_point?': 'point3d',
      'end_point?': 'point3d',
      'rotation_order?': 'rotation_order',
      'rotation?': 'point3d',
   },
   node_ref_extra: {
      // For simple extra in node_ref
      '+': 'reject',
      type: "'studio_node_channels'",
      version: 'string | number',
   },
   // #region Nodes.Inf ------------------------------------------------------------------------
   node_inf: {
      // Represents a full node definition, typically in .dsf files
      '+': 'reject',
      id: 'dazid',
      name: 'string',
      'name_aliases?': 'string[]',
      type: 'node_type', // e.g. "figure", "bone"
      label: 'string',
      'parent?': 'dazurl',
      'rotation_order?': 'rotation_order',
      'inherits_scale?': 'boolean',
      'center_point?': 'chanel[]', // Array of 3 channels (x,y,z)
      'end_point?': 'chanel[]', // Array of 3 channels (x,y,z)
      'orientation?': 'chanel[]', // Array of 3 channels (x,y,z)
      'rotation?': 'chanel[]', // Array of 3 channels (x,y,z)
      'translation?': 'chanel[]', // Array of 3 channels (x,y,z)
      'scale?': 'chanel[]', // Array of 3 channels (x,y,z)
      'general_scale?': 'chanel',
      'presentation?': 'presentation',
      'extra?': 'node_inf_extra[]',
      'children?': () => $.type('node_inf').array(), // For hierarchical nodes like skeletons
      'formulas?': 'formula_item[]', // Common in .dsf for rigging
      'inherits_selected_channels?': 'boolean',
      // 'geometries?': 'geometry_inf[]', // Geometries are usually in geometry_library for .dsf figures
   },
   node_type: "'bone' | 'figure'",
   node_inf_extra: {
      // For richer extra in node_inf, potentially with channels
      '+': 'reject',
      type: "'studio_node_channels'", // Add other types if necessary
      version: 'string | number',
      'channels?': 'channel_container[]',
   },
   formula_item: {
      // Basic structure for formula items, expand as needed
      '+': 'reject',
      'output?': 'dazurl', // e.g., "Genesis9:/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#l_hand?value"
      'operations?': 'formula_op[]', // Define operations structure if needed
   },
   formula_op: 'formula_op_push_url| formula_op_push_val| formula_op_mult',
   formula_op_push_url: { op: "'push'", url: 'dazurl', '+': 'reject' },
   formula_op_push_val: { op: "'push'", val: 'number', '+': 'reject' },
   formula_op_mult: { op: "'mult'" },

   chanelType: type.enumerated(
      'bool',
      'enum',
      'int',
      'float',
      'node',
      'string',
      'float_color',
      'color',
      'file',
      'numeric_node',
   ), // Added numeric_node
   presentation: {
      '+': 'reject',
      'type?': 'string',
      'label?': 'string',
      'description?': 'string',
      'icon_large?': 'string',
      'colors?': type({}),
      'auto_fit_base?': 'dazurl',
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
      'auto_follow?': 'boolean',
      'locked?': 'boolean',
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
      'channel?': 'chanel',
      // 'channel?': 'chanel', // Removed recursive definition; use channel_container for lists of channels
      'needs_node?': 'boolean', // For "Point At" like channels
      'node?': 'null | string | dazid', // For "Point At" like channels
   },
   channel_container: {
      // Used in lists like geometry_extra.channels or node_inf_extra.channels
      channel: 'chanel',
      'group?': 'string', // e.g. "/General/Transforms"
   },

   // #region Modifier.Ref ------------------------------------------------------------------------
   modifier_ref: {
      '+': 'reject',
      id: 'dazid',
      url: 'string',
      parent: 'string',
      'channel?': 'chanel',
      'name?': 'string',
      'extra?': 'modifier_ref_extra[]',
   },
   modifier_ref_extra: {
      '+': 'reject',
      'type?': 'string',
      'push_post_smooth?': 'boolean',
      'channels?': () => $.type('chanel').array(),
   },
   // #region Modifier.Inf ------------------------------------------------------------------------
   modifier_inf: {
      '+': 'reject',
      id: 'dazid',
      'name?': 'string',
      'parent?': 'string',
      skin: {
         node: 'dazurl',
         geometry: 'dazurl',
         vertex_count: 'number',
         joints: 'joint[]',
         selection_map: 'selMap[]',
      },
      'extra?': 'modifier_inf_extra[]',
      // 'channel?': 'chanel',
   },
   selMap: {
      id: 'dazid',
      mappings: type(['string', 'string']).array(),
   },
   joint: {
      id: 'dazid',
      node: 'dazurl',
      node_weights: {
         count: 'number',
         values: 'point2d[]', // e.g. [ 0.5, 0.5, 0.5 ]
      },
   },
   modifier_inf_extra: {
      '+': 'reject',
      'type?': "'skin_settings'",
      auto_normalize_general: 'boolean', // true,
      auto_normalize_local: 'boolean', // true,
      auto_normalize_scale: 'boolean', // true,
      binding_mode: "'General'", // "General",
      general_map_mode: "'DualQuat'", // "DualQuat",
      blend_mode: "'BlendLinearDualQuat'", // "BlendLinearDualQuat",
      scale_mode: "'BindingMaps'", // "BindingMaps",
      blend_vertex_count: 'number',
      blend_weights: {
         count: 'number',
         values: 'point2d[]',
      },
   },

   // #region Matérial ------------------------------------------------------------------------
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
