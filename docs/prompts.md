```
I'm trying to load daz assets directly and render scenes with them in the browser using threejs. so var, I've managed to parse a bunch of stuff into a asset graph @/src/core , and I've managed to render a character in @/src/web/scenes/genesis9.ts  . now, I want to be able to dynamically apply poses. I've started parsing pose (see current diff @/tmp/diff-with-master-all.diff ) but I start to think I'll need a better scene graph for what should be displayed. parsing assets is good, but I also need to have some kind of node graph, with bones, their position, and the final geometry as getters. I can't leave everything in @/src/web/scenes/genesis9.ts . what do you think ?
```


---

the bones are wrong. they are reversed, not scaled properly, not positionned properly.
Let's try to fix that the best way possible. in @/src/spec.ts we should have a pretty correct schema for the figure and character files. here is the content of those two files

if it helps, let's maybe debug the hip ? and see how to start from there ?

in the duf file (character), we have in scenes/nodes:


```
{
   "id" : "hip",
   "url" : "/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#hip",
   "name" : "hip",
   "label" : "Hip",
   "parent" : "#Genesis9",
   "preview" : {
      "type" : "bone",
      "center_point" : [ 0, 97.13693, 0.4865389 ],
      "end_point" : [ 0, 80.91573, 0.2278784 ],
      "rotation_order" : "YZX"
   },
   "extra" : [
      {
         "type" : "studio_node_channels",
         "version" : 4
      }
   ]
}
```

in the dsf file, we have more menttions of hip:

in the modifier_library > skin
```
{
   "id" : "hip",
   "node" : "#hip",
   "node_weights" : {
      "count" : 0,
      "values" : [
      ]
   }
}
```

in the geometry_library > root_region > children :

```
{
   "id" : "Hip",
   "label" : "Hip",
   "display_hint" : "cards_off",
   "map" : {
      "count" : 1428,
      "values" : [ 21201, 21202, 21203, 21204, 21205, ..., 25120, 25122, 25123, 25125, 25126 ]
   }
}
```

and in the node_library:

```
{
   "id" : "hip",
   "name" : "hip",
   "type" : "bone",
   "label" : "Hip",
   "parent" : "#Genesis9",
   "rotation_order" : "YZX",
   "inherits_scale" : true,
   "center_point" : [
      {
         "id" : "x",
         "type" : "float",
         "name" : "xOrigin",
         "label" : "X Origin",
         "visible" : false,
         "value" : 0,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.01
      },
      {
         "id" : "y",
         "type" : "float",
         "name" : "yOrigin",
         "label" : "Y Origin",
         "visible" : false,
         "value" : 97.13693,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.01
      },
      {
         "id" : "z",
         "type" : "float",
         "name" : "zOrigin",
         "label" : "Z Origin",
         "visible" : false,
         "value" : 0.4865389,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.01
      }
   ],
   "end_point" : [
      {
         "id" : "x",
         "type" : "float",
         "name" : "xEnd",
         "label" : "X End",
         "visible" : false,
         "value" : 0,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.01
      },
      {
         "id" : "y",
         "type" : "float",
         "name" : "yEnd",
         "label" : "Y End",
         "visible" : false,
         "value" : 80.91573,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.01
      },
      {
         "id" : "z",
         "type" : "float",
         "name" : "zEnd",
         "label" : "Z End",
         "visible" : false,
         "value" : 0.2278784,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.01
      }
   ],
   "orientation" : [
      {
         "id" : "x",
         "type" : "float",
         "name" : "xOrientation",
         "label" : "X Orientation",
         "visible" : false,
         "value" : 0,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.01
      },
      {
         "id" : "y",
         "type" : "float",
         "name" : "yOrientation",
         "label" : "Y Orientation",
         "visible" : false,
         "value" : 0,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.01
      },
      {
         "id" : "z",
         "type" : "float",
         "name" : "zOrientation",
         "label" : "Z Orientation",
         "visible" : false,
         "value" : 0,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.01
      }
   ],
   "rotation" : [
      {
         "id" : "x",
         "type" : "float",
         "name" : "XRotate",
         "label" : "X Rotate",
         "value" : 0,
         "min" : -180,
         "max" : 180,
         "clamped" : true,
         "step_size" : 0.5
      },
      {
         "id" : "y",
         "type" : "float",
         "name" : "YRotate",
         "label" : "Y Rotate",
         "value" : 0,
         "min" : -180,
         "max" : 180,
         "clamped" : true,
         "step_size" : 0.5
      },
      {
         "id" : "z",
         "type" : "float",
         "name" : "ZRotate",
         "label" : "Z Rotate",
         "value" : 0,
         "min" : -180,
         "max" : 180,
         "clamped" : true,
         "step_size" : 0.5
      }
   ],
   "translation" : [
      {
         "id" : "x",
         "type" : "float",
         "name" : "XTranslate",
         "label" : "X Translate",
         "value" : 0,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.1
      },
      {
         "id" : "y",
         "type" : "float",
         "name" : "YTranslate",
         "label" : "Y Translate",
         "value" : 0,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.1
      },
      {
         "id" : "z",
         "type" : "float",
         "name" : "ZTranslate",
         "label" : "Z Translate",
         "value" : 0,
         "min" : -10000,
         "max" : 10000,
         "step_size" : 0.1
      }
   ],
   "scale" : [
      {
         "id" : "x",
         "type" : "float",
         "name" : "XScale",
         "label" : "X Scale",
         "visible" : false,
         "value" : 1,
         "min" : -10000,
         "max" : 10000,
         "display_as_percent" : true,
         "step_size" : 0.005
      },
      {
         "id" : "y",
         "type" : "float",
         "name" : "YScale",
         "label" : "Y Scale",
         "visible" : false,
         "value" : 1,
         "min" : -10000,
         "max" : 10000,
         "display_as_percent" : true,
         "step_size" : 0.005
      },
      {
         "id" : "z",
         "type" : "float",
         "name" : "ZScale",
         "label" : "Z Scale",
         "visible" : false,
         "value" : 1,
         "min" : -10000,
         "max" : 10000,
         "display_as_percent" : true,
         "step_size" : 0.005
      }
   ],
   "general_scale" : {
      "id" : "general_scale",
      "type" : "float",
      "name" : "Scale",
      "label" : "Scale",
      "value" : 1,
      "min" : -10000,
      "max" : 10000,
      "display_as_percent" : true,
      "step_size" : 0.005
   },
   "extra" : [
      {
         "type" : "studio_node_channels",
         "version" : 4,
         "channels" : [
            {
               "channel" : {
                  "id" : "Disable Transform",
                  "type" : "bool",
                  "label" : "Disable Local Transform",
                  "visible" : false,
                  "value" : false
               },
               "group" : "/General/Transforms"
            },
            {
               "channel" : {
                  "id" : "Ignore Local Transform",
                  "type" : "bool",
                  "label" : "Ignore Local Transform",
                  "visible" : false,
                  "value" : false
               },
               "group" : "/General/Transforms"
            },
            {
               "channel" : {
                  "id" : "Point At",
                  "type" : "numeric_node",
                  "label" : "Point At",
                  "value" : 1,
                  "min" : 0,
                  "max" : 1,
                  "clamped" : true,
                  "step_size" : 0.01,
                  "needs_node" : true,
                  "node" : null
               },
               "group" : "/General/Constraints"
            },
            {
               "channel" : {
                  "id" : "Visible",
                  "type" : "bool",
                  "label" : "Visible",
                  "value" : true
               },
               "group" : "/Display"
            },
            {
               "channel" : {
                  "id" : "Visible in Viewport",
                  "type" : "bool",
                  "label" : "Visible in Viewport",
                  "value" : true
               },
               "group" : "/Display/Scene View"
            },
            {
               "channel" : {
                  "id" : "Selectable",
                  "type" : "bool",
                  "label" : "Selectable (in Viewport)",
                  "value" : true
               },
               "group" : "/Display/Scene View"
            },
            {
               "channel" : {
                  "id" : "Renderable",
                  "type" : "bool",
                  "label" : "Visible in Render",
                  "value" : true
               },
               "group" : "/Display/Rendering"
            },
            {
               "channel" : {
                  "id" : "Cast Shadows",
                  "type" : "bool",
                  "label" : "Cast Shadows",
                  "value" : true
               },
               "group" : "/Display/Rendering"
            },
            {
               "channel" : {
                  "id" : "Render Priority",
                  "type" : "enum",
                  "label" : "Render Priority",
                  "visible" : false,
                  "value" : 3,
                  "enum_values" : [ "Lowest", "Low", "Below Normal", "Normal", "Above Normal", "High", "Highest" ]
               },
               "group" : "/Display/Rendering"
            },
            {
               "channel" : {
                  "id" : "Visible in Simulation",
                  "type" : "bool",
                  "label" : "Visible in Simulation",
                  "value" : true
               },
               "group" : "/Display/Simulation"
            }
         ]
      }
   ]
}
```

I think that the final position is probably moslty impacted by those various things.

`bun test src/scene/skeleton.test.ts` fails


```
72 |    expect(toeWorldPosition.y).toBeLessThan(10)
                                   ^
error: expect(received).toBeLessThan(expected)
```

You should probably start by looking at the code in case there is an obvious error, but you may also better be served by generating a simplified small json with all relevant infos so you can iterate faster with a smaller context.
