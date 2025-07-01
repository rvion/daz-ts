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

I also want to clarify that  you can't just read the modifiers on the dazCharacte, and DazFigure. every signle modifier in the daz library folder need to be known statically. not just those in the character file. usually, modifiers are stored elsewhere, and each standalone file can inject new modifiers and attach them to various matching figure/chars/etc.

we probably want to evolve the @/src/scripts/parse-modifiers.ts class so it also compiles a standalone file that map all dependencies, etc etc. (feel free to use @/src/utils/toposort.ts  if you need)


good luck, be extra carefull, do your best.


let's just start with displaying all modifiers in the UI, with two search bar for manual/automatic(hidden) modifiers, all read from the single output file generated by @src/scripts/parse-modifiers.ts

I already started the implementation here but feel free to change what I did @tmp/diff-with-master-all.diff


make sure to golf the output of data/modifiers.json as much as possible. use arrays, skip redundant data, etc.
also make sure to generate a sample modifiers-short.json file with sampled ~100 modifiers, so you can always use this shorted sampled file for your checks testing/debugging to avoid loading the full file every time.