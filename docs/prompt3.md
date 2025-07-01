I'm trying to fully implement daz runtime, parse stuff, and display characters.

I built @/src/scripts/parse-modifiers.ts  to make sure i can parse all modifiers.

it outputs stuff like that:

```
[       ] [morph] [    ] [Actor   ] FBMBodySize                                        /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FBMBodySize.dsf
[       ] [morph] [    ] [Actor   ] FBMExpandAll                                       /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FBMExpandAll.dsf
[       ] [morph] [    ] [Actor   ] FBMHeavy                                           /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FBMHeavy.dsf
[       ] [morph] [    ] [Actor   ] FBMLoosenStrap                                     /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FBMLoosenStrap.dsf
[       ] [morph] [    ] [Actor   ] FBMOlympia8                                        /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FBMOlympia8.dsf
[       ] [morph] [    ] [Actor   ] FBMPearFigure                                      /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FBMPearFigure.dsf
[       ] [morph] [    ] [Actor   ] FBMStephanie8                                      /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FBMStephanie8.dsf
[       ] [morph] [    ] [Actor   ] FBMThickenHeel                                     /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FBMThickenHeel.dsf
[       ] [morph] [    ] [Actor   ] FBMVictoria8                                       /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FBMVictoria8.dsf
[formula] [morph] [    ] [        ] FixToesUp_60_L                                     /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FixToesUp_60_L.dsf
[formula] [morph] [    ] [        ] FixToesUp_60_R                                     /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/FixToesUp_60_R.dsf
[       ] [morph] [    ] [        ] lFootFix                                           /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/lFootFix.dsf
[       ] [morph] [    ] [        ] pJCMFootUp_40_L                                    /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/pJCMFootUp_40_L.dsf
[       ] [morph] [    ] [        ] pJCMFootUp_40_R                                    /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/pJCMFootUp_40_R.dsf
[       ] [morph] [    ] [        ] pJCMToesUp_60_L                                    /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/pJCMToesUp_60_L.dsf
[       ] [morph] [    ] [        ] pJCMToesUp_60_R                                    /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/pJCMToesUp_60_R.dsf
[       ] [morph] [    ] [        ] rFootFix                                           /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Sandals/Morphs/Mada/Base/rFootFix.dsf
[       ] [morph] [    ] [Actor   ] Back_Left                                          /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Skirt/Morphs/Mada/Base/Back_Left.dsf
[       ] [morph] [    ] [Actor   ] Back_Out                                           /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Skirt/Morphs/Mada/Base/Back_Out.dsf
[       ] [morph] [    ] [Actor   ] Back_Right                                         /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Skirt/Morphs/Mada/Base/Back_Right.dsf
[       ] [morph] [    ] [Actor   ] FBMBodybuilderDetails                              /Volumes/ssd4t1/daz-lib/data/DAZ 3D/dForce Starter Essentials/Bardot Skirt/Morphs/Mada/Base/FBMBodybuilderDetails.dsf
```


now I want to display a hierarchy of control slider in my @/src/web/scenes/setupDebugGUI.ts , to modify my character, and I also want to see all automatic modifiers and what value they resolve to.

so... basically, I want to be able to control sliders made to be modified manually, and see automatically modified value, like JCM, or MCM. for automatic ones, they need to be displayed by values.

feel free to look at the spec here: @/src/spec.ts if it helps, or change @/src/utils/parseDazUrl.ts  if need be.

good luck, be extra carefull, do your best.