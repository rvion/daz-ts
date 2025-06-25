src/mgr.ts:148-152
```
      // todo 1. if the asset is a modifier, we should parse it completely.
      // if (dson.asset_info.type==='modifier')  {
      //    x = await DsonFileModifier.init(this, meta, dson)
      // }

```

properly instanciate DsonFileModifier (you need to create the class, and make sure you properly init it. the init should try to find and resolve all urls.


here is a sample modifier at `data/DAZ 3D/Genesis 9/Base/Morphs/Daz 3D/Base Pose/body_ctrl_HipBend.dsf`

```
{
	"file_version" : "0.6.0.0",
	"asset_info" : {
		"id" : "/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBend.dsf",
		"type" : "modifier",
		"contributor" : {
			"author" : "Daz 3D",
			"email" : "",
			"website" : "www.daz3d.com"
		},
		"revision" : "1.0",
		"modified" : "2021-12-29T14:03:49Z"
	},
	"modifier_library" : [
		{
			"id" : "CTRLHipBend",
			"name" : "body_ctrl_HipBend",
			"parent" : "/data/Daz%203D/Genesis%209/Base/Genesis9.dsf#Genesis9",
			"presentation" : {
				"type" : "Modifier/Pose",
				"label" : "",
				"description" : "",
				"icon_large" : "/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBend.png",
				"colors" : [ [ 0.3764706, 0.2784314, 0.3254902 ], [ 1, 1, 1 ] ]
			},
			"channel" : {
				"id" : "value",
				"type" : "float",
				"name" : "body_ctrl_HipBend",
				"label" : "Hip Bend",
				"value" : 0,
				"min" : -1,
				"max" : 1,
				"clamped" : true,
				"display_as_percent" : true,
				"step_size" : 0.04
			},
			"group" : "/Pose Controls/Torso",
			"formulas" : [
				{
					"output" : "Genesis9:/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBendFwd.dsf#body_ctrl_HipBendFwd?value",
					"operations" : [
						{ "op" : "push", "url" : "Genesis9:#CTRLHipBend?value" },
						{ "op" : "push", "val" : 1 },
						{ "op" : "mult" }
					]
				},
				{
					"output" : "Genesis9:/data/Daz%203D/Genesis%209/Base/Morphs/Daz%203D/Base%20Pose/body_ctrl_HipBendBck.dsf#body_ctrl_HipBendBck?value",
					"operations" : [
						{ "op" : "push", "url" : "Genesis9:#CTRLHipBend?value" },
						{ "op" : "push", "val" : -1 },
						{ "op" : "mult" }
					]
				}
			]
		}
	],
	"scene" : {
		"modifiers" : [
			{
				"id" : "body_ctrl_HipBend",
				"url" : "#CTRLHipBend"
			}
		]
	}
}

```

urls must be resolved, like those in modfier_library parent or nested formulas output.


@/src/utils/parseDazUrl.test.ts@/src/utils/parseDazUrl.ts may help for parsing. you might need to augment it with a extra context, but also may not.