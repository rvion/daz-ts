import { scope, type } from 'arktype'

// #region Branded types and helpers ------------------------------------------------------------------------
export type string_DazUrl = string & { __dazurl: true }
export type string_DazId = string & { __dazid: true }
export type string_DazGroup = string & { __dazgroup: true }

export function dazIds(ids: string[]): string_DazId[] {
   return ids.map((id) => id as string_DazId)
}
// Function overloads to support both template literal and regular function usage
export function dazId(strings: TemplateStringsArray, ...values: unknown[]): string_DazId
export function dazId(s: string): string_DazId
export function dazId(stringsOrString: TemplateStringsArray | string, ...values: unknown[]): string_DazId {
   return typeof stringsOrString === 'string'
      ? (stringsOrString as string_DazId)
      : (String.raw(stringsOrString, ...values) as string_DazId)
}
export function dazUrl(strings: TemplateStringsArray, ...values: unknown[]): string_DazUrl
export function dazUrl(s: string): string_DazUrl
export function dazUrl(stringsOrString: TemplateStringsArray | string, ...values: unknown[]): string_DazUrl {
   return typeof stringsOrString === 'string'
      ? (stringsOrString as string_DazUrl)
      : (String.raw(stringsOrString, ...values) as string_DazUrl)
}
export function dazGroup(strings: TemplateStringsArray, ...values: unknown[]): string_DazGroup
export function dazGroup(s: string): string_DazGroup
export function dazGroup(stringsOrString: TemplateStringsArray | string, ...values: unknown[]): string_DazGroup {
   return typeof stringsOrString === 'string'
      ? (stringsOrString as string_DazGroup)
      : (String.raw(stringsOrString, ...values) as string_DazGroup)
}
// #endregion

// #region legacy type aliases
export type DazAssetType = typeof $$.dazAssetType.infer

export type $$dson = typeof $$.DAZ.infer
export type $$dson_character = typeof $$.DAZ.infer
export type $$dson_wearable = typeof $$.DAZ.infer
export type $$dson_figure = typeof $$.DAZ.infer
export type $$dson_pose = typeof $$.DAZ.infer
export type $$dson_modifier = typeof $$.DAZ.infer

export type $$point5or6d = number[]
export type $$point3d = typeof $$.float3.infer

export const $ = scope({
   // #region Legacy
   dson: 'DAZ',
   dson_character: 'DAZ',
   dson_wearable: 'DAZ',
   dson_figure: 'DAZ',
   dson_pose: 'DAZ',
   dson_modifier: 'DAZ',

   // #region DSON Primitives from spec ------------------------------------------------------------------------
   int: 'number',
   int2: ['number', 'number'],
   int3: ['number', 'number', 'number'],
   int4: ['number', 'number', 'number', 'number'],
   int5: ['number', 'number', 'number', 'number', 'number'],
   int6: ['number', 'number', 'number', 'number', 'number', 'number'],
   //
   float: 'number',
   float2: ['number', 'number'],
   float3: ['number', 'number', 'number'],
   float4: ['number', 'number', 'number', 'number'],
   float5: ['number', 'number', 'number', 'number', 'number'],
   float6: ['number', 'number', 'number', 'number', 'number', 'number'],
   // NOTE: The spec does not define tuples larger than 5, but they appear in files.

   date_time: 'string', // ISO 8601 "2012-02-25T16:42:11Z"

   string_array: { count: 'int', values: 'string[]' },
   int_array: { count: 'int', values: 'int[]' },
   int2_array: {
      count: 'int',
      values: 'int2[]', // array of [int, int]
   },
   float_array: {
      count: 'int',
      values: 'float[]',
   },
   float2_array: {
      count: 'int',
      values: 'float2[]',
   },
   float3_array: {
      count: 'int',
      values: 'float3[]',
   },
   float_indexed_array: {
      count: 'int',
      values: () => $.type(['int', 'float']).array(),
   },
   float3_indexed_array: {
      count: 'int',
      values: () => $.type(['int', 'float', 'float', 'float']).array(),
   },
   // #endregion

   // #region Custom Branded Types ------------------------------------------------------------------------
   dazId: type('string').as<string_DazId>(),
   dazUrl: type('string').as<string_DazUrl>(),
   dazGroup: type('string').as<string_DazGroup>(),
   // #endregion

   // #region Root DSON Object ------------------------------------------------------------------------
   // This is the top-level object in a DSON file.
   DAZ: {
      file_version: 'string',
      asset_info: 'asset_info',
      'geometry_library?': 'geometry[]',
      'node_library?': 'node[]',
      'uv_set_library?': 'uv_set[]',
      'modifier_library?': 'modifier[]',
      'image_library?': 'image[]',
      'material_library?': 'material[]',
      'scene?': 'scene',
   },
   // #endregion

   // #region Asset Information ------------------------------------------------------------------------
   asset_info: {
      id: 'dazUrl', // The spec says string, but it's a URL.
      'type?': 'dazAssetType',
      contributor: 'contributor',
      revision: 'string',
      'modified?': 'date_time',
   },

   contributor: {
      author: 'string',
      'email?': 'string',
      'website?': 'string',
   },
   // #endregion

   // #region Geometry ------------------------------------------------------------------------
   geometry: {
      id: 'dazId',
      'name?': 'string',
      'label?': 'string',
      'type?': "'polygon_mesh' | 'subdivision_surface'",
      'source?': 'dazUrl',
      'edge_interpolation_mode?': "'no_interpolation' | 'edges_and_corners' | 'edges_only'",
      vertices: 'float3_array',
      polygon_groups: 'string_array',
      polygon_material_groups: 'string_array',
      polylist: {
         count: 'int',
         // The spec is confusing here. The old file used point5or6d[].
         // Real files seem to have arrays of numbers.
         values: 'number[][]',
      },
      'default_uv_set?': 'dazUrl',
      'root_region?': 'region',
      'graft?': 'graft | _emptyObject_',
      'rigidity?': 'rigidity',
      'extra?': 'geometry_extra[]', // Application-specific
   },
   /* --------------- */
   // should be unknown, but I really want to list them all
   geometry_extra: 'geometry_extra_material_selection_sets | geometry_extra_studio_geometry_channels',
   geometry_extra_material_selection_sets: {
      type: "'material_selection_sets'",
      'version?': 'string | number',
      material_selection_sets: 'material_selection_sets[]',
      '+': 'reject',
   },
   geometry_extra_studio_geometry_channels: {
      type: "'studio_geometry_channels'",
      'version?': 'string | number',
      'channels?': 'channel_container[]',
      '+': 'reject',
   },
   channel_container: { '+': 'reject', channel: 'any_channel', 'group?': 'string', 'presentation?': 'presentation' },
   material_selection_sets: { name: 'string', 'materials?': 'string[]' },
   /* --------------- */

   polygon: 'number[]', // Array of vertex indices

   _emptyObject_: { '+': 'reject' },
   graft: {
      vertex_count: 'int',
      poly_count: 'int',
      vertex_pairs: 'int2_array',
      hidden_polys: 'int_array',
      '+': 'reject',
   },

   region: {
      id: 'dazId',
      'label?': 'string',
      'display_hint?': "'cards_on' | 'cards_off'",
      'map?': 'int_array',
      'children?': 'region[]',
      '+': 'reject',
   },

   rigidity: {
      'weights?': 'float_indexed_array',
      groups: 'rigidity_group[]',
      '+': 'reject',
   },

   rigidity_group: {
      id: 'dazId',
      'rotation_mode?': "'none' | 'full' | 'primary' | 'secondary'",
      scale_modes: 'string[]', // array of 3: 'none'|'primary'|'secondary'|'tertiary'
      'reference_vertices?': 'int_array',
      'mask_vertices?': 'int_array',
      'reference?': 'dazUrl',
      'transform_nodes?': 'dazUrl[]',
      /* 🔶 */ use_tranform_bones_for_scale: 'boolean',
      '+': 'reject',
   },
   // #endregion

   // #region Node ------------------------------------------------------------------------
   node_type: "'node' | 'bone' | 'figure' | 'camera' | 'light'",
   node: {
      id: 'dazId',
      name: 'string',
      'name_aliases?': 'string[]',
      'type?': 'node_type',
      label: 'string',
      'source?': 'dazUrl',
      'parent?': 'dazUrl',
      'rotation_order?': 'rotation_order',
      'inherits_scale?': 'boolean',
      'center_point?': 'any_channel[]', // 3 floats
      'end_point?': 'any_channel[]', // 3 floats
      'orientation?': 'any_channel[]', // 3 floats
      'rotation?': 'any_channel[]', // 3 floats
      'translation?': 'any_channel[]', // 3 floats
      'scale?': 'any_channel[]', // 3 floats
      'general_scale?': 'any_channel',
      'presentation?': 'presentation',
      'formulas?': 'formula[]',
      'extra?': 'unknown[]',
      // Extended by camera and light
      'perspective?': 'camera_perspective',
      'orthographic?': 'camera_orthographic',
      'color?': 'float3', // for light
      'point?': 'light_point',
      'directional?': 'light_directional',
      'spot?': 'light_spot',
      'on?': 'boolean', // for light
      'children?': 'node[]',
      '+': 'reject',
   },

   camera_perspective: {
      'znear?': 'float',
      'zfar?': 'float',
      'yfov?': 'float',
      'focal_length?': 'float',
      'depth_of_field?': 'boolean',
      'focal_distance?': 'float',
      'fstop?': 'float',
      '+': 'reject',
   },

   camera_orthographic: {
      'znear?': 'float',
      'zfar?': 'float',
      'ymag?': 'float',
      '+': 'reject',
   },

   light_directional: {
      'intensity?': 'float',
      'shadow_type?': "'none' | 'shadow_map' | 'raytraced'",
      'shadow_softness?': 'float',
      'shadow_bias?': 'float',
      '+': 'reject',
   },

   light_point: {
      'intensity?': 'float',
      'shadow_type?': "'none' | 'shadow_map' | 'raytraced'",
      'shadow_softness?': 'float',
      'shadow_bias?': 'float',
      'constant_attenuation?': 'float',
      'linear_attenuation?': 'float',
      'quadratic_attenuation?': 'float',
      '+': 'reject',
   },

   light_spot: {
      'intensity?': 'float',
      'shadow_type?': "'none' | 'shadow_map' | 'raytraced'",
      'shadow_softness?': 'float',
      'shadow_bias?': 'float',
      'constant_attenuation?': 'float',
      'linear_attenuation?': 'float',
      'quadratic_attenuation?': 'float',
      'falloff_angle?': 'float',
      'falloff_exponent?': 'float',
      '+': 'reject',
   },
   // #endregion

   // #region Channel ------------------------------------------------------------------------
   any_channel:
      'channel_alias | channel_bool | channel_color | channel_enum | channel_float | channel_image | channel_int | channel_string | chanel_float_color | chanel_file | channel_other',

   ___channel_base: {
      id: 'dazId',
      'name?': 'string',
      'label?': 'string',
      'visible?': 'boolean',
      'locked?': 'boolean',
      'auto_follow?': 'boolean',
   },

   channel_alias: {
      '...': '___channel_base',
      type: "'alias'",
      target_channel: 'dazUrl',
      '+': 'reject',
   },

   channel_bool: {
      '...': '___channel_base',
      type: "'bool'",
      'value?': 'boolean',
      'current_value?': 'boolean',
      'mappable?': 'boolean',
      '+': 'reject',
   },

   channel_color: {
      '...': '___channel_base',
      type: "'color'",
      'value?': 'float3',
      'current_value?': 'float3',
      'mappable?': 'boolean',
      '+': 'reject',
   },

   channel_enum: {
      '...': '___channel_base',
      type: "'enum'",
      'value?': 'int',
      'current_value?': 'int',
      'enum_values?': 'string[]',
      '+': 'reject',
   },

   channel_float: {
      '...': '___channel_base',
      type: "'float'",
      'value?': 'float',
      'current_value?': 'float',
      'min?': 'float',
      'max?': 'float',
      'clamped?': 'boolean',
      'display_as_percent?': 'boolean',
      'step_size?': 'float',
      'mappable?': 'boolean',
      '+': 'reject',
   },

   channel_image: {
      '...': '___channel_base',
      type: "'image'",
      'value?': 'dazUrl',
      'current_value?': 'dazUrl',
      '+': 'reject',
   },

   channel_int: {
      '...': '___channel_base',
      type: "'int'",
      'value?': 'int',
      'current_value?': 'int',
      'min?': 'int',
      'max?': 'int',
      'clamped?': 'boolean',
      'step_size?': 'int',
      'mappable?': 'boolean',
      '+': 'reject',
   },

   channel_string: {
      '...': '___channel_base',
      type: "'string'",
      'value?': 'string',
      'current_value?': 'string',
      '+': 'reject',
   },

   chanel_float_color: {
      '...': '___channel_base',
      type: "'float_color'",
      // value
      'value?': 'float3',
      'current_value?': 'float3',
      // image
      'image_file?': 'dazUrl | null',
      'image?': 'dazUrl | null',
      // ...
      'min?': 'number',
      'max?': 'number',
      'clamped?': 'boolean',
      'step_size?': 'number',
      'default_image_gamma?': 'number',
      'mappable?': 'boolean',
      '+': 'reject',
   },

   chanel_file: {
      '...': '___channel_base',
      type: "'file'",
      // value
      'value?': 'string',
      'current_value?': 'string',
      // file
      file_type: "'file_open'|'file_load'",
      file_display_text: 'string',
      file_filter: 'string', //"IES (*.ies)"
      '+': 'reject',
   },

   // Catch-all for other channel types found in files
   channel_other: {
      '...': '___channel_base',
      'type?': "'ok'",
      'value?': 'unknown',
      'current_value?': 'unknown',
      '+': 'reject',
   },
   // #endregion

   // #region Modifier ------------------------------------------------------------------------
   modifier: {
      id: 'dazId',
      'name?': 'string',
      'label?': 'string',
      'source?': 'dazUrl',
      'parent?': 'dazUrl',
      'presentation?': 'presentation',
      'channel?': 'any_channel',
      'region?': 'string',
      'group?': 'dazGroup',
      'formulas?': 'formula[]',
      'morph?': 'morph',
      'skin?': 'skin_binding',
      'extra?': 'unknown[]',
      '+': 'reject',
   },

   morph: {
      vertex_count: 'int',
      deltas: 'float3_indexed_array',
      'extra?': 'unknown[]',
   },

   skin_binding: {
      node: 'dazUrl',
      geometry: 'dazUrl',
      vertex_count: 'int',
      'joints?': 'weighted_joint[]',
      'selection_sets?': 'named_string_map[]',
   },

   weighted_joint: {
      id: 'dazId',
      node: 'dazUrl',
      'node_weights?': 'float_indexed_array',
      'scale_weights?': 'float_indexed_array',
      'local_weights?': {
         'x?': 'float_indexed_array',
         'y?': 'float_indexed_array',
         'z?': 'float_indexed_array',
      },
      'bulge_weights?': {
         'x?': 'bulge_binding',
         'y?': 'bulge_binding',
         'z?': 'bulge_binding',
      },
   },

   bulge_binding: {
      bulges: 'channel_float[]', // 4 of them
      left_map: 'float_indexed_array',
      right_map: 'float_indexed_array',
   },

   named_string_map: {
      id: 'string',
      mappings: () => $.type(['string', 'string']).array(),
   },
   // #endregion

   // #region Formula ------------------------------------------------------------------------
   formula: {
      output: 'dazUrl',
      operations: 'operation[]',
      'stage?': "'mult' | 'sum'", // | 'multiply'
      '+': 'reject',
   },

   // biome-ignore format: misc
   operation: 'formula_op_push_url | formula_op_push_val | formula_op_mult|formula_op_push_vals | formula_op_spline_tcb | formula_op_spline_linear',
   formula_op_push_url: { op: "'push'", url: 'dazUrl', '+': 'reject' },
   formula_op_push_val: { op: "'push'", val: 'number', '+': 'reject' },
   formula_op_push_vals: { op: "'push'", val: 'number[]', '+': 'reject' },
   formula_op_spline_tcb: { op: "'spline_tcb'" },
   formula_op_spline_linear: { op: "'spline_linear'" },
   formula_op_mult: { op: "'mult'" },
   // [ℹ] operation: {
   // [ℹ]    op: 'string', // 'push', 'add', 'mult', etc.
   // [ℹ]    'val?': 'number | number[]',
   // [ℹ]    'url?': 'dazUrl',
   // [ℹ] },
   // #endregion

   // #region Material ------------------------------------------------------------------------
   material: {
      id: 'dazId',
      'name?': 'string',
      'label?': 'string',
      'source?': 'dazUrl',
      'uv_set?': 'dazUrl',
      'type?': 'string',
      'diffuse?': 'material_channel',
      'diffuse_strength?': 'material_channel',
      'specular?': 'material_channel',
      'specular_strength?': 'material_channel',
      'glossiness?': 'material_channel',
      'ambient?': 'material_channel',
      'ambient_strength?': 'material_channel',
      'reflection?': 'material_channel',
      'reflection_strength?': 'material_channel',
      'refraction?': 'material_channel',
      'refraction_strength?': 'material_channel',
      'ior?': 'material_channel',
      'bump?': 'material_channel',
      'bump_min?': 'material_channel',
      'bump_max?': 'material_channel',
      'displacement?': 'material_channel',
      'displacement_min?': 'material_channel',
      'displacement_max?': 'material_channel',
      'transparency?': 'material_channel',
      'normal?': 'material_channel',
      'u_offset?': 'material_channel',
      'u_scale?': 'material_channel',
      'v_offset?': 'material_channel', // spec has typo v_offfset
      'v_scale?': 'material_channel',
      'extra?': 'unknown[]',
   },

   material_channel: {
      'channel?': 'any_channel',
      'group?': 'dazGroup',
      'color?': 'float3',
      'strength?': 'float',
      'image?': 'dazUrl',
   },
   // #endregion

   // #region Image ------------------------------------------------------------------------
   image: {
      id: 'dazId',
      name: 'string',
      'source?': 'dazUrl',
      'map_gamma?': 'float',
      'map_size?': 'float2',
      'map?': 'image_map[]',
   },

   image_map: {
      'url?': 'dazUrl',
      label: 'string',
      'active?': 'boolean',
      'color?': 'float3',
      'transparency?': 'float',
      'invert?': 'boolean',
      'rotation?': 'float',
      'xmirror?': 'boolean',
      'ymirror?': 'boolean',
      'xscale?': 'float',
      'yscale?': 'float',
      'xoffset?': 'float',
      'yoffset?': 'float',
      'operation?': 'string', // many blend modes
   },
   // #endregion

   // #region UV Set ------------------------------------------------------------------------
   uv_set: {
      id: 'dazId',
      'name?': 'string',
      'label?': 'string',
      'source?': 'dazUrl',
      vertex_count: 'int',
      uvs: 'float2_array',
      'polygon_vertex_indices?': () => $.type(['int', 'int', 'int']).array(),
   },
   // #endregion

   // #region Scene ------------------------------------------------------------------------
   scene: {
      'presentation?': 'presentation',
      'nodes?': 'node_instance[]',
      'uvs?': 'uv_set_instance[]',
      'modifiers?': 'modifier_instance[]',
      'materials?': 'material_instance[]',
      'animations?': 'channel_animation[]',
      'current_camera?': 'dazUrl',
      'extra?': 'unknown[]',
   },

   node_instance: {
      id: 'dazId',
      url: 'dazUrl',
      'parent?': 'dazUrl',
      'parent_in_place?': 'dazUrl',
      'conform_target?': 'dazUrl',
      'geometries?': 'geometry_instance[]',
      'preview?': 'preview',
   },

   geometry_instance: {
      'id?': 'dazId',
      url: 'dazUrl',
   },

   uv_set_instance: {
      id: 'dazId',
      url: 'dazUrl',
      parent: 'dazUrl', // geometry
   },

   modifier_instance: {
      id: 'dazId',
      'parent?': 'dazUrl', // node
      url: 'dazUrl',
   },

   material_instance: {
      id: 'dazId',
      'url?': 'dazUrl',
      'geometry?': 'dazUrl',
      groups: 'string[]',
   },

   channel_animation: {
      url: 'dazUrl',
      keys: 'float2[]', // [time, value, [interpolation, ...]]
      // keys: 'unknown[]', // [time, value, [interpolation, ...]]
   },

   preview: {
      'oriented_box?': 'oriented_box',
      'center_point?': 'float3',
      'end_point?': 'float3',
      'rotation_order?': 'rotation_order',
      /* 🔶 */ 'type?': 'string',
   },

   oriented_box: {
      'min?': 'float3',
      'max?': 'float3',
      '+': 'reject',
   },
   // #endregion

   // #region Misc ------------------------------------------------------------------------
   presentation: {
      type: 'string',
      label: 'string',
      description: 'string',
      icon_large: 'string', // path
      'icon_small?': 'string', // path
      colors: 'float3[]', // array of 2
   },

   dazAssetType: type.enumerated(
      'unknown',
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
      'preset_properties',
      'preset_shape',
   ),

   rotation_order: type.enumerated('XYZ', 'YZX', 'ZYX', 'ZXY', 'XZY', 'YXZ'),
   // #endregion
})

// #region Exports ------------------------------------------------------------------------
export const $$ = $.export()

// Root file type
export type $$Daz = typeof $$.DAZ.infer

// Asset types
export type $$asset_info = typeof $$.asset_info.infer
export type $$contributor = typeof $$.contributor.infer
export type $$geometry = typeof $$.geometry.infer
export type $$node = typeof $$.node.infer
export type $$node_type = typeof $$.node_type.infer
export type $$uv_set = typeof $$.uv_set.infer
export type $$modifier = typeof $$.modifier.infer
export type $$channel = typeof $$.any_channel.infer
export type $$image = typeof $$.image.infer
export type $$material = typeof $$.material.infer

// Scene instance types
export type $$scene = typeof $$.scene.infer
export type $$node_instance = typeof $$.node_instance.infer
export type $$geometry_instance = typeof $$.geometry_instance.infer
export type $$uv_set_instance = typeof $$.uv_set_instance.infer
export type $$modifier_instance = typeof $$.modifier_instance.infer
export type $$material_instance = typeof $$.material_instance.infer

// Channels
export type $$any_channel = typeof $$.any_channel.infer
export type $$channel_float = typeof $$.channel_float.infer
export type $$channel_animation = typeof $$.channel_animation.infer

// Misc
export type $$formula = typeof $$.formula.infer
export type $$presentation = typeof $$.presentation.infer
export type $$morph = typeof $$.morph.infer
export type $$skin_binding = typeof $$.skin_binding.infer

// Primitives
export type $$float3 = typeof $$.float3.infer
export type $$float2 = typeof $$.float2.infer
// #endregion
