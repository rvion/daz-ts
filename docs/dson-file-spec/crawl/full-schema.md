# DSON File Format Schema

<h2 id="dson-def-asset-info">asset_info</h2>

**Description:**
Describes the addressing, version, and ownership of an asset.




<h3 id="dson-def-asset-info-properties">Properties</h3>

| Name          | Description                                                                                                                                               | Default | Required |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`          | A string representing the URL for this file, relative to a content root folder.                                                                           | `None`  | **yes**  |
| `type`        | A string representing a hint of how to load the file.                                                                                                     | `None`  | **no**   |
| `contributor` | A [contributor](#dson-def-contributor) object representing a person or entity that worked on the asset.                                                   | `N/A`   | **yes**  |
| `revision`    | A string representing the revision number for the file.                                                                                                   | `“1.0”` | **yes**  |
| `modified`    | A [date_time](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#date_time) representing the given revision of the file. | `None`  | **no**   |

<h3 id="dson-def-asset-info-details">Details</h3>


The id indicates the file path that should be used for the file containing this definition.  The file path should always begin with a leading ‘/’ and is understood to be relative to the content directory root folder.



Assets within a DSF file are assumed to “live” together forever so that asset addressing of assets within the file may remain constant. If it is necessary to update the assets within a previously deployed file and re-deploy it, the revision number should be incremented to allow differentiation between the original file and the updated file. How the revision field is interpreted is application-defined.





<h3 id="dson-def-asset-info-example">Example</h3>

```json
{
	“id” : “/DAZ/Clothing/Short2.dsf”,
	“type” : “preset_pose”,
	“contributor” : {
		/*  See contributor  */
	},
	“revision” : “1.0”,
	“modified” : “Sat Feb 25 16:42:11 2012”
}
```

---

<h2 id="dson-def-bulge-binding">bulge_binding</h2>

**Description:**
Defines a bulge binding that appears in the bulge_weights collection of a weighted joint.




<h3 id="dson-def-bulge-binding-appears-within">Appears within</h3>

- [`weighted_joint`](#dson-def-weighted-joint)

<h3 id="dson-def-bulge-binding-properties">Properties</h3>

| Name        | Description                                                                                                                                                                 | Default | Required |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `bulges`    | An array of four [channel_float](#dson-def-channel-float) objects representing the “positive-left”, “positive-right”, “negative-left”, and “negative-right” channel values. | `None`  | **yes**  |
| `left_map`  | A [float_indexed_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float_indexed_array) representing the left vertex map.          | `None`  | **yes**  |
| `right_map` | A [float_indexed_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float_indexed_array) representing the right vertex map.         | `None`  | **yes**  |

<h3 id="dson-def-bulge-binding-example">Example</h3>

```json
{
	“bulges” : [
		{
			/*  See channel_float  */
		},
		…
	],
	“left_map” : float_indexed_array,
	“right_map” : float_indexed_array
}
```

---

<h2 id="dson-def-camera">camera</h2>

**Description:**
Extra properties available for use if the node type is specified as “camera”.




<h3 id="dson-def-camera-extends">Extends</h3>

- [`node`](#dson-def-node)

<h3 id="dson-def-camera-properties">Properties</h3>

| Name           | Description                                                                                                   | Default | Required                        |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------- |
| `perspective`  | A [camera_perspective](#dson-def-camera-perspective) object definition, if this is a perspective camera.      | `N/A`   | **this or camera_orthographic** |
| `orthographic` | An [camera_orthographic](#dson-def-camera-orthographic) object definition, if this is an orthographic camera. | `N/A`   | **this or camera_perspective**  |

<h3 id="dson-def-camera-example">Example</h3>

```json
{
	“id” : “perspective”,
	“label” : “Cinematic”,
	“type” : “camera”,
	“parent” : “lhand”,
	“perspective” : {
		/*  See camera_perspective  */
	},
	“orthographic” : {
		/*  See camera_orthographic  */
	},
	“rotation” : [
		{
			/*  See channel_float  */
		},
		…
	],
	“translation” : [
		{
			/*  See channel_float  */
		},
		…
	],
	“scale” : [
		{
			/*  See channel_float  */
		},
		…
	]
}
```

---

<h2 id="dson-def-camera-orthographic">camera_orthographic</h2>

**Description:**
Defines properties of an orthographic camera.




<h3 id="dson-def-camera-orthographic-properties">Properties</h3>

| Name    | Description                                     | Default | Required |
| ------- | ----------------------------------------------- | ------- | -------- |
| `znear` | The near clipping plane                         | ``      | **no**   |
| `zfar`  | The far clipping plane                          | ``      | **no**   |
| `ymag`  | View magnification along the vertical (y) axis. | ``      | **no**   |

<h3 id="dson-def-camera-orthographic-example">Example</h3>

```json
{
    "znear" : 0.1,
    "zfar" : 100.0,
    "ymag" : 25.6
}
```

---

<h2 id="dson-def-camera-perspective">camera_perspective</h2>

**Description:**
Defines properties of a perspective camera.




<h3 id="dson-def-camera-perspective-appears-within">Appears within</h3>

- [`camera`](#dson-def-camera)

<h3 id="dson-def-camera-perspective-properties">Properties</h3>

| Name             | Description                                            | Default | Required |
| ---------------- | ------------------------------------------------------ | ------- | -------- |
| `znear`          | The near clipping plane                                | ``      | **no**   |
| `zfar`           | The car clipping plane                                 | ``      | **no**   |
| `yfov`           | Field of view along the vertical (y) axis, in degrees. | `45.0`  | **no**   |
| `focal_length`   | Focal length                                           | ``      | **no**   |
| `depth_of_field` | If this camera should do depth of field                | `false` | **no**   |
| `focal_distance` | Focal distance                                         | ``      | **no**   |
| `fstop`          | F stop for the camera                                  | ``      | **no**   |

<h3 id="dson-def-camera-perspective-example">Example</h3>

```json
{
    "znear" : 0.1,
    "zfar" : 1000.0,
    "yfov" : 45.0,
    "focal_length" : 50.0,
    "depth_of_field" : false,
    "focal_distance" : 50.0,
    "fstop" : 25.0
}
```

---

<h2 id="dson-def-channel">channel</h2>

**Description:**
This is an abstract object that contains the common properties for all channel types.




<h3 id="dson-def-channel-appears-within">Appears within</h3>

- [`bulge_binding`](#dson-def-bulge-binding)
- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-channel-extended-by">Extended By</h3>

- [`channel_alias`](#dson-def-channel-alias)
- [`channel_bool`](#dson-def-channel-bool)
- [`channel_color`](#dson-def-channel-color)
- [`channel_enum`](#dson-def-channel-enum)
- [`channel_float`](#dson-def-channel-float)
- [`channel_image`](#dson-def-channel-image)
- [`channel_int`](#dson-def-channel-int)
- [`channel_string`](#dson-def-channel-string)

<h3 id="dson-def-channel-properties">Properties</h3>

| Name          | Description                                                                                                                                                                                     | Default   | Required |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------- |
| `id`          | A string representing a unique ID within the property scope of the containing object.                                                                                                           | `None`    | **yes**  |
| `type`        | A string representing the data type of the channel. Valid values are “alias”, “bool”, “color”, “enum”, “float”, “image”, “int” and “string”.  See [Extended By](#dson-def-channel-extended_by). | `“float”` | **yes**  |
| `name`        | A string representing the internal name to apply to this channel. An empty string is not a valid name.                                                                                          | `None`    | **yes**  |
| `label`       | A string representing a user-facing label to apply to this channel.                                                                                                                             | `None`    | **no**   |
| `visible`     | A boolean value representing a UI hint, indicating whether or not the parameter should be shown.                                                                                                | `true`    | **no**   |
| `locked`      | A boolean value representing whether or not the parameter is allowed to be changed.                                                                                                             | `false`   | **no**   |
| `auto_follow` | A boolean value representing whether or not the channel should automatically be connected to a corresponding channel during conforming.                                                         | `false`   | **no**   |

<h3 id="dson-def-channel-details">Details</h3>


The ID of a channel does not have to be unique within file scope because it is not an “asset” and its addressing is always via property addressing, so must only be unique within the scope of the containing/owning object.





<h3 id="dson-def-channel-example">Example</h3>

```json
{
	"id" : "x",
	"label" : "Side-Side",
	"visible" : true,
	"locked" : true,
	"min" : 0.0,
	"max" : 1.0,
	"clamped" : true,
	"display_as_percent" : false,
	"step_size" : 2.0,
	"value" : 0.0
}
```

---

<h2 id="dson-def-channel-alias">channel_alias</h2>

**Description:**
Channels that exist on an object may be aliased to appear on another object. This allows control of the channel from more than one location. A channel_alias simply reflects the target_channel properties and values.




<h3 id="dson-def-channel-alias-appears-within">Appears within</h3>

- [`bulge_binding`](#dson-def-bulge-binding)
- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-channel-alias-extends">Extends</h3>

- [`channel`](#dson-def-channel)

<h3 id="dson-def-channel-alias-properties">Properties</h3>

| Name             | Description                                                                              | Default | Required |
| ---------------- | ---------------------------------------------------------------------------------------- | ------- | -------- |
| `target_channel` | A string representing the URI referring to the channel that this channel is an alias of. | `“”`    | **yes**  |

<h3 id="dson-def-channel-alias-details">Details</h3>


The current_value attribute is overridden anytime an animation is associated with the channel.





<h3 id="dson-def-channel-alias-example">Example</h3>

```json
{
	"id" : "value",
	"type" : "alias",
	"name" : "Bend",
	"label" : "Bend",
	"target_channel" : "blSubDragon_14162:#LegacyBinding?joints/hip/bend"
}
```

---

<h2 id="dson-def-channel-animation">channel_animation</h2>

**Description:**
Defines an animation sequence for a single channel.




<h3 id="dson-def-channel-animation-appears-within">Appears within</h3>

- [`scene`](#dson-def-scene)

<h3 id="dson-def-channel-animation-properties">Properties</h3>

| Name   | Description                                                                                                                                                | Default   | Required     |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------ |
| `Name` | Description                                                                                                                                                | `Default` | **Required** |
| `url`  | A string representing the URI referring to the channel to target with this animation.                                                                      | `None`    | **yes**      |
| `keys` | An array of time/value pairs, with an optional nested array that defines  an interpolation type and its associated values (if any), one for each keyframe. | `None`    | **yes**      |

<h3 id="dson-def-channel-animation-details">Details</h3>


Keys must appear in order of ascending time.  The number of values specified for each key must match the number of components of the property specified in the url.  To provide animation data for a single component of a multi-component property, use the sub-property selector syntax (see [Asset Addressing](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/asset_addressing/start)) to specify which component is desired, then provide the number of values required to specify a value for keys of that type.



The assumed key interpolation type is Catmull-Rom Spline Tangent for float channels and Linear for all others.





<h3 id="dson-def-channel-animation-example">Example</h3>

```json
{
	"url" : "hips#translation",
	"keys" : [ [ 0.0, [1.23, 2.34, 4.55] ], [ 1.0, [6.78, 5.23, 1.90] ] ]
}{
	"url" : "hips#translation/x",
	"keys" : [ [ 0.0, 1.23 ], [ 1.0, 6.78 ] ]
}{
	"url" : "hips#translation/x",
	"keys" : [ [ 0.0, 1.23, ["TCB", -0.5, 0.2, 0.5] ], [ 1.0, 6.78, ["LINEAR"] ] ]
}{
        "url" : "Dress:#Morph_001?value/value",
        "keys" : [ [ 0.5666667, 1, ["HERMITE", 0,0 ] ], [ 0.6, 0, ["CONST"] ] ]
}
```

---

<h2 id="dson-def-channel-bool">channel_bool</h2>

**Description:**
Defines properties of a boolean-valued channel. Only determinate true and false values are supported. Indeterminate boolean states (tri-states) are not supported.




<h3 id="dson-def-channel-bool-appears-within">Appears within</h3>

- [`bulge_binding`](#dson-def-bulge-binding)
- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-channel-bool-extends">Extends</h3>

- [`channel`](#dson-def-channel)

<h3 id="dson-def-channel-bool-properties">Properties</h3>

| Name            | Description                                                                                                                                                                                                                                                                                       | Default   | Required     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------ |
| `Name`          | Description                                                                                                                                                                                                                                                                                       | `Default` | **Required** |
| `min`           | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) representing the minimum value for the parameter, or for each component of a vector-valued channel.                                                                                             | `0.0`     | **no**       |
| `max`           | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) representing the maximum value for the parameter, or for each component of a vector-valued channel.                                                                                             | `1.0`     | **no**       |
| `clamped`       | A boolean value representing whether or not min and max are enforced.                                                                                                                                                                                                                             | `false`   | **no**       |
| `step_size`     | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) representing the step size, or paging size, to use for this parameter when presenting UI to the user.  Effectively a scaling value. Value applies to all components of a vector-valued channel. | `1.0`     | **no**       |
| `value`         | A boolean value representing the default value for the parameter.                                                                                                                                                                                                                                 | `false`   | **no**       |
| `current_value` | A boolean value representing the current value for the parameter.                                                                                                                                                                                                                                 | `false`   | **no**       |
| `mappable`      | A boolean value representing whether or not the channel is mappable.                                                                                                                                                                                                                              | `false`   | **no**       |

<h3 id="dson-def-channel-bool-details">Details</h3>


The current_value attribute is overridden anytime an animation is associated with the channel.





<h3 id="dson-def-channel-bool-example">Example</h3>

```json
{
	"id" : "Multiply Specular Through Opacity",
	"type" : "bool",
	"name" : "Multiply Specular Through Opacity",
	"label" : "Multiply Specular Through Opacity",
	"value" : true
}
```

---

<h2 id="dson-def-channel-color">channel_color</h2>

**Description:**
Defines properties of a vector-valued color channel where color is represented as a three-component floating point RGB value.




<h3 id="dson-def-channel-color-appears-within">Appears within</h3>

- [`bulge_binding`](#dson-def-bulge-binding)
- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-channel-color-extends">Extends</h3>

- [`channel`](#dson-def-channel)

<h3 id="dson-def-channel-color-properties">Properties</h3>

| Name            | Description                                                                                                                                             | Default             | Required |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------- |
| `value`         | A [float3](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) representing the default color value for the parameter. | `[ 0.0, 0.0, 0.0 ]` | **no**   |
| `current_value` | A [float3](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) representing the current color value for the parameter. | `[ 0.0, 0.0, 0.0 ]` | **no**   |
| `mappable`      | A boolean value indicating whether or not the channel is mappable.                                                                                      | `false`             | **no**   |

<h3 id="dson-def-channel-color-details">Details</h3>


Color values are assumed to be in the range 0.0 to 1.0, but floating point values outside that range are legal and it is up to the application to determine how to interpret those.



The current_value attribute is overridden anytime an animation is associated with the channel.





<h3 id="dson-def-channel-color-example">Example</h3>

```json
{
	"id" : "diffuse",
	"label" : "Color",
	"visible" : true,
	"locked" : true,
	"value" : [ 0.0, 0.0, 0.0 ],
	"current_value" : [ 0.0, 0.32, 0.73 ],
}
```

---

<h2 id="dson-def-channel-enum">channel_enum</h2>

**Description:**
Defines properties of an enum-valued channel. A channel_enum channel type can support a pre-determined mapping from a string to an integer index value.




<h3 id="dson-def-channel-enum-appears-within">Appears within</h3>

- [`bulge_binding`](#dson-def-bulge-binding)
- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-channel-enum-extends">Extends</h3>

- [`channel`](#dson-def-channel)

<h3 id="dson-def-channel-enum-properties">Properties</h3>

| Name          | Description                                                                                                                                               | Default   | Required |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------- |
| `value`       | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) representing the default index value for the parameter. | `0`       | **no**   |
| `enum_values` | An array of string values representing the enumerated values for the parameter.                                                                           | `{empty}` | **no**   |

<h3 id="dson-def-channel-enum-details">Details</h3>


The current_value attribute is overridden anytime an animation is associated with the channel.





<h3 id="dson-def-channel-enum-example">Example</h3>

```json
{
	"id" : "Lighting Model",
	"type" : "enum",
	"name" : "Lighting Model",
	"label" : "Lighting Model",
	"value" : 0,
	"enum_values" : [ "Plastic", "Metallic", "Skin", "Glossy (Plastic)", "Matte", "Glossy (Metallic)" ]
}
```

---

<h2 id="dson-def-channel-float">channel_float</h2>

**Description:**
Defines properties of a floating-point value channel.




<h3 id="dson-def-channel-float-appears-within">Appears within</h3>

- [`bulge_binding`](#dson-def-bulge-binding)
- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-channel-float-extends">Extends</h3>

- [`channel`](#dson-def-channel)

<h3 id="dson-def-channel-float-properties">Properties</h3>

| Name                 | Description                                                                                                                                                                                                                                                                                                | Default | Required |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `value`              | A [float](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float) value representing the default value for the parameter.                                                                                                                                               | `0.0`   | **no**   |
| `current_value`      | A [float](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float) value representing the current value for the parameter.                                                                                                                                               | `0.0`   | **no**   |
| `min`                | A [float](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float) value representing the minimum value for the parameter, or for each component of a vector-valued channel.                                                                                             | `0.0`   | **no**   |
| `max`                | A [float](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float) value representing the maximum value for the parameter, or for each component of a vector-valued channel.                                                                                             | `1.0`   | **no**   |
| `clamped`            | A boolean value representing whether or not min and max are enforced.                                                                                                                                                                                                                                      | `false` | **no**   |
| `display_as_percent` | A boolean value representing whether or not the parameter value should be shown to the user as a percentage.                                                                                                                                                                                               | `false` | **no**   |
| `step_size`          | A [float](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float) value representing the step size, or paging size, to use for this parameter when presenting UI to the user.  Effectively a scaling value. Value applies to all components of a vector-valued channel. | `1.0`   | **no**   |
| `mappable`           | A boolean value representing whether or not the channel is mappable.                                                                                                                                                                                                                                       | `false` | **no**   |

<h3 id="dson-def-channel-float-details">Details</h3>


The current_value attribute is overridden anytime an animation is associated with the channel.





<h3 id="dson-def-channel-float-example">Example</h3>

```json
{
	"id" : "value",
	"type" : "float",
	"name" : "Dummy",
	"label" : "Dummy",
	"visible" : false,
	"locked" : true,
	"auto_follow" : true,
	"value" : 0,
	"current_value" : 0,
	"min" : -1,
	"max" : 1,
	"clamped" : true,
	"display_as_percent" : true,
	"step_size" : 0.04
}
```

---

<h2 id="dson-def-channel-image">channel_image</h2>

**Description:**
Defines properties of an image-valued channel. A channel_image channel type is used to create and address animatable channels that allow switching of an entire image at once.




<h3 id="dson-def-channel-image-appears-within">Appears within</h3>

- [`bulge_binding`](#dson-def-bulge-binding)
- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-channel-image-extends">Extends</h3>

- [`channel`](#dson-def-channel)

<h3 id="dson-def-channel-image-properties">Properties</h3>

| Name            | Description                                                | Default | Required |
| --------------- | ---------------------------------------------------------- | ------- | -------- |
| `value`         | A string representing the default value for the parameter. | `“”`    | **no**   |
| `current_value` | A string representing the current value for the parameter. | `“”`    | **no**   |

<h3 id="dson-def-channel-image-details">Details</h3>


The current_value attribute is overridden anytime an animation is associated with the channel.





<h3 id="dson-def-channel-image-example">Example</h3>

```json
{
	"id" : "size",
	"label" : "Size",
	"visible" : true,
	"locked" : true,
	"value" : "Standard",
	"current_value" : "Heavy"
}
```

---

<h2 id="dson-def-channel-int">channel_int</h2>

**Description:**
Defines properties of a integer-valued channel.




<h3 id="dson-def-channel-int-appears-within">Appears within</h3>

- [`bulge_binding`](#dson-def-bulge-binding)
- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-channel-int-extends">Extends</h3>

- [`channel`](#dson-def-channel)

<h3 id="dson-def-channel-int-properties">Properties</h3>

| Name            | Description                                                                                                                                                                                                                                                                                             | Default | Required |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `value`         | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) value representing the default value for the parameter.                                                                                                                                               | `0`     | **no**   |
| `current_value` | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) value representing the current value for the parameter.                                                                                                                                               | `0`     | **no**   |
| `min`           | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) value representing the minimum value for the parameter, or for each component of a vector-valued channel.                                                                                             | `0`     | **no**   |
| `max`           | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) value representing the maximum value for the parameter, or for each component of a vector-valued channel.                                                                                             | `1`     | **no**   |
| `clamped`       | A boolean value representing whether or not min and max are enforced.                                                                                                                                                                                                                                   | `false` | **no**   |
| `step_size`     | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) value representing the step size, or paging size, to use for this parameter when presenting UI to the user.  Effectively a scaling value. Value applies to all components of a vector-valued channel. | `1`     | **no**   |
| `mappable`      | A boolean value representing whether or not the channel is mappable.                                                                                                                                                                                                                                    | `false` | **no**   |

<h3 id="dson-def-channel-int-details">Details</h3>


The current_value attribute is overridden anytime an animation is associated with the channel.





<h3 id="dson-def-channel-int-example">Example</h3>

```json
{
	"id" : "value",
	"type" : "int",
	"name" : "Dummy",
	"label" : "Dummy",
	"visible" : false,
	"locked" : true,
	"auto_follow" : true,
	"value" : 0,
	"current_value" : 0,
	"min" : -1,
	"max" : 1,
	"clamped" : true,
	"step_size" : 1
}
```

---

<h2 id="dson-def-channel-string">channel_string</h2>

**Description:**
Defines properties of a string-valued channel.




<h3 id="dson-def-channel-string-appears-within">Appears within</h3>

- [`bulge_binding`](#dson-def-bulge-binding)
- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-channel-string-extends">Extends</h3>

- [`channel`](#dson-def-channel)

<h3 id="dson-def-channel-string-properties">Properties</h3>

| Name            | Description                                                | Default | Required |
| --------------- | ---------------------------------------------------------- | ------- | -------- |
| `value`         | A string representing the default value for the parameter. | `“”`    | **no**   |
| `current_value` | A string representing the current value for the parameter. | `“”`    | **no**   |

<h3 id="dson-def-channel-string-details">Details</h3>


The current_value attribute is overridden anytime an animation is associated with the channel.





<h3 id="dson-def-channel-string-example">Example</h3>

```json
{
	"id" : "size",
	"label" : "Size",
	"visible" : true,
	"locked" : true,
	"value" : "Standard",
	"current_value" : "Heavy"
}
```

---

<h2 id="dson-def-contributor">contributor</h2>

**Description:**
Information about an individual contributor.




<h3 id="dson-def-contributor-properties">Properties</h3>

| Name      | Description                                                 | Default | Required |
| --------- | ----------------------------------------------------------- | ------- | -------- |
| `author`  | A string representing the name of the contributor.          | `None`  | **yes**  |
| `email`   | A string representing the email address of the contributor. | `None`  | **no**   |
| `website` | A string representing the contributor's web site, if any.   | `None`  | **no**   |

<h3 id="dson-def-contributor-details">Details</h3>


This is an optional object that represents original author identification and contact info.





<h3 id="dson-def-contributor-example">Example</h3>

```json
{
	"author" : "John Doe",
	"email" : "john.doe@daz3d.com",
	"website" : "http://www.daz3d.com"
}
```

---

<h2 id="dson-def-daz">DAZ</h2>

**Description:**
A DAZ object is the top level object in a DSON format file.




<h3 id="dson-def-daz-properties">Properties</h3>

| Name               | Description                                                                                                              | Default | Required |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------- | -------- |
| `file_version`     | A string indicating the file format schema version to be used when parsing the file, in the form “major.minor.revision”. | `N/A`   | **yes**  |
| `asset_info`       | A base-level [asset_info](#dson-def-asset-info) object to apply to all assets within the file.                           | `N/A`   | **yes**  |
| `geometry_library` | An array of [geometry](#dson-def-geometry) assets defined in this file.                                                  | `None`  | **no**   |
| `node_library`     | An array of [node](#dson-def-node) assets defined in this file.                                                          | `None`  | **no**   |
| `uv_set_library`   | An array of [uv_set](#dson-def-uv-set) assets defined in this file.                                                      | `None`  | **no**   |
| `modifier_library` | An array of [modifier](#dson-def-modifier) assets defined in this file.                                                  | `None`  | **no**   |
| `image_library`    | An array of [image](#dson-def-image) assets defined in this file.                                                        | `None`  | **no**   |
| `material_library` | An array of [material](#dson-def-material) assets defined in this file.                                                  | `None`  | **no**   |
| `scene`            | A [scene](#dson-def-scene) object that instantiates and configures assets to add to a current scene.                     | `N/A`   | **no**   |

<h3 id="dson-def-daz-details">Details</h3>


A file must contain one or more of any of the *_library elements and/or a scene.





<h3 id="dson-def-daz-example">Example</h3>

```json
{
    “file_version” : “0.6.0.0”,
    “asset_info” : {
        /*  See asset_info  */
    },
    “geometry_library” : [
        {
            /*  See geometry  */
        }
    ],
    “node_library” : [
        {
            /*  See node  */
        }
    ],
    “uv_set_library” : [
        {
            /*  See uv_set  */
        }
    ],
    “modifier_library” : [
        {
            /*  See modifier  */
        }
    ],
    “image_library” : [
        {
            /*  See image  */
        }
    ],
    “material_library” : [
        {
            /*  See material  */
        }
    ],
    “scene” : {
        /*  See scene  */
    }
}
```

---

<h2 id="dson-def-formula">formula</h2>

**Description:**
Describes a set of operations and relationships to apply to a given property in the scene.




<h3 id="dson-def-formula-appears-within">Appears within</h3>

- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)

<h3 id="dson-def-formula-properties">Properties</h3>

| Name         | Description                                                                                                                                                                                                                                  | Default | Required |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `output`     | A string representing the object reference of the single-valued property to be targeted with the output from the formula.                                                                                                                    | `None`  | **yes**  |
| `operations` | An ordered array of [operation](#dson-def-operation) objects to apply, to derive the output value.                                                                                                                                           | `None`  | **yes**  |
| `stage`      | A string representing the calculation stage that this formula’s output contributes to.  May be one of “multiply” or “sum”.  See [Details](http://docs.daz3d.com/doku.php/public/dson_spec/object_definitions/formula/start#details) section. | `“sum”` | **no**   |

<h3 id="dson-def-formula-details">Details</h3>


The operations are given in [Reverse Polish Notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation) (RPN) and applied in order.  The output is the top-level operand remaining on the stack after applying all operations.



The operations array must contain at least one push operator and there must be at least one operand remaining on the stack at the end of the operation sequence, which will be pushed to the target channel.  If the stack contains insufficient entries for a given operator, the results of that operator are undefined.



Multiple formulas may output to the same property, and if they do there must be some logic to determine how the results will be accumulated onto the property.  The stage element allows a formula to specify how its output will be combined with other outputs that may target the same property.  The current implementation supports a two-stage combiner.  The outputs for all formulas that specify “multiply” as their stage will be multiplied together and the result multiplied by the sum of the outputs of all formulas that specify “sum” as their stage.

output = (sum1+sum2+sum3+...sumN) * multi1 * multi2 * multi3 *...*multiN


More stages may be introduced in the future to support more complex combinations of outputs.





<h3 id="dson-def-formula-example">Example</h3>

```json
{
    "output" : "upper_leg:figures/Unimesh#upper_leg?rotation/x",
    "operations" : [
        { "op" : "push", "url" : "hips:figures/UniMesh#hips?rotation/x" },
        { "op" : "push", "url" : "hips:figures/Daphne#DaphneHeadLarge?value" },
        { "op" : "push", "val" : 1.7 },
        { "op" : "add" },
        { "op" : "mult" },
    "stage" : "multiply"
    ]
}
```

---

<h2 id="dson-def-geometry">geometry</h2>

**Description:**
This is an asset that defines a polygon or subdivision mesh, including the region map, face grouping, material grouping, and reference to a default set of UV’s.




<h3 id="dson-def-geometry-appears-within">Appears within</h3>

- [`DAZ`](#dson-def-daz)

<h3 id="dson-def-geometry-properties">Properties</h3>

| Name                      | Description                                                                                                                                                                                                                        | Default              | Required |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------- |
| `id`                      | A string representing the unique ID for this asset within current file scope.                                                                                                                                                      | `None`               | **yes**  |
| `name`                    | A string representing the internal name for the geometry.                                                                                                                                                                          | `None`               | **no**   |
| `label`                   | A string representing the user-readable label for the geometry.                                                                                                                                                                    | `None`               | **no**   |
| `type`                    | A string representing the type of mesh represented by the vertex and facet data.  Must be either “polygon_mesh” or “subdivision_surface”.                                                                                          | `“polygon_mesh”`     | **no**   |
| `source`                  | A string representing the URI of any geometry asset that this asset was derived from.                                                                                                                                              | `“”`                 | **no**   |
| `edge_interpolation_mode` | A string representing the type of edge interpolation to perform during subdivision.  Must be one of “no_interpolation”,  “edges_and_corners”, or “edges_only”.  This is only valid when type is “subdivision_surface”.             | `“no_interpolation”` | **no**   |
| `vertices`                | A [float3_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float3_array) representing vertex positions of this geometry.                                                                 | `None`               | **yes**  |
| `polygon_groups`          | A [string_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#string_array) representing the face group names for this geometry.  Each name in the list must be unique within the list.     | `None`               | **yes**  |
| `polygon_material_groups` | A [string_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#string_array) representing the material group names for this geometry.  Each name in the list must be unique within the list. | `None`               | **yes**  |
| `polylist`                | A counted array of [polygon](#dson-def-polygon) objects.  Polygons may not contain holes.                                                                                                                                          | `N/A`                | **yes**  |
| `default_uv_set`          | A string representing the URI of a default UV set for this geometry.                                                                                                                                                               | `None`               | **no**   |
| `root_region`             | A [region](#dson-def-region) object representing the root region in the region hierarchy.                                                                                                                                          | `N/A`                | **no**   |
| `graft`                   | A [graft](#dson-def-graft) object representing geometry grafting information, if this object is intended to graft.                                                                                                                 | `N/A`                | **no**   |
| `rigidity`                | A [rigidity](#dson-def-rigidity) object representing the rigidity map that controls how vertex weight maps should be projected onto this geometry.                                                                                 | `N/A`                | **no**   |
| `extra`                   | An array of objects that represent additional application-specific information for this object.                                                                                                                                    | `N/A`                | **no**   |

<h3 id="dson-def-geometry-example">Example</h3>

```json
{
    "id" : "speedy",
    "vertices" : {
        "count" : 3,
        "values" : [
            [ 1.0876, 1.0876, 1.0876 ],
            [ 1.0876, 1.0876, 1.0876 ],
            [ 0.0, 1.0876, 2.0 ]
        ]
    },
    "polygon_groups" : {
        "count" : 3,
        "values" : [ "Head", "Neck", "Body" ]
    },
    "polygon_material_groups" : {
        "count" : 2,
        "values" : [ "Hair", "Back" ]
    },
    "polylist" : {
        "count" : 1,
        "values" : [ [ 1, 0, 0, 1, 2 ] ]
    },
    "default_uv_set" : "/DAZ/Speedy/DefaultUV.dsf#speedyuv",
    "root_region" : region
}
```

---

<h2 id="dson-def-geometry-instance">geometry_instance</h2>

**Description:**
Instantiates a geometry asset based on a [geometry](#dson-def-geometry) asset definition.




<h3 id="dson-def-geometry-instance-appears-within">Appears within</h3>

- [`node_instance`](#dson-def-node-instance)

<h3 id="dson-def-geometry-instance-properties">Properties</h3>

| Name  | Description                                                                                          | Default | Required |
| ----- | ---------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`  | A string representing the unique identifier for this instance within the file.                       | `None`  | **no**   |
| `url` | A string representing the URI of the [geometry](#dson-def-geometry) asset definition to instantiate. | `None`  | **yes**  |

<h3 id="dson-def-geometry-instance-details">Details</h3>


If the id property is not present, the geometry_instance becomes a reference used to look up a geometry instance within the currently loaded scene that uses the geometry definition given in the url field.  Otherwise, it creates a new instance in the scene using the definition of the geometry asset given in the url field.



A geometry_instance may override any of the properties of the [geometry](#dson-def-geometry) asset it is based on, with the exception of the id property.





<h3 id="dson-def-geometry-instance-example">Example</h3>

```json
{
    "id" : "myfigure",
    "url" : "#speedy"
}
```

---

<h2 id="dson-def-graft">graft</h2>

**Description:**
Definition for how to graft one figure's geometry to another.




<h3 id="dson-def-graft-appears-within">Appears within</h3>

- [`geometry`](#dson-def-geometry)

<h3 id="dson-def-graft-properties">Properties</h3>

| Name           | Description                                                                                                                                                                                                                                                        | Default | Required |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------- |
| `vertex_count` | The number of vertices expected to exist in the target geometry.                                                                                                                                                                                                   | `None`  | **yes**  |
| `poly_count`   | The number of polygons expected to exist in the target geometry.                                                                                                                                                                                                   | `None`  | **yes**  |
| `vertex_pairs` | A [int2_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) of vertex index pairs.  The first index being the index into the source vertex list and the second index being the index into the target geometry vertex list. | `N/A`   | **yes**  |
| `hidden_polys` | A [int_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) of polygon indices on the target geometry that should be hidden.                                                                                                | `N/A`   | **yes**  |

<h3 id="dson-def-graft-details">Details</h3>


The vertex_pairs property is composed of an array of vertex pairs where the first element in each pair is the index into the source geometry vertex array (i.e. the geometry that contains this snap_target definition), and the second element in each pair is the index into the vertex array for the target geometry.



The hidden_polys indices indicate which polygons on the target geometry should be hidden when the geometry for the snapping is attached.





<h3 id="dson-def-graft-example">Example</h3>

```json
{
    "vertex_count" : 345,
    "poly_count" : 321,
    "vertex_pairs" : {
      "count" : 3,
      "values" : [ [ 2, 334 ], [ 3, 723 ], [ 6, 219 ] ]
    },
    "hidden_polys" : {
      "count" : 6,
      "values" : [ 67, 23, 87, 89, 12, 90 ]
    }
}
```

---

<h2 id="dson-def-image">image</h2>

**Description:**
Defines an image asset.




<h3 id="dson-def-image-appears-within">Appears within</h3>

- [`DAZ`](#dson-def-daz)

<h3 id="dson-def-image-properties">Properties</h3>

| Name        | Description                                                                                                               | Default | Required |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`        | The unique ID for this instance within the file.                                                                          | `None`  | **yes**  |
| `name`      | The internal name of the image.                                                                                           | `None`  | **yes**  |
| `source`    | The URI of the image asset that this image was derived from, if any.                                                      | `“”`    | **no**   |
| `map_gamma` | A float representing the gamma of the image.                                                                              | `0`     | **no**   |
| `map_size`  | The preferred image size to apply to the composed map.                                                                    | `None`  | **no**   |
| `map`       | An array (stack) of [image_map](#dson-def-image-map) objects used to define per-pixel properties of the material channel. | `None`  | **no**   |

<h3 id="dson-def-image-details">Details</h3>


The map property defines a stack of images to be interpreted as individual layers.  The first image in the stack defines the bottom layer, and each subsequent image represents an additional layer.  The operation property of the layer is ignored for the bottom layer (first entry in the map array), but for other layers it defines how the image should be composited into the image chain.  The map property must contain at least one [image_map](#dson-def-image-map) definition.



The map_gamma property defines the gamma of the image if a map property is present.  A value that is less than or equal to zero (0) is interpreted to mean that it is up to the application to determine the gamma of the image.  A value greater than zero (0) is interpreted to be the gamma encoding of the pixels in the image.



The map_size property defines the final image size of the output image if a map element is present, but also defines the size at which all layer images will be composited if more than one image is given in the map stack.  If an image differs than this size upon import, it should be scaled to size before applying compositing operations in the map stack.  The DSON format does not dictate whether image operations like scaling, rotating, and flipping should occur before or after any necessary image resizing in the map stack.



If the map_size element is missing when a map is present, the output size of the map stack is application-defined.





<h3 id="dson-def-image-example">Example</h3>

```json
{
    "id" : "decal24",
    "name" : "Golden Dragon",
    "map" : [
        {
            "url" : "Images/Happy/Goofy.jpg",
            "label" : "Goofy",
            "color" : [ 1.0, 0.2, 0.34 ],
            "transparency" : 0.67,
            "rotation" : 20.3,
            "ymirror" : true,
            "xscale" : 1.7,
            "xoffset" : -0.43,
        },
        {
            "url" : "Images/HeavyLightmap.jpg",
            "label" : "Heavy Light Map",
            "color" : [ 1.0, 0.2, 0.34 ],
            "transparency" : 0.4,
            "operation" : "add",
        }
    ]
}
```

---

<h2 id="dson-def-image-map">image_map</h2>

**Description:**
Defines an image map that can be composited with other image maps in a stack to define a single output map.




<h3 id="dson-def-image-map-appears-within">Appears within</h3>

- [`image`](#dson-def-image)

<h3 id="dson-def-image-map-properties">Properties</h3>

| Name           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Default     | Required |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| `url`          | A string representing the URI of an image file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `None`      | **no**   |
| `label`        | A string representing the user-facing label for the image.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `None`      | **yes**  |
| `active`       | A boolean value representing whether or not the layer is contributing to the final result.   Since [file_version](http://docs.daz3d.com/doku.php/public/dson_spec/object_definitions/daz/start) 0.6.1.0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `true`      | **no**   |
| `color`        | A [float3](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float3) representing the R,G,B values as 0-1 values.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `[1, 1, 1]` | **no**   |
| `transparency` | A float value representing the layer opacity in the [0,1] range, where 1 = opaque.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `1`         | **no**   |
| `invert`       | A boolean value representing whether to invert the colors in the layer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `false`     | **no**   |
| `rotation`     | A float value representing a rotation about the center point, given in degrees.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `0`         | **no**   |
| `xmirror`      | A boolean value representing whether the source image will be mirrored across the horizontal (x) axis.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `false`     | **no**   |
| `ymirror`      | A boolean value representing whether the source image will be mirrored across the vertical (y) axis.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `false`     | **no**   |
| `xscale`       | A float value representing the scaling to apply along horizontal (x) axis.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `1`         | **no**   |
| `yscale`       | A float value representing the scaling to apply along vertical (y) axis.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `1`         | **no**   |
| `xoffset`      | A float value representing the normalized offset to apply along the horizontal (x) axis.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `0`         | **no**   |
| `yoffset`      | A float value representing the normalized offset to apply along the vertical (y) axis.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `0`         | **no**   |
| `operation`    | A string representing the layer operation. Valid values are: alpha_blend, add, subtract and multiply.   As of [file_version](http://docs.daz3d.com/doku.php/public/dson_spec/object_definitions/daz/start) 0.6.1.0, the following values are also valid: blend_clear, blend_color_burn, blend_color_dodge, blend_darken, blend_destination, blend_destination_atop, blend_destination_in, blend_destination_out, blend_destination_over, blend_difference, blend_exclusion, blend_hard_light, blend_lighten, blend_multiply, blend_overlay, blend_plus, blend_screen, blend_soft_light, blend_source, blend_source_atop, blend_source_in, blend_source_out, blend_source_over, blend_xor. | `None`      | **no**   |

<h3 id="dson-def-image-map-details">Details</h3>


The xoffset and yoffset are given in normalized coordinates such that a value of 1.0 offsets by the full image size in that dimension.  Negative offset values are allowed.





<h3 id="dson-def-image-map-example">Example</h3>

```json
{
    "url" : "/Happy/Images/Goofy.jpg",
    "label" : "Goofy.jpg",
    "color" : [ 1.0, 0.2, 0.34 ],
    "transparency" : 0.67,
    "rotation" : 20.3,
    "ymirror" : true,
    "xscale" : 1.7,
    "xoffset" : -0.43,
    "operation" : "add",
}
```

---

<h2 id="dson-def-light">light</h2>

**Description:**
Extra properties available for use if the node type is specified as “light”.




<h3 id="dson-def-light-extends">Extends</h3>

- [`node`](#dson-def-node)

<h3 id="dson-def-light-properties">Properties</h3>

| Name          | Description                                                                                           | Default     | Required |
| ------------- | ----------------------------------------------------------------------------------------------------- | ----------- | -------- |
| `color`       | RGB color value for the light.                                                                        | `[1, 1, 1]` | **no**   |
| `point`       | A [light_point](#dson-def-light-point) object definition, if this is a point light.                   | `N/A`       | **no**   |
| `directional` | A [light_directional](#dson-def-light-directional) object definition, if this is a directional light. | `N/A`       | **no**   |
| `spot`        | A [light_spot](#dson-def-light-spot) object definition, if this is a spot light.                      | `N/A`       | **no**   |
| `on`          | A boolean value indicating whether the light is on.                                                   | `true`      | **no**   |

<h3 id="dson-def-light-details">Details</h3>


Only one of point, directional, or spot may appear.  If none are given, the light is an ambient light, in which case the light transform information does not affect the light.





<h3 id="dson-def-light-example">Example</h3>

```json
{
	"id" : "sun67",
	"type" : "light",
	"label" : "Sun",
	"color" : [ 0.45, 0.89, 0.12 ],
	"directional" : {
		"intensity" : 0.34,
		"shadow_type" : "shadow_map",
		"shadow_softness" : 3.0,
		"shadow_bias" : 2.8,
	},
	"on" : false,
	"translation" : {
		"value" : [ 0.00, 0.00, 1.00 ]
	},
	"rotation" : {
		"value" : [ 1.00, 0.00, 1.89 ]
	},
	"scale" : {
		"value" : [ 1.0, 1.0, 1.0 ]
	}
}
```

---

<h2 id="dson-def-light-directional">light_directional</h2>

**Description:**
An object that defines properties of a directional light source.




<h3 id="dson-def-light-directional-appears-within">Appears within</h3>

- [`light`](#dson-def-light)

<h3 id="dson-def-light-directional-properties">Properties</h3>

| Name              | Description                                                                                       | Default   | Required     |
| ----------------- | ------------------------------------------------------------------------------------------------- | --------- | ------------ |
| `Name`            | Description                                                                                       | `Default` | **Required** |
| `intensity`       | Light intensity, in the [0, 1] range                                                              | `1.0`     | **no**       |
| `shadow_type`     | Type of shadowing to use for this light.  Valid values are “none”, “shadow_map”, and “raytraced”. | `“none”`  | **no**       |
| `shadow_softness` | If the light casts shadows, this is the softness factor to apply to the shadow.                   | `0.0`     | **no**       |
| `shadow_bias`     | For shadow mapped shadows, this is the shadow bias.                                               | `1.0`     | **no**       |

<h3 id="dson-def-light-directional-example">Example</h3>

```json
{
    "intensity" : 0.34,
    "shadow_type" : "shadow_map",
    "shadow_softness" : 3.0,
    "shadow_bias" : 2.8,
}
```

---

<h2 id="dson-def-light-point">light_point</h2>

**Description:**
An object that defines properties of a point light source.




<h3 id="dson-def-light-point-appears-within">Appears within</h3>

- [`light`](#dson-def-light)

<h3 id="dson-def-light-point-properties">Properties</h3>

| Name                    | Description                                                                                       | Default  | Required |
| ----------------------- | ------------------------------------------------------------------------------------------------- | -------- | -------- |
| `intensity`             | Light intensity, in the [0, 1] range                                                              | `1.0`    | **no**   |
| `shadow_type`           | Type of shadowing to use for this light.  Valid values are “none”, “shadow_map”, and “raytraced”. | `“none”` | **no**   |
| `shadow_softness`       | If the light casts shadows, this is the softness factor to apply to the shadow.                   | `0.0`    | **no**   |
| `shadow_bias`           | For shadow mapped shadows, this is the shadow bias.                                               | `1.0`    | **no**   |
| `constant_attenuation`  | See Details                                                                                       | `1.0`    | **no**   |
| `linear_attenuation`    | See Details                                                                                       | `0.0`    | **no**   |
| `quadratic_attenuation` | See Details                                                                                       | `0.0`    | **no**   |

<h3 id="dson-def-light-point-details">Details</h3>


The constant_attenuation, linear_attenuation, and quadratic_attenuation are used to calculate the total attenuation of this light given a distance. The equation used is:



color_scaling = constant_attenuation + ( Dist * linear_attenuation ) + (( Dist^2 ) * quadratic_attenuation )





<h3 id="dson-def-light-point-example">Example</h3>

```json
{
    "intensity" : 0.34,
    "shadow_type" : "shadow_map",
    "shadow_softness" : 3.0,
    "shadow_bias" : 2.8,
    "constant_attenuation" : 0.8
}
```

---

<h2 id="dson-def-light-spot">light_spot</h2>

**Description:**
An object that defines properties of a spot light source.




<h3 id="dson-def-light-spot-appears-within">Appears within</h3>

- [`light`](#dson-def-light)

<h3 id="dson-def-light-spot-properties">Properties</h3>

| Name                    | Description                                                                                       | Default         | Required |
| ----------------------- | ------------------------------------------------------------------------------------------------- | --------------- | -------- |
| `intensity`             | Light intensity, in the [0, 1] range                                                              | `1.0`           | **no**   |
| `shadow_type`           | Type of shadowing to use for this light.  Valid values are “none”, “shadow_map”, and “raytraced”. | `“none”`        | **no**   |
| `shadow_softness`       | If the light casts shadows, this is the softness factor to apply to the shadow.                   | `0.0`           | **no**   |
| `shadow_bias`           | For shadow mapped shadows, this is the shadow bias.                                               | `1.0`           | **no**   |
| `constant_attenuation`  | See Details                                                                                       | `1.0`           | **no**   |
| `linear_attenuation`    | See Details                                                                                       | `0.0`           | **no**   |
| `quadratic_attenuation` | See Details                                                                                       | `0.0`           | **no**   |
| `falloff_angle`         | See Details                                                                                       | `180.0 degrees` | **no**   |
| `falloff_exponent`      | See Details                                                                                       | `0.0`           | **no**   |

<h3 id="dson-def-light-spot-details">Details</h3>


The constant_attenuation, linear_attenuation, and quadratic_attenuation are used to calculate the total attenuation of this light given a distance. The equation used is:



color_scaling = constant_attenuation + ( Dist * linear_attenuation ) + (( Dist^2 ) * quadratic_attenuation )



The falloff_angle and falloff_exponent are used to specify the amount of attenuation based on the direction of the light.





<h3 id="dson-def-light-spot-example">Example</h3>

```json
{
    "intensity" : 0.34,
    "shadow_type" : "shadow_map",
    "shadow_softness" : 3.0,
    "shadow_bias" : 2.8,
    "constant_attenuation" : 0.8,
    "falloff_angle" : 25.0
}
```

---

<h2 id="dson-def-material">material</h2>

**Description:**
Definition of a material asset.




<h3 id="dson-def-material-appears-within">Appears within</h3>

- [`DAZ`](#dson-def-daz)

<h3 id="dson-def-material-properties">Properties</h3>

| Name                  | Description                                                                                                                     | Default | Required |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`                  | A string representing the unique identifier for this asset within current file scope.                                           | `None`  | **yes**  |
| `name`                | A string representing the internal name of the material.                                                                        | `None`  | **no**   |
| `label`               | A string representing the user-readable default label.                                                                          | `None`  | **no**   |
| `source`              | A string representing the URI of the material asset that this asset was derived from, if any.                                   | `“”`    | **no**   |
| `uv_set`              | A string representing the URI of a [uv_set](#dson-def-uv-set) asset that should be active for this material.                    | `None`  | **no**   |
| `type`                | A string representing a hint for the receiving application about what type of shader to use (i.e. glass, metal, plastic, skin). | `None`  | **no**   |
| `diffuse`             | A [material_channel](#dson-def-material-channel) defining the diffuse for this material.                                        | `N/A`   | **no**   |
| `diffuse_strength`    | A [material_channel](#dson-def-material-channel) defining the diffuse for this material.                                        | `N/A`   | **no**   |
| `specular`            | A [material_channel](#dson-def-material-channel) defining the specular for this material.                                       | `N/A`   | **no**   |
| `specular_strength`   | A [material_channel](#dson-def-material-channel) defining the specular for this material.                                       | `N/A`   | **no**   |
| `glossiness`          | A [material_channel](#dson-def-material-channel) defining the glossiness for this material.                                     | `1.0`   | **no**   |
| `ambient`             | A [material_channel](#dson-def-material-channel) defining the ambient for this material.                                        | `N/A`   | **no**   |
| `ambient_strength`    | A [material_channel](#dson-def-material-channel) defining the ambient for this material.                                        | `N/A`   | **no**   |
| `reflection`          | A [material_channel](#dson-def-material-channel) defining the reflection for this material.                                     | `N/A`   | **no**   |
| `reflection_strength` | A [material_channel](#dson-def-material-channel) defining the reflection for this material.                                     | `N/A`   | **no**   |
| `refraction`          | A [material_channel](#dson-def-material-channel) defining the refraction for this material.                                     | `N/A`   | **no**   |
| `refraction_strength` | A [material_channel](#dson-def-material-channel) defining the refraction for this material.                                     | `N/A`   | **no**   |
| `ior`                 | A [material_channel](#dson-def-material-channel) defining the index of refraction for this material.                            | `0.0`   | **no**   |
| `bump`                | A [material_channel](#dson-def-material-channel) defining the bump for this material.                                           | `N/A`   | **no**   |
| `bump_min`            | A [material_channel](#dson-def-material-channel) defining the bump min                                                          | `-0.01` | **no**   |
| `bump_max`            | A [material_channel](#dson-def-material-channel) defining the bump max                                                          | `0.01`  | **no**   |
| `displacement`        | A [material_channel](#dson-def-material-channel) defining the displacement for this material.                                   | `N/A`   | **no**   |
| `displacement_min`    | A [material_channel](#dson-def-material-channel) defining the displacement min                                                  | `-0.01` | **no**   |
| `displacement_max`    | A [material_channel](#dson-def-material-channel) defining the displacement max                                                  | `0.01`  | **no**   |
| `transparency`        | A [material_channel](#dson-def-material-channel) defining the transparency for this material.                                   | `N/A`   | **no**   |
| `normal`              | A [material_channel](#dson-def-material-channel) defining the normal map for this material.                                     | `N/A`   | **no**   |
| `u_offset`            | A [material_channel](#dson-def-material-channel) defining the UV coordinate offset in the u direction.                          | `0.0`   | **no**   |
| `u_scale`             | A [material_channel](#dson-def-material-channel) defining the UV coordinate scale in the u direction.                           | `1.0`   | **no**   |
| `v_offfset`           | A [material_channel](#dson-def-material-channel) defining the UV coordinate offset in the v direction.                          | `0.0`   | **no**   |
| `v_scale`             | A [material_channel](#dson-def-material-channel) defining the UV coordinate scale in the v direction.                           | `1.0`   | **no**   |
| `extra`               | An array of objects that represent additional application-specific information for this object.                                 | `N/A`   | **no**   |

<h3 id="dson-def-material-details">Details</h3>


Most of the fields in this definition are default values that may be overridden via a [material_instance](#dson-def-material-instance).





<h3 id="dson-def-material-example">Example</h3>

```json
{
    "id" : "bumpglass",
    "label" : "BumpyGlass",
    "type" : "glass",
    "diffuse" : material_channel,
    "diffuse_strength" : material_channel,
    "specular" : material_channel,
    "specular_strength" : material_channel,
    "glossiness" : material_channel,
    "ambient": material_channel,
    "reflection" : material_channel,
    "refraction" : material_channel,
    "ior" : material_channel,
    "bump" : material_channel,
    "bump_min" : material_channel,
    "bump_max" : material_channel,
    "transparency" : material_channel
}
```

---

<h2 id="dson-def-material-channel">material_channel</h2>

**Description:**
This object defines channel properties for a particular property of a material, such as diffuse color, specular color, etc. A [material](#dson-def-material) object will typically define a collection of material_channel objects to describe each property of the material.




<h3 id="dson-def-material-channel-appears-within">Appears within</h3>

- [`material`](#dson-def-material)

<h3 id="dson-def-material-channel-properties">Properties</h3>

| Name       | Description                                                                                                                                         | Default | Required |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `channel`  | A [channel](#dson-def-channel) definition.                                                                                                          | `N/A`   | **no**   |
| `group`    | A string representing a slash-delimited (“/”) path indicating the channel’s group for data pathing and presentation in the UI.                      | `“/”`   | **no**   |
| `color`    | A [float3](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) RGB color as a vector of values in the range [0, 1] | `None`  | **no**   |
| `strength` | A float strength value in range [0, 1]                                                                                                              | `None`  | **no**   |
| `image`    | A string representing the URI to a valid image file                                                                                                 | `None`  | **no**   |

<h3 id="dson-def-material-channel-details">Details</h3>


This type can be extended to include strength and color values that either multiply by the given map or act as the full value for the material channel.



At least one of strength or color is required to be present if image is present.





<h3 id="dson-def-material-channel-example">Example</h3>

```json
{
  "channel" : {
  	"id" : "glossiness",
  	"type" : "float",
  	"name" : "Glossiness",
  	"label" : "Glossiness",
  	"value" : 1,
  	"min" : 0,
  	"max" : 1,
  	"clamped" : true,
  	"display_as_percent" : true,
  	"step_size" : 0.01,
  	"mappable" : true
  },
  "group" : "/Specular"
  "color" : [ 0.24, 0.45, 0.19 ],
  "image" : "DAZ/Materials/Skin.dsf#skin12"
}
```

---

<h2 id="dson-def-material-instance">material_instance</h2>

**Description:**
Defines properties of a material binding for a collection of material groups.




<h3 id="dson-def-material-instance-appears-within">Appears within</h3>

- [`scene`](#dson-def-scene)

<h3 id="dson-def-material-instance-properties">Properties</h3>

| Name       | Description                                                                                                                                                                                  | Default | Required |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`       | A string representing the unique identifier within the file                                                                                                                                  | `None`  | **yes**  |
| `url`      | A string representing the URI of a [material](#dson-def-material) asset definition to instantiate                                                                                            | `None`  | **no**   |
| `geometry` | A string representing the scene reference to a [geometry](#dson-def-geometry) definition to attach to.                                                                                       | `None`  | **no**   |
| `groups`   | A [string_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) of polygon group names (see [geometry](#dson-def-geometry)) to attach the material to. | `None`  | **yes**  |

<h3 id="dson-def-material-instance-details">Details</h3>


This is an instance class that may override defaults in the referenced [material](#dson-def-material) definition. All fields of the [material](#dson-def-material) definition, with the exception of the id and uv_set fields, may be overridden in this instance element.





<h3 id="dson-def-material-instance-example">Example</h3>

```json
{
  "id" : "6_Eyelash-1",
  "url" : "#6_Eyelash",
  "geometry" : "#geometry",
  "groups" : [ "6_Eyelash" ],
}
```

---

<h2 id="dson-def-modifier">modifier</h2>

**Description:**
This element defines an individual modifier asset for a morph, a skin binding, a channel, or an application-defined modifier type.




<h3 id="dson-def-modifier-appears-within">Appears within</h3>

- [`DAZ`](#dson-def-daz)

<h3 id="dson-def-modifier-properties">Properties</h3>

| Name           | Description                                                                                                                              | Default | Required |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`           | A string representing the unique ID for this asset within current file scope.                                                            | `None`  | **yes**  |
| `name`         | A string representing the “internal” name for this object.  Generally unique within any sibling modifiers.                               | `“”`    | **no**   |
| `label`        | A string representing the user-readable label for the modifier.                                                                          | `None`  | **no**   |
| `source`       | A string representing the URI of the modifier asset that this modifier was derived from, if any.                                         | `“”`    | **no**   |
| `parent`       | A string representing the URI of the parent definition.  A parent must appear above a child in the file.                                 | `None`  | **no**   |
| `presentation` | A [presentation](#dson-def-presentation) containing metadata used to present an asset to the user, if this asset is a user-facing asset. | `N/A`   | **no**   |
| `channel`      | A [channel](#dson-def-channel) definition.                                                                                               | `N/A`   | **no**   |
| `region`       | A string representing the [region](#dson-def-region) that the modifier should appear in.                                                 | `None`  | **no**   |
| `group`        | A string representing a slash-delimited (“/”) path indicating the modifier’s group for data pathing and presentation in the UI.          | `“/”`   | **no**   |
| `formulas`     | An array of [formula](#dson-def-formula) objects owned by this modifier.                                                                 | `N/A`   | **no**   |
| `morph`        | Any [morph](#dson-def-morph) attached to this modifier.                                                                                  | `N/A`   | **no**   |
| `skin`         | Any [skin_binding](#dson-def-skin-binding) attached to this modifier.                                                                    | `N/A`   | **no**   |
| `extra`        | An array of objects that represent additional application-specific information for this object.                                          | `N/A`   | **no**   |

<h3 id="dson-def-modifier-details">Details</h3>


The morph and skin properties are mutually exclusive.  A modifier may exist without either a morph or a skin defined, in which case it may become a data repository and a channel that can be used as input and output for a [formula](#dson-def-formula).



For any user-facing morphs, the region should be specified, so that the modifier can display in the interface for regional selection.  Skin bindings and corrective morphs usually do not require any user presentation so do not need regions defined for them.



The name attribute may be used by applications to provide another addressing mechanism for nodes in the scene. In object URI’s, if “name” is used as the scheme identifier, then the value of the name attribute is used to look up an item rather than using the id attribute. If the name attribute is missing, applications should use the id attribute in its place wherever needed.





<h3 id="dson-def-modifier-example">Example</h3>

```json
{
    "id" : "smile",
    "channel" : {
	"id" : "x",
	"label" : "Side-Side",
	"visible" : true,
	"locked" : true,
	"min" : 0.0,
	"max" : 1.0,
	"clamped" : true,
	"display_as_percent" : false,
	"step_size" : 2.0,
	"value" : 0.0
    },
    "group" : "Micro/Happy",
    "region" : "Face",
    "morph" : {
        "vertex_count" : 4,
        "deltas" : {
            "count" : 2,
            "values" : [
                [ 0, 1.23, 2.34, 3.45 ],
                [ 3, 1.23, 2.45, 3.56 ]
            ]
        }
    }
    "formulas" :
    [
        {
            "output" : "upper_leg:figures/Unimesh#upper_leg?rotation/x",
            "operations" : [
                { "op" : "push", "url" : "hips:figures/UniMesh#hips?rotation/x" },
                { "op" : "push", "url" : "hips:figures/Daphne#DaphneHeadLarge?value" },
                { "op" : "push", "val" : 1.7 },
                { "op" : "add" },
                { "op" : "mult" }
            ]
        }
    ]
}
```

---

<h2 id="dson-def-modifier-instance">modifier_instance</h2>

**Description:**
This object instantiates a [modifier](#dson-def-modifier).




<h3 id="dson-def-modifier-instance-appears-within">Appears within</h3>

- [`scene`](#dson-def-scene)

<h3 id="dson-def-modifier-instance-properties">Properties</h3>

| Name     | Description                                                                                                      | Default | Required |
| -------- | ---------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`     | A string representing the unique identifier for this item within the scope of the file.                          | `None`  | **yes**  |
| `parent` | A string representing the URI of the [node](#dson-def-node) or element that this modifier instance is affecting. | `None`  | **yes**  |
| `url`    | A string representing the URI of the [modifier](#dson-def-modifier) asset definition to instantiate.             | `None`  | **yes**  |

<h3 id="dson-def-modifier-instance-details">Details</h3>


Most properties of modifier can be overridden in modifier_instance.  The only properties that cannot be overridden are id and presentation. For any properties that are overridden which are URI’s, the URI must point to an instance element, not a definition.





<h3 id="dson-def-modifier-instance-example">Example</h3>

```json
{
    "id" : "smile",
    "parent" : "hips:#hips",
    "url" : "/DAZ/Victoria/Body/Daphne.dsf#smile"
}
```

---

<h2 id="dson-def-morph">morph</h2>

**Description:**
Defines a set of sparse morph deltas.




<h3 id="dson-def-morph-appears-within">Appears within</h3>

- [`modifier`](#dson-def-modifier)

<h3 id="dson-def-morph-properties">Properties</h3>

| Name           | Description                                                                                                                        | Default | Required |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `vertex_count` | An int representing the number of vertices expected in the target geometry.                                                        | `0`     | **yes**  |
| `deltas`       | A [float3_indexed_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) of the morph deltas. | `None`  | **yes**  |
| `extra`        | An array of objects that represent additional application-specific information for this object.                                    | `N/A`   | **no**   |

<h3 id="dson-def-morph-example">Example</h3>

```json
{
    "vertex_count" : 4,
    "deltas" : {
        "count" : 2,
        "values" : [
            [0, 1.23, 2.34, 3.45],
            [3, 1.23, 2.45, 3.56]
        ]
    }
}
```

---

<h2 id="dson-def-named-string-map">named_string_map</h2>

**Description:**
Defines a mapping between face groups on geometry objects and nodes.




<h3 id="dson-def-named-string-map-appears-within">Appears within</h3>

- [`skin_binding`](#dson-def-skin-binding)

<h3 id="dson-def-named-string-map-properties">Properties</h3>

| Name       | Description                                                                                                                                | Default | Required |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------- |
| `id`       | A string representing the name of the selection set.  Needs to be unique in the list of selection sets that this selection set belongs to. | `None`  | **yes**  |
| `mappings` | An array of string pairs (face group name, node name) that define the mapping.                                                             | `None`  | **yes**  |

<h3 id="dson-def-named-string-map-example">Example</h3>

```json
{
   "id": "Bones",
    "mappings":
    [
        [ string, string ],
        [ string, string ],
        [ string, string ]
        ...
    ]
}
```

---

<h2 id="dson-def-node">node</h2>

**Description:**
This object defines a node that makes up part of a node hierarchy. It can represent nodes of a variety of types such as bones and figure roots.




<h3 id="dson-def-node-extended-by">Extended By</h3>

- [`camera`](#dson-def-camera)
- [`light`](#dson-def-light)

<h3 id="dson-def-node-properties">Properties</h3>

| Name             | Description                                                                                                                                                                                                                                                     | Default                                       | Required |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------- |
| `id`             | A string representing the unique ID for this asset within the current file scope.                                                                                                                                                                               | `None`                                        | **yes**  |
| `name`           | A string representing the “internal” name for this node.  Generally unique within any sibling nodes.                                                                                                                                                            | `None`                                        | **yes**  |
| `type`           | A string representing the base type for this node.  Can be “node”, “bone”, “figure”, “camera”, or “light”.  See [Extended By](#dson-def-node-extended_by).                                                                                                      | `“node”`                                      | **no**   |
| `label`          | A string representing the user facing label for this node.                                                                                                                                                                                                      | `None`                                        | **yes**  |
| `source`         | A string representing the URI of the node asset that this node asset was derived from.                                                                                                                                                                          | `“”`                                          | **no**   |
| `parent`         | A string representing the URI of the parent node definition.  Parents must appear above children in the file.                                                                                                                                                   | `None`                                        | **no**   |
| `rotation_order` | A string representing the rotation order to use when interpreting channel-based animation data for this node.  Valid values are “XYZ”, “YZX”, “ZYX”, “ZXY”, “XZY”, and “YXZ”.                                                                                   | `“XYZ”`                                       | **no**   |
| `inherits_scale` | A boolean value indicating whether or not the immediate parent node's local scale is compensated for when calculating this node's world space transform. If false, this node's world space transform is multiplied by the inverse of parent node's local scale. | `true (except for a bone with a bone parent)` | **no**   |
| `center_point`   | An array of x, y, and z [channel_float](#dson-def-channel-float) definitions for the center point of this node.                                                                                                                                                 | `[0, 0, 0 ]`                                  | **no**   |
| `end_point`      | An array of x, y, and z [channel_float](#dson-def-channel-float) definitions for the end point of this node.                                                                                                                                                    | `[0, 0, 0 ]`                                  | **no**   |
| `orientation`    | An array of x, y, and z [channel_float](#dson-def-channel-float) definitions for the (Euler) rotation of this node.                                                                                                                                             | `[0, 0, 1, 0]`                                | **no**   |
| `rotation`       | An array of x, y, and z [channel_float](#dson-def-channel-float) definitions for the (Euler) rotation of this node.                                                                                                                                             | `[0, 0, 0] (for “value”)`                     | **no**   |
| `translation`    | An array of x, y, and z [channel_float](#dson-def-channel-float) definitions for the translation of this node.                                                                                                                                                  | `[0, 0, 0 ] (for “value”)`                    | **no**   |
| `scale`          | An array of x, y, and z [channel_float](#dson-def-channel-float) definitions for the individual (i.e. x, y, or z-axis) scale of this node.                                                                                                                      | `[1, 1, 1] (for “value”)`                     | **no**   |
| `general_scale`  | A [channel_float](#dson-def-channel-float) definition for the general (i.e. 3-axis) scale of this node.                                                                                                                                                         | `1 (for “value”)`                             | **no**   |
| `presentation`   | A [presentation](#dson-def-presentation) object representing the user-facing presentation information for this node.                                                                                                                                            | `N/A`                                         | **no**   |
| `formulas`       | An array of [formula](#dson-def-formula) objects owned by this node.                                                                                                                                                                                            | `N/A`                                         | **no**   |
| `extra`          | An array of objects that represent additional application-specific information for this object.                                                                                                                                                                 | `N/A`                                         | **no**   |

<h3 id="dson-def-node-details">Details</h3>


If type is set to “figure” then this node is understood to be the root node of a figure.



The name attribute may be used by applications to provide another addressing mechanism for nodes in the scene. In object URI’s, if “name” is used as the scheme identifier, then the value of the name attribute is used to look up an item rather than using the id attribute. If the name attribute is missing, applications should use the id attribute in its place wherever needed.



The translation, rotation, scale, and general_scale elements each represent transforms that convert to transform matrices.  To arrive at the full base transform for the node, each of those elements is converted to matrix form.  The full transform for a node is determined using the following algorithm:


 center_offset = center_point - parent.center_point

 global_translation = parent.global_transform * (center_offset + translation)

 global_rotation = parent.global_rotation * orientation * rotation * (orientation)-1

 global_scale for nodes that inherit scale = parent.global_scale * orientation * scale * general_scale * (orientation)-1

 global_scale for nodes = parent.global_scale * (parent.local_scale)-1 * orientation * scale * general_scale * (orientation)-1

 global_transform = global_translation * global_rotation * global_scale




Vertices are taken to global space by post-multiplying as follows:


 global_vertex = global_transform * vertex






<h3 id="dson-def-node-example">Example</h3>

```json
{
	"id" : "hip",
	"type" : "bone",
	"label" : "Hip",
	"parent" : "#Genesis",
	"rotation_order" : "YZX",
	"inherits_scale" : true,
	"center_point" : [
		channel_float,
		channel_float,
		channel_float
	],
	"end_point" : [
		channel_float,
		channel_float,
		channel_float
	],
	"orientation" : [
		channel_float,
		channel_float,
		channel_float
	],
	"rotation" : [
		channel_float,
		channel_float,
		channel_float
	],
	"translation" : [
		channel_float,
		channel_float,
		channel_float
	],
	"scale" : [
		channel_float,
		channel_float,
		channel_float
	],
	"general_scale" : channel_float
}
```

---

<h2 id="dson-def-node-instance">node_instance</h2>

**Description:**
This object instantiates a new node in the scene.




<h3 id="dson-def-node-instance-appears-within">Appears within</h3>

- [`scene`](#dson-def-scene)

<h3 id="dson-def-node-instance-properties">Properties</h3>

| Name              | Description                                                                                                                                                                                                                     | Default | Required |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`              | A string representing the unique identifier for this instance within current file scope.                                                                                                                                        | `None`  | **yes**  |
| `url`             | A string representing the URI to a [node](#dson-def-node) definition to be used to construct this node.  The given node and all of its descendants are instantiated (i.e. not just the single node, unless it has no children). | `None`  | **yes**  |
| `parent`          | A string representing the URI to another scene node instance to attach to as a child.                                                                                                                                           | `None`  | **no**   |
| `parent_in_place` | A string representing the URI to another scene node instance to attach to as a child, maintaining its world space transform.                                                                                                    | `None`  | **no**   |
| `conform_target`  | A string representing the URI to another node in the scene to follow.                                                                                                                                                           | `None`  | **no**   |
| `geometries`      | An array of [geometry_instance](#dson-def-geometry-instance) objects attached to this instance.                                                                                                                                 | `N/A`   | **no**   |
| `preview`         | A [preview](#dson-def-preview) object to use as a stand-in if the node geometry cannot be found.                                                                                                                                | `None`  | **no**   |

<h3 id="dson-def-node-instance-details">Details</h3>


The parent of a node_instance must already exist in the scene or must have been created by parsing the current scene (i.e. parent nodes must appear before children nodes in a file).



Most properties of node can be overridden in node_instance.  The only properties that cannot be overridden are id, type, and presentation.





<h3 id="dson-def-node-instance-example">Example</h3>

```json
{
    "id" : "ball",
    "url" : "basketball:/DAZ/Props/Balls.dsf#basketball",
    "label" : "Ball",
    "parent" : "hips:#hips",
    "translation" : [ 1.00, 0.00, 1.00 ]
}
```

---

<h2 id="dson-def-operation">operation</h2>

**Description:**
Defines properties of a single operation in a formula operation stack.




<h3 id="dson-def-operation-appears-within">Appears within</h3>

- [`formula`](#dson-def-formula)

<h3 id="dson-def-operation-properties">Properties</h3>

| Name  | Description                                                                                                      | Default | Required |
| ----- | ---------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `op`  | Specifies the operator for the operation.  See [Details](#dson-def-operation-operatoroperand_pairings) section.  | `None`  | **yes**  |
| `val` | Specifies the value to push onto the stack. See [Details](#dson-def-operation-operatoroperand_pairings) section. | `None`  | **no**   |
| `url` | Specifies the URI of a property to evaluate and push onto the stack.                                             | `None`  | **no**   |

<h3 id="dson-def-operation-details">Details</h3>




<h3 id="dson-def-operation-example">Example</h3>

```json
{ "op" : "push", "url" : "hips:#hips?rotation/x" }{ "op" : "mult" }{ "op" : "push", "val" : 1.8 }
```

---

<h2 id="dson-def-oriented-box">oriented_box</h2>

**Description:**
A 3D oriented box defined by a min and max point. The box will be axis-aligned in 3D space.




<h3 id="dson-def-oriented-box-appears-within">Appears within</h3>

- [`preview`](#dson-def-preview)

<h3 id="dson-def-oriented-box-properties">Properties</h3>

| Name  | Description                                                                                                                                          | Default | Required |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `min` | A [float3](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) representing the minimum corner of the bounding box. | `N/A`   | **no**   |
| `max` | A [float3](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) representing the maximum corner of the bounding box. | `N/A`   | **no**   |

<h3 id="dson-def-oriented-box-example">Example</h3>

```json
{
    "min" : [ 4.32, 10.3, 9.87 ],
    "max" : [ 92.74, 9.21, 8.34 ]
}
```

---

<h2 id="dson-def-polygon">polygon</h2>

**Description:**
Defines an indexed polygon face.




<h3 id="dson-def-polygon-appears-within">Appears within</h3>

- [`geometry`](#dson-def-geometry)

<h3 id="dson-def-polygon-details">Details</h3>


A polygon can define no less than three, and no more than four, vertex indices. Any geometries that contain polygons with more than four vertices should be broken into triangles or quads for transport in DSON format.





<h3 id="dson-def-polygon-example">Example</h3>

```json
[ 4, 1, 6, 7, 8, 9 ]
```

---

<h2 id="dson-def-presentation">presentation</h2>

**Description:**
Information and imagery describing how to present an asset to the user.




<h3 id="dson-def-presentation-appears-within">Appears within</h3>

- [`modifier`](#dson-def-modifier)
- [`node`](#dson-def-node)
- [`scene`](#dson-def-scene)

<h3 id="dson-def-presentation-properties">Properties</h3>

| Name          | Description                                                                                                                                                              | Default | Required |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------- |
| `type`        | A content type path. (e.g. “Modifier/Pose”)                                                                                                                              | `None`  | **yes**  |
| `label`       | A user-friendly brief name.                                                                                                                                              | `None`  | **yes**  |
| `description` | A sentence describing the item.                                                                                                                                          | `None`  | **yes**  |
| `icon_large`  | An approximately 132 x 176 pixel image demonstrating the item.                                                                                                           | `None`  | **yes**  |
| `icon_small`  | An approximately 66 x 88 pixel image demonstrating the item.                                                                                                             | `None`  | **no**   |
| `colors`      | An Array of two [float3](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) RGB colors that are compatible with the icon image colors. | `None`  | **yes**  |

<h3 id="dson-def-presentation-details">Details</h3>


At least the icon_large image must be given.  If the icon_small image is missing, an application may need to downsize the icon_large image to use in areas of the interface that require smaller icons.



The type element is a discreet content type string as defined in the [Content Types](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/metadata/content_types/start) table.





<h3 id="dson-def-presentation-example">Example</h3>

```json
{
    "type" : "Modifier/Pose",
    "label" : "Smile",
    "description" : "A morph used to pose the mouth in the shape of a smile",
    "icon_large" : "/data/DAZ 3D/Genesis/Base/Morphs/DAZ 3D/Base/CTRLMouthSmileLarge.png",
    "icon_small" : "/data/DAZ 3D/Genesis/Base/Morphs/DAZ 3D/Base/CTRLMouthSmileSmall.png",
    "colors" : [ [ 0.25, 0.89, 0.98 ], [ 0.14, 0.73, 0.43 ] ]
}
```

---

<h2 id="dson-def-preview">preview</h2>

**Description:**
When an application attempts to load a file and is unable to locate one or more assets that are referenced in the file, the application may use a preview object to synthesize a stand-in billboard item in the scene that represents the missing asset.




<h3 id="dson-def-preview-appears-within">Appears within</h3>

- [`node_instance`](#dson-def-node-instance)

<h3 id="dson-def-preview-properties">Properties</h3>

| Name             | Description                                                                                                                                                           | Default | Required |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `oriented_box`   | An [oriented_box](#dson-def-oriented-box) that defines the bounding box of the stand-in item.                                                                         | `N/A`   | **no**   |
| `center_point`   | A [float3](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) representing the center point of the item.                            | `N/A`   | **no**   |
| `end_point`      | An [float3](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) representing the end point of the stand-in object.                   | `N/A`   | **no**   |
| `rotation_order` | A string representing the rotation order to use when interpreting oriented_box data for this preview.  Valid values are “XYZ”, “YZX”, “ZYX”, “ZXY”, “XZY”, and “YXZ”. | `“XYZ”` | **no**   |

<h3 id="dson-def-preview-example">Example</h3>

```json
{
    "oriented_box" : {
        "min" : [ 4.32, 10.3, 9.87 ],
        "max" : [ 92.74, 9.21, 8.34 ]
    },
    "center_point" : float3,
    "end_point" : float3,
    "rotation_order" : "YXZ"
}
```

---

<h2 id="dson-def-region">region</h2>

**Description:**
Defines a hierarchy of regions using a series of vertex-weighted maps and region groups.




<h3 id="dson-def-region-appears-within">Appears within</h3>

- [`geometry`](#dson-def-geometry)

<h3 id="dson-def-region-properties">Properties</h3>

| Name           | Description                                                                                                                                                          | Default | Required |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`           | A string representing the unique identifier within the region hierarchy.  Must be unique within the region hierarchy.                                                | `None`  | **yes**  |
| `label`        | A string representing the user-facing name of this region.                                                                                                           | `None`  | **no**   |
| `display_hint` | A string representing an application-specific hint about how to display the value for the region. Values can be “cards_on”, “cards_off”, etc.                        | `N/A`   | **no**   |
| `map`          | An [int_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) of indices for all the polygons that are members of this region. | `N/A`   | **no**   |
| `children`     | An array of child regions, either leaf nodes or group nodes.                                                                                                         | `N/A`   | **no**   |

<h3 id="dson-def-region-details">Details</h3>


The map and children elements are mutually exclusive.  If a map element is given, the region is a leaf node in the region hierarchy and may not have children.  If a children element is present, the region is a group node in the region hierarchy and may not define its own map.  All leaf nodes in the hierarchy must define a map element.



Polygons may exist in one and only one region.  If a polygon index is given in multiple regions, the behavior is undefined.





<h3 id="dson-def-region-example">Example</h3>

```json
{
    "label" : "Root",
    "children" :
    [
        {
            "label" : "Torso",
            "map" : [ 7, 8, 4, 9, 2 ]
        },
        {
            "label" : "Lower Body",
            "children" :
            [
                {
                    "label" : "Left Leg",
                    "map" : [ 0, 1, 3, 23, 45 ]
                },
                {
                    "label" : "Right Leg",
                    "map" : [ 5, 6, 10, 12, 13 ]
                }
            ]
        }
    ]
}
```

---

<h2 id="dson-def-rigidity">rigidity</h2>

**Description:**
Defines a rigidity map for a piece of geometry, and how it applies.




<h3 id="dson-def-rigidity-appears-within">Appears within</h3>

- [`geometry`](#dson-def-geometry)

<h3 id="dson-def-rigidity-properties">Properties</h3>

| Name      | Description                                                                                                                     | Default | Required |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `weights` | A [float_indexed_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) of vertex weights. | `None`  | **no**   |
| `groups`  | An array of [rigidity_group](#dson-def-rigidity-group) objects.                                                                 | `None`  | **yes**  |

<h3 id="dson-def-rigidity-example">Example</h3>

```json
{
    "weights" : {
        "count" : 37,
        "values" : [
            [ 0, 1 ],
            ...
            [ 36, 1 ]
        ]
    },
    "groups" : [
        {
            "id" : "SashRigid",
            "rotation_mode" : "secondary",
            "scale_modes" : [ "primary", "secondary", "none" ],
            "reference_vertices" : {
                "count" : 12,
                "values" : [ 8198, ... ]
            },
            "mask_vertices" : {
                "count" : 24,
                "values" : [ 0, ... ]
            },
            "transform_nodes" : [ "#sash1", "#sash2" ]
        },
        {
            "id" : "ScabardRigid",
            "rotation_mode" : "secondary",
            "scale_modes" : [ "primary", "secondary", "secondary" ],
            "reference_vertices" : {
                "count" : 14,
                "values" : [ 4183, ... ]
            },
            "mask_vertices" : {
                "count" : 10,
                "values" : [ 1584, ... ]
            },
            "reference" : "#scabbard",
            "transform_nodes" : [ "#scabbard" ]
        }
    ]
}
```

---

<h2 id="dson-def-rigidity-group">rigidity_group</h2>

**Description:**
Defines a vertex group and how it participates in a rigidity map.




<h3 id="dson-def-rigidity-group-appears-within">Appears within</h3>

- [`rigidity`](#dson-def-rigidity)

<h3 id="dson-def-rigidity-group-properties">Properties</h3>

| Name                 | Description                                                                                                                                                  | Default  | Required |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------- |
| `id`                 | A string representing the Unique identifier within the file                                                                                                  | `None`   | **yes**  |
| `rotation_mode`      | A string representing the rotation mode for the group.  Must be one of “none”, “full”, “primary”, or “secondary”                                             | `“none”` | **no**   |
| `scale_modes`        | An array of the scale modes. Valid values for each axis are “none”, “primary”, “secondary”, or “tertiary”.                                                   | `None`   | **yes**  |
| `reference_vertices` | An [int_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) of vertex indices for vertices in the reference geometry | `None`   | **no**   |
| `mask_vertices`      | An [int_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) of vertex indices from the rigidity mask                 | `None`   | **no**   |
| `reference`          | A string representing the URI of the reference node                                                                                                          | `None`   | **no**   |
| `transform_nodes`    | An array of URI to use when calculating the transform offset for the rigid geometry                                                                          | `None`   | **no**   |

<h3 id="dson-def-rigidity-group-details">Details</h3>


The order of the values in scale_modes depends on the set up of the rigidity group.  If there are transform_nodes they are in the rotation order of those nodes.  If there is a reference node and no transform_nodes it uses the reference node’s axis order. Finally, if there is no reference node or scale nodes it is in the axis order of the calculated reference axis.





<h3 id="dson-def-rigidity-group-example">Example</h3>

```json
{
    "id" : "SashRigid",
    "rotation_mode" : "secondary",
    "scale_modes" : [ "primary", "secondary", "none" ],
    "reference_vertices" : {
        "count" : 12,
        "values" : [ 8198, 8200, 8201, 8230, 8234, 8235, 8236, 8237 ]
    },
    "mask_vertices" : {
        "count" : 24,
        "values" : [ 0, 1, 2, 6, 7, 8, 12, 13, 14, 15, 19, 20, 21 ]
    },
    "transform_nodes" : [ "#sash1", "#sash2" ]
}
```

---

<h2 id="dson-def-scene">scene</h2>

**Description:**
Defines a scene, which is a collection of new instances (with applicable hook-ups into what may already be in the scene) and property settings.



Scene objects can exist in either a DUF or a DSF file, but only one scene object can exist per file. Scene objects are typically in the user facing DUF files. A scene object can represent either an entire scene (scene replacement) or to augment or replace parts of a scene.




<h3 id="dson-def-scene-appears-within">Appears within</h3>

- [`DAZ`](#dson-def-daz)

<h3 id="dson-def-scene-properties">Properties</h3>

| Name             | Description                                                                                                                                           | Default | Required |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `presentation`   | A [presentation](#dson-def-presentation) object representing information to be displayed to the user.                                                 | `None`  | **no**   |
| `nodes`          | An array of [node_instance](#dson-def-node-instance) objects to add to the scene.                                                                     | `None`  | **no**   |
| `uvs`            | An array of [uv_set_instance](#dson-def-uv-set-instance) objects to add to the scene.                                                                 | `None`  | **no**   |
| `modifiers`      | An array of [modifier_instance](#dson-def-modifier-instance) objects to add to the scene.                                                             | `None`  | **no**   |
| `materials`      | An array of [material_instance](#dson-def-material-instance) objects to assign to geometries in the scene.                                            | `None`  | **no**   |
| `animations`     | An array of [channel_animation](#dson-def-channel-animation) objects.                                                                                 | `None`  | **no**   |
| `current_camera` | A string representing the URI of a [camera](#dson-def-camera) [node_instance](#dson-def-node-instance) within the scene to use as the current camera. | `None`  | **no**   |
| `extra`          | An array of objects that represent additional application-specific information for this object.                                                       | `N/A`   | **no**   |

<h3 id="dson-def-scene-example">Example</h3>

```json
{
	"nodes" : [
		node_instance,
		node_instance,
		...
	],
	"materials" : [
		material_instance,
		material_instance,
		...
	],
	"extra" : [
		{
			"type" : "studio_scene_settings",
			"current_time" : 0,
			"background_color" : [ 0.3686275, 0.3686275, 0.3686275 ]
		},
		{
			"type" : "studio_render_settings",
			"render_options" : {
				"aspect_ratio" : [ 827, 983 ],
				"startTime" : 0,
				"endTime" : 1,
				"renderMovToId" : "MovieFile",
				"isAspectConstrained" : true,
				"imageSize" : [ 827, 983 ],
				"renderType" : "Software",
				"renderStyle" : "Normal",
				"rayTraceDepth" : 2,
				"openGLPasses" : 8,
				"useGLSL" : true,
				"isCurrentFrameRender" : true,
				"xPixelSamples" : 4,
				"yPixelSamples" : 4,
				"shadowSamples" : 16,
				"shadingRate" : 1,
				"doubleSided" : true,
				"gain" : 1,
				"gamma" : 1,
				"pixelFilter" : "Sinc",
				"xFilterWidth" : 6,
				"yFilterWidth" : 6
			}
		}
	]
}
```

---

<h2 id="dson-def-skin-binding">skin_binding</h2>

**Description:**
A skin_binding defines the offsets and weights that relate a skin ([geometry](#dson-def-geometry)) to a skeleton (a collection of [node](#dson-def-node)s).




<h3 id="dson-def-skin-binding-appears-within">Appears within</h3>

- [`modifier`](#dson-def-modifier)

<h3 id="dson-def-skin-binding-properties">Properties</h3>

| Name             | Description                                                                                                     | Default | Required |
| ---------------- | --------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `node`           | A string representing the URI of the root [node](#dson-def-node) to bind to.                                    | `None`  | **yes**  |
| `geometry`       | A string representing the URI of the [geometry](#dson-def-geometry) to bind.                                    | `None`  | **yes**  |
| `vertex_count`   | An int representing the number of vertices expected in the mesh geometry.                                       | `0`     | **yes**  |
| `joints`         | An array of [weighted_joint](#dson-def-weighted-joint) objects defining the binding.                            | `None`  | **no**   |
| `selection_sets` | A [named_string_map](#dson-def-named-string-map) that provides a one to one mapping  from face groups to nodes. | `None`  | **no**   |

<h3 id="dson-def-skin-binding-example">Example</h3>

```json
{
    "node" : "#hips",
    "geometry" : "#speedy",
    "vertex_count" : 2045,
    "joints" :
    [
        weighted_joint,
        weighted_joint
        ...
    ],
    "selection_sets" :
    [
        named_string_map,
        named_string_map,
        named_string_map
        ...
    ]
}
```

---

<h2 id="dson-def-uv-set">uv_set</h2>

**Description:**
The definition of a single UV coordinate set asset.




<h3 id="dson-def-uv-set-appears-within">Appears within</h3>

- [`DAZ`](#dson-def-daz)

<h3 id="dson-def-uv-set-properties">Properties</h3>

| Name                     | Description                                                                                                                                                                                                                                                                                                                                                               | Default | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`                     | A string representing a unique ID for this asset within the current file scope.                                                                                                                                                                                                                                                                                           | `None`  | **yes**  |
| `name`                   | A string representing the “internal” name for this UV set.  Generally unique within any sibling uv sets.                                                                                                                                                                                                                                                                  | `“”`    | **no**   |
| `label`                  | A string representing the user facing label for this UV set.                                                                                                                                                                                                                                                                                                              | `“”`    | **no**   |
| `source`                 | A string representing the URI of the uv_set asset that this uv_set was derived from, if any.                                                                                                                                                                                                                                                                              | `“”`    | **no**   |
| `vertex_count`           | An [int](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#int) representing the number of vertices expected to be in the geometry that the UV set applies to.                                                                                                                                                                          | `None`  | **yes**  |
| `uvs`                    | A [float2_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start#float2_array) of all UV's, both those that are shared by all polygons attached to a vertex, and those that may be unique to a particular polygon attached to a vertex.                                                                                               | `None`  | **yes**  |
| `polygon_vertex_indices` | An array representing the polygons that use a UV index for a given vertex that is different than the default index defined in “uvs”. Polygon-specific vertex-indexed UV indices.  Each entry is [polygon_index, polygon_vertex_index, uv_index], where polygon_vertex_index refers to the index of a vertex in the geometry that is used by the polygon at polygon_index. | `None`  | **no**   |

<h3 id="dson-def-uv-set-details">Details</h3>


The uvs array is assumed to be given in the same order as the vertices in any associated geometry. Any vertices that have more than one UV coordinate associated with them (e.g. along a UV boundary) should appear in the polygon_vertex_indices array. For vertices that appear in the polygon_vertex_indices array, their entry in the uvs array should correspond to a “primary” value for the UV's for that vertex. The “primary” value may be arbitrary for most applications.





<h3 id="dson-def-uv-set-example">Example</h3>

```json
{
    "id" : "default",
    "name" : "default",
    "label" : "Default UVs",
    "vertex_count" : 266,
    "uvs" : [
        [ 0.02083333, 0 ],
        [ 0.02083333, 1 ],
        [ 0, 0.08333334 ],
        [ 0, 0.1666667 ],
        [ 0, 0.25 ],
        [ 0, 0.3333333 ],
        [ 0, 0.4166667 ],
        [ 0, 0.5 ],
        [ 0, 0.5833333 ],
        [ 0, 0.6666667 ],
        [ 0, 0.75 ],
        [ 0, 0.8333333 ],
        [ 0, 0.9166667 ]
    ],
    "polygon_vertex_indices" : [
        [ 12, 0, 266 ],
        [ 24, 0, 4 ],
        [ 36, 0, 7 ],
        [ 48, 0, 9 ],
        [ 60, 0, 2 ]
    ]
}
```

---

<h2 id="dson-def-uv-set-instance">uv_set_instance</h2>

**Description:**
Defines an instance of a [uv_set](#dson-def-uv-set) asset.




<h3 id="dson-def-uv-set-instance-appears-within">Appears within</h3>

- [`DAZ`](#dson-def-daz)

<h3 id="dson-def-uv-set-instance-properties">Properties</h3>

| Name     | Description                                                                                           | Default | Required |
| -------- | ----------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`     | A string representing the unique identifier for this asset within the current file scope.             | `None`  | **yes**  |
| `url`    | A string representing the URI of the [uv_set](#dson-def-uv-set) definition to instantiate.            | `None`  | **yes**  |
| `parent` | A string representing the URI of the [geometry](#dson-def-geometry) that the UV set should attach to. | `None`  | **yes**  |

<h3 id="dson-def-uv-set-instance-example">Example</h3>

```json
{
    "id" : "TestV4-1",
    "url" : "#TestV4",
    "parent" : "#blMilMan_m4b"
}
```

---

<h2 id="dson-def-weighted-joint">weighted_joint</h2>

**Description:**
Defines one of the joints in a skin binding.  For now, the binding matrix for each node is assumed to be the identity matrix.




<h3 id="dson-def-weighted-joint-appears-within">Appears within</h3>

- [`skin_binding`](#dson-def-skin-binding)

<h3 id="dson-def-weighted-joint-properties">Properties</h3>

| Name            | Description                                                                                                                                                                                  | Default | Required |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `id`            | A string representing the unique identifier for this object within the file scope.                                                                                                           | `None`  | **yes**  |
| `node`          | A string representing the URI of the target node in the skeleton.                                                                                                                            | `None`  | **yes**  |
| `node_weights`  | A [float_indexed_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) representing the general weight map for this joint.                             | `N/A`   | **no***  |
| `scale_weights` | A [float_indexed_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) representing the scale weight map for this joint.                               | `N/A`   | **no***  |
| `local_weights` | A collection of x, y, and z [float_indexed_array](http://docs.daz3d.com/doku.php/public/dson_spec/format_description/data_types/start) objects representing the local weights for the joint. | `N/A`   | **no***  |
| `bulge_weights` | A collection of  x, y, and z [bulge_binding](#dson-def-bulge-binding) objects representing the bulge binding weights for the joint.                                                          | `N/A`   | **no**   |

<h3 id="dson-def-weighted-joint-details">Details</h3>


* At least one of node_weights, scale_weights, and/or local_weights must be present.





<h3 id="dson-def-weighted-joint-example">Example</h3>

```json
{
    "id" : "rForeArm",
    "node" : "#rForeArm",
    "scale_weights" : {
        "count" : 101,
        "values" : [
            [ 111, 0.00218204 ],
            [ 122, 0.004913405 ],
            [ 123, 0.009918365 ],
            ...
            [ 292, 1.525902e-05 ],
            [ 314, 7.629511e-05 ],
            [ 315, 0.0001525902 ],
            [ 316, 9.155413e-05 ],
            [ 327, 3.051804e-05 ]
        ]
    },
    "local_weights" : {
        "y" : {
            "count" : 129,
            "values" : [
                [ 84, 0.0003051804 ],
                [ 85, 0.0002441444 ],
                [ 86, 0.0002288853 ],
                [ 87, 0.0002441444 ],
                ...
                [ 949, 0.001129168 ],
                [ 950, 0.0009918364 ],
                [ 983, 0.001327535 ],
                [ 984, 0.001205463 ],
                [ 1017, 0.0006561379 ],
                [ 1018, 0.0007782101 ]
            ]
        },
    },
    "bulge_weights" : {
        "y" : {
            "bulges" : [
                {
                    "id" : "positive-left",
                    "label" : "Y Bulge Positive Left",
                    "visible" : false,
                    "locked" : false,
                    "min" : -10000,
                    "max" : 10000,
                    "clamped" : false,
                    "display_as_percent" : false,
                    "step_size" : 0.01,
                    "value" : -10,
                    "auto_follow" : true
                },
                {
                    "id" : "positive-right",
                    "label" : "Y Bulge Positive Right",
                    "visible" : false,
                    "locked" : false,
                    "min" : -10000,
                    "max" : 10000,
                    "clamped" : false,
                    "display_as_percent" : false,
                    "step_size" : 0.01,
                    "value" : 6.99999,
                    "auto_follow" : true
                },
                {
                    "id" : "negative-left",
                    "label" : "Y Bulge Negative Left",
                    "visible" : false,
                    "locked" : false,
                    "min" : -10000,
                    "max" : 10000,
                    "clamped" : false,
                    "display_as_percent" : false,
                    "step_size" : 0.01,
                    "value" : 0,
                    "auto_follow" : true
                },
                {
                    "id" : "negative-right",
                    "label" : "Y Bulge Negative Right",
                    "visible" : false,
                    "locked" : false,
                    "min" : -10000,
                    "max" : 10000,
                    "clamped" : false,
                    "display_as_percent" : false,
                    "step_size" : 0.01,
                    "value" : -10,
                    "auto_follow" : true
                }
            ],
            "right_map" : {
                "count" : 347,
                "values" : [
                    [ 24, 0.01115435 ],
                    [ 25, 0.01074235 ],
                    [ 26, 0.01110857 ],
                    [ 27, 0.01213092 ],
                    [ 28, 0.01341268 ],
                    ...
                    [ 1013, 0.06436256 ],
                    [ 1014, 0.0669871 ],
                    [ 1015, 0.06668193 ],
                    [ 1016, 0.03700313 ],
                    [ 1017, 0.009948882 ]
                ]
            }
        }
    }
}
```

---
