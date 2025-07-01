import { scope, type } from 'arktype'
import type { string_DazGroup, string_DazId, string_DazUrl } from './spec.js'

// files
export type $$dson = typeof $$.dson.infer
export type $$dson_character = typeof $$.dson_character.infer
export type $$dson_wearable = typeof $$.dson_wearable.infer
export type $$dson_figure = typeof $$.dson_figure.infer
export type $$dson_pose = typeof $$.dson_pose.infer
export type $$dson_modifier = typeof $$.dson_modifier.infer
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

// tupples
export type $$point2d = typeof $$.point2d.infer
export type $$point3d = typeof $$.point3d.infer
export type $$point4d = typeof $$.point4d.infer
export type $$point5d = typeof $$.point5d.infer
export type $$point5or6d = typeof $$.point5or6d.infer
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
   dazgroup: type('string').as<string_DazGroup>(),

   point1d: ['number'],
   point2d: ['number', 'number'],
   point3d: ['number', 'number', 'number'],
   point4d: ['number', 'number', 'number', 'number'],
   point5d: ['number', 'number', 'number', 'number', 'number'],
   point6d: ['number', 'number', 'number', 'number', 'number', 'number'],
   point7d: ['number', 'number', 'number', 'number', 'number', 'number', 'number'],
   point8d: ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
   point9d: ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
   point5or6d: 'point5d | point6d',
   point7or8or9d: 'number[]',
   rotation_order: type.enumerated('ZYX', 'YXZ', 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX'),

   // #region Core files- ------------------------------------------------------------------------
   dson_character: {
      '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      'material_library?': 'material[]',
      scene: 'scene', // scene is a bunch of refs
      'image_library?': 'image[]',
      // 🗑️❓ 'image_library?': 'image[]',
      // 🗑️❓ 'node_library?': 'node_ref[]', // Character .duf might also have a node_library of node_refs
      // 🗑️❓ 'geometry_library?': 'geometry_ref[]', // Character .duf might reference geometries
      // 🗑️❓ 'modifier_library?': 'modifier_ref[]',
   },

   dson_prop: {
      '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      // scene: 'scene', // scene is a bunch of refs
      'geometry_library?': 'geometry_ref[]', // Prop .duf might reference geometries
      'node_library?': 'node_ref[]', // Prop .duf might also have a node_library of node_refs
      // 'material_library?': 'material[]',
      // 'modifier_library?': 'modifier_ref[]',
      // 'image_library?': 'image[]',
   },
   dson_figure: {
      '+': 'reject',
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

   dson_modifier: {
      '+': 'reject',
      file_version: 'string',
      asset_info: 'asset_info',
      // scene: 'scene_pose', // .dsf figure files usually don't have a "scene" block in the same way .duf files do
      // 'geometry_library?': 'geometry_inf[]', // .dsf figure defines its geometries
      // 'node_library?': 'node_inf[]', // .dsf figure defines its nodes (skeleton, etc.)
      'geometry_library?': 'geometry_inf[]', // .dsf figure defines its geometries
      'modifier_library?': 'dson_modifier_modifier[]', // And modifiers
      scene: 'scene',
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
      animations: 'pose_scene_animation[]',
      // when present,
      'nodes?': 'pose_scene_node[]',
   },
   pose_scene_node: {
      id: 'dazid', // "r_ear",
      url: 'dazurl', // "name://@selection/r_ear:",
      // first entry has no parent
      'parent?': 'dazurl', // "#head"
   },
   pose_scene_animation: {
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
      'mask?': 'image_map_mask',
   },
   image_map_mask: {
      url: 'dazurl', // '/Runtime/Textures/DAZ/Characters/Genesis9/Toon/Skin/AnimeBase9_Eyelids01_CM_1001.jpg',
      label: 'string', // 'Mask',
      active: 'boolean', // true,
      color: 'point3d', // [1, 1, 1],
      transparency: 'number', // 1,
      invert: 'boolean', // false,
      rotation: 'number', // 0,
      xmirror: 'boolean', // false,
      ymirror: 'boolean', // false,
      xscale: 'number', // 1,
      yscale: 'number', // 1,
      xoffset: 'number', // 0,
      yoffset: 'number', // 0,
   },

   // #region Scene ------------------------------------------------------------------------
   scene: {
      // Typically found in .duf files
      '+': 'reject',
      'nodes?': 'scene_nodes[]', // Changed from node[] to node_ref[]
      'modifiers?': 'modifier_ref[]',
      'materials?': 'material[]',
      'extra?': 'scene_extra[]',
   },
   scene_nodes: 'node_ref',
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
   geometry_inf: 'geometry_subdivision_surface | geometry_polygon_mesh',
   geometry_polygon_mesh: {
      '+': 'reject',
      id: 'dazid', // "Genesis9-1",
      name: 'string',
      // type specific
      type: "'polygon_mesh'",
      'rigidity?': 'geometry_polygon_mesh_rigidity',
      // 'edge_interpolation_mode?': "'edges_only'",
      // 'subd_normal_smoothing_mode?': "'smooth_all_normals'",

      // regular stuff
      'vertices?': { count: 'number', values: 'point3d[]' },
      'polygon_groups?': { count: 'number', values: 'string[]' /* "l_forearm", "l_upperarm"... */ },
      'polygon_material_groups?': { count: 'number', values: 'string[]' /* "Fingernails", "Legs", ... */ },
      'polyline_list?': {
         count: 'number',
         segment_count: 'number',
         values: 'point7or8or9d[]',
      },
      'polylist?': { count: 'number', values: 'point5or6d[]' /* [ 27, 0, 2184, 2186, 2210, 2208 ], ... */ },
      'root_region?': 'root_region',
      default_uv_set: 'dazurl', // "default_uv_set" : "/data/Daz%203D/Genesis%209/Base/UV%20Sets/Daz%203D/Base/Base%20Multi%20UDIM.dsf#Base%20Multi%20UDIM",
      graft: { '+': 'reject' },
      extra: 'geometry_extra[]',
   },
   geometry_polygon_mesh_rigidity: {
      '+': 'reject',
      'weights?': { count: 'number', values: 'point2d[]' /* [ [vertex_index, weight], ... ] */ },
      groups: 'rigidity_group[]',
   },
   rigidity_group: {
      '+': 'reject',
      id: 'dazid',
      rotation_mode: "'none'",
      scale_modes: ['rigidity_group_scale_mode', 'rigidity_group_scale_mode', 'rigidity_group_scale_mode'],
      reference_vertices: { count: 'number', values: 'number[]' },
      mask_vertices: { count: 'number', values: 'number[]' },
      'transform_nodes?': 'dazurl[]',
      use_tranform_bones_for_scale: 'boolean',
   },
   rigidity_group_scale_mode: "'none'|'primary'|'secondary'",
   geometry_subdivision_surface: {
      '+': 'reject',
      id: 'dazid', // "Genesis9-1",
      name: 'string',
      // type specific
      type: "'subdivision_surface'",
      'rigidity?': 'geometry_polygon_mesh_rigidity',
      'edge_interpolation_mode?': "'edges_only'",
      'subd_normal_smoothing_mode?': "'smooth_all_normals'",
      // regular stuff
      'vertices?': { count: 'number', values: 'point3d[]' },
      'polygon_groups?': { count: 'number', values: 'string[]' /* "l_forearm", "l_upperarm"... */ },
      'polygon_material_groups?': { count: 'number', values: 'string[]' /* "Fingernails", "Legs", ... */ },
      'polylist?': { count: 'number', values: 'point5or6d[]' /* [ 27, 0, 2184, 2186, 2210, 2208 ], ... */ },
      'root_region?': 'root_region',
      default_uv_set: 'dazurl', // "default_uv_set" : "/data/Daz%203D/Genesis%209/Base/UV%20Sets/Daz%203D/Base/Base%20Multi%20UDIM.dsf#Base%20Multi%20UDIM",
      'graft?': 'graft | emptyObject',
      extra: 'geometry_extra[]',
      // 'skin?': 'skin',
   },
   emptyObject: { '+': 'reject' }, // Used to reject empty objects in some contexts
   graft: {
      '+': 'reject',
      vertex_count: 'number',
      poly_count: 'number',
      vertex_pairs: {
         count: 'number',
         values: 'point2d[]', // [ [vertex_index, grafted_vertex_index], ... ]
      },
      'hidden_polys?': {
         count: 'number',
         values: 'number[]', // [ poly_index, ... ] - indices of polygons that are hidden in the graft
      },
   },
   // skin: {
   //    'vertex_weights?': 'skin_weights[]',
   //    // ... other skin properties if they exist
   // },
   // skin_weights: ['string', 'point2d[]'], // [ "bone_name", [ [vertex_index, weight], ... ] ]
   root_region: {
      id: 'dazid',
      label: 'string',
      display_hint: "'cards_on' | 'cards_off'",
      'children?': 'root_region[]',
      'map?': { count: 'number', values: 'number[]' },
   },
   // #region Geometry.Extra ------------------------------------------------------------------------
   geometry_extra: 'geometry_extra_material_selection_sets | geometry_extra_studio_geometry_channels',
   geometry_extra_material_selection_sets: {
      '+': 'reject',
      'version?': 'string | number',
      type: "'material_selection_sets'",
      material_selection_sets: 'material_selection_sets[]',
   },
   geometry_extra_studio_geometry_channels: {
      '+': 'reject',
      'version?': 'string | number',
      type: "'studio_geometry_channels'",
      'channels?': 'channel_container[]', // Updated
   },
   material_selection_sets: { name: 'string', 'materials?': 'string[]' },

   // #region Nodes.Ref ------------------------------------------------------------------------
   // Represents a node reference, typically in .duf files
   node_ref: {
      '+': 'reject',
      id: 'dazid',
      url: 'dazurl', // Changed from string to dazurl
      'geometries?': 'geometry_ref[]',
      name: 'string',
      label: 'string',
      'parent?': 'dazurl',
      'preview?': 'node_ref_preview', // Adjusted preview structure
      'rotation?': 'chanel_float[]',
      'translation?': 'chanel_float[]',
      'extra?': 'scene_node_extra[]', // extra is optional in some contexts
   },
   node_ref_preview: {
      '+': 'reject',
      type: 'node_type',
      'oriented_box?': { min: 'point3d', max: 'point3d' },
      'center_point?': 'point3d',
      'end_point?': 'point3d',
      'rotation_order?': 'rotation_order',
      'rotation?': 'point3d',
   },

   scene_node_extra:
      'scene_node_extra__studio_node_channels | scene_node_extra__studio_element_data_easy_pose | scene_node_extra_studio_element_data_easy_pose',
   scene_node_extra_studio_element_data_easy_pose: {
      pin: 'boolean',
      mass: 'number',
      stiffness: 'number',
   },
   scene_node_extra__studio_node_channels: {
      '+': 'reject',
      type: "'studio_node_channels'",
      'version?': 'string | number',
      'channels?': 'chanel[]',
   },
   scene_node_extra__studio_element_data_easy_pose: {
      '+': 'reject',
      type: "'studio/element_data/easy_pose'",
      'version?': 'string | number',
      'channels?': 'chanel[]',
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
   node_type: "'bone' | 'figure' | 'node'",
   //
   node_inf_extra: 'node_inf_extra_studio_node_channels | node_inf_extra_studio_follower_projection_options',
   node_inf_extra_studio_follower_projection_options: {
      '+': 'reject',
      type: "'studio_follower_projection_options'",
      distance_squared_tolerance: 'number', //1e-7,
      use_near: 'boolean', //false,
      disable_morph_projection: 'boolean', //false,
      nearness_factor: 'number', //0,
      smart_left_right_handling: 'boolean', //true,
      uv_space_projection: 'boolean', //false,
      vertex_first_projection: 'boolean', //false,
      consider_lines_as_rigid: 'boolean', //true,
      adaptive_tolerance: 'number', //0.01,
      source_subdivision_mode: "'auto'", //"auto",
      follower_projection_morph:
         "'MorphProjectionShape'|'head_bs_EyelashesProjectionShape'|'head_bs_TearProjectionShape'|''", //"MorphProjectionShape"
      'hidden?': 'boolean',
   },
   node_inf_extra_studio_node_channels: {
      // For richer extra in node_inf, potentially with channels
      '+': 'reject',
      type: "'studio_node_channels'", // Add other types if necessary
      'version?': 'string | number',
      'channels?': 'channel_container[]',
      'hidden?': 'boolean',
   },
   formula_item: {
      // Basic structure for formula items, expand as needed
      '+': 'reject',
      'output?': 'dazurl', // e.g., "Genesis9:/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#l_hand?value"
      'stage?': "'mult'",
      'operations?': 'formula_op[]', // Define operations structure if needed
   },
   formula_op:
      'formula_op_push_url | formula_op_push_val | formula_op_mult|formula_op_push_vals | formula_op_spline_tcb | formula_op_spline_linear',
   formula_op_push_url: { op: "'push'", url: 'dazurl', '+': 'reject' },
   formula_op_push_val: { op: "'push'", val: 'number', '+': 'reject' },
   formula_op_push_vals: { op: "'push'", val: 'number[]', '+': 'reject' },
   formula_op_spline_tcb: { op: "'spline_tcb'" },
   formula_op_spline_linear: { op: "'spline_linear'" },
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
      'icon_small?': 'string',
      'colors?': type({}),
      'auto_fit_base?': 'dazurl',
      'preferred_base?': 'dazurl',
   },
   chanel: 'chanel_misc | chanel_float_color | chanel_image | chanel_float | chanel_alias',
   chanel_alias: {
      // mandatory
      '+': 'reject',
      id: 'string',
      type: "'alias'",
      'name?': 'string',
      label: 'string',
      'visible?': 'boolean',
      target_channel: 'dazurl',
   },
   chanel_float: {
      // mandatory
      '+': 'reject',
      id: 'string',
      type: "'float'",
      'name?': 'string',
      // value
      current_value: 'number',
      // image
      'image_file?': 'dazurl | null',
      // misc
      'clamped?': 'boolean',
   },
   chanel_float_color: {
      '+': 'reject',
      id: 'string',
      type: "'float_color'",
      'name?': 'string',
      // either?
      'value?': 'point3d',
      current_value: 'point3d',
      // either?
      'image_file?': 'dazurl | null',
      'image?': 'dazurl | null',
   },
   chanel_image: {
      '+': 'reject',
      id: 'string',
      type: "'image'",
      image: 'dazurl | null',
      // name: 'string',
      // value: 'point3d',
      // current_value: 'point3d',
      // image_file: 'dazurl',
   },
   chanel_misc: {
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
      'image_file?': 'null',
      // enum specific
      'enum_values?': 'unknown[]',
      // file specific
      'file_type?': "'file_open'|'file_load'",
      'file_display_text?': 'string',
      'file_filter?': 'string',
      'channel?': 'chanel',
      // 'channel?': 'chanel', // Removed recursive definition; use channel_container for lists of channels
      'needs_node?': 'boolean', // For "Point At" like channels
      'node?': 'null | string | dazid', // For "Point At" like channels
   },
   channel_container: {
      '+': 'reject',
      // Used in lists like geometry_extra.channels or node_inf_extra.channels
      channel: 'chanel',
      'group?': 'string', // e.g. "/General/Transforms"
      'presentation?': 'presentation',
   },

   // #region Modifier.Ref ------------------------------------------------------------------------
   modifier_ref: {
      '+': 'reject',
      id: 'dazid',
      url: 'string',
      'parent?': 'string',
      'channel?': 'chanel',
      'name?': 'string',
      'extra?': 'modifier_ref_extra[]',
   },
   modifier_ref_extra: {
      '+': 'reject',
      'type?': 'string',
      'push_post_smooth?': 'boolean',
      'channels?': 'chanel[]',
   },
   // #region Modifier.Inf ------------------------------------------------------------------------
   modifier_inf: {
      '+': 'reject',
      id: 'dazid',
      'name?': 'string',
      'parent?': 'string',
      'skin?': 'skin',
      'extra?': 'modifier_extra[]',
      // 'channel?': 'chanel',
   },
   skin: {
      '+': 'reject',
      node: 'dazurl',
      geometry: 'dazurl',
      vertex_count: 'number',
      joints: 'joint[]',
      selection_map: 'selMap[]',
   },
   // the modifier data in modifier_libary found in asset type='modifier'
   dson_modifier_modifier: {
      '+': 'reject',
      id: 'dazid',
      'name?': 'string',
      'parent?': 'string',
      'presentation?': 'presentation',
      'channel?': 'chanel',
      'region?': "'Actor'|'Head'|'Face'|'Ears'|'Eyes'|'Mouth'|'Nose'|'Chest'|'Legs'|'Waist'|'Arms'|'Hands'|'Feet'|''",
      'group?': 'dazgroup',
      'morph?': 'morph',
      'formulas?': 'formula_item[]',
      'extra?': 'modifier_extra[]',
   },
   morph: { vertex_count: 'number', deltas: { count: 'number', values: 'number_delta_value[]' } },
   number_delta_value: ['number', 'number', 'number', 'number'],
   selMap: { id: 'dazid', mappings: type(['string', 'string']).array() },
   joint: { id: 'dazid', node: 'dazurl', 'node_weights?': { count: 'number', values: 'point2d[]' } },
   modifier_extra:
      'modifier_extra_studio_modifier_channels | modifier_extra_skin_settings | modifier_extra_studio_modifier_dynamic_simulation | modifier_extra_studio_modifier_smoothing | modifier_extra_studio_modifier_push | modifier_extra_studio_modifier_dynamic_hair_follow | modifier_extra_studio_modifier_dynamic_generate_hair | modifier_extra_studio_modifier_line_tessellation',
   modifier_extra_studio_modifier_dynamic_generate_hair: {
      type: "'studio/modifier/dynamic_generate_hair'",
      generates_for_render: 'boolean',
   },
   modifier_extra_studio_modifier_line_tessellation: {
      '+': 'reject',
      type: "'studio/modifier/line_tessellation'",
   },
   modifier_extra_studio_modifier_dynamic_hair_follow: {
      '+': 'reject',
      type: "'studio/modifier/dynamic_hair_follow'",
      'push_post_smooth?': 'boolean',
      // influence
      // 'influence_vertex_count?': 'number',
      // 'influence_weights?': { count: 'number', values: 'point2d[]' }, // [ [vertex_index, weight], ... ]
   },
   modifier_extra_studio_modifier_push: {
      '+': 'reject',
      type: "'studio/modifier/push'",
      push_post_smooth: 'boolean',
      // influence
      'influence_vertex_count?': 'number',
      'influence_weights?': { count: 'number', values: 'point2d[]' },
   },
   modifier_extra_studio_modifier_smoothing: {
      '+': 'reject',
      type: "'studio/modifier/smoothing'",
   },
   modifier_extra_studio_modifier_channels: {
      '+': 'reject',
      type: "'studio_modifier_channels'",
      channels: 'channel_container[]',
   },
   modifier_extra_studio_modifier_dynamic_simulation: {
      '+': 'reject',
      type: "'studio/modifier/dynamic_simulation'",
      vertex_count: 'number',
      'influence_weights?': { count: 'number', values: 'point2d[]' }, // [ [vertex_index, weight], ... ]
      'hair_simulation_info?': 'string',
   },
   modifier_extra_skin_settings: {
      '+': 'reject',
      type: "'skin_settings'",
      auto_normalize_general: 'boolean', // true,
      auto_normalize_local: 'boolean', // true,
      auto_normalize_scale: 'boolean', // true,
      binding_mode: "'General'", // "General",
      general_map_mode: "'DualQuat'|'Linear'", // "DualQuat",
      // scale
      scale_mode: "'BindingMaps'", // "BindingMaps",
      // blend
      'blend_mode?': "'BlendLinearDualQuat' | 'BlendLocalGeneral'", // "BlendLinearDualQuat",
      'blend_vertex_count?': 'number',
      'blend_weights?': { count: 'number', values: 'point2d[]' },
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
         '+': 'reject',
         channel: 'chanel',
         'group?': 'dazgroup',
         'presentation?': 'presentation',
      },
      extra: 'material_extra[]',
      // 'parent?': 'string',
      // 'url?': 'string',
      // 'channels?': 'chanel[]',
      // 'extra?': { '+': 'reject' }, // TODO: define extra
   },
   material_extra: {
      '+': 'reject',
      type: "'studio/material/uber_iray' | 'studio_material_channels' | 'studio/material/daz_brick'",
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
