# Daz-ts

This repository aims to provide a [TypeScript](https://www.typescriptlang.org/) library for working with [Daz 3D](https://www.daz3d.com/) assets from any source like [Daz store](https://www.daz3d.com/shop), on [node](https://nodejs.org/fr), [bun](https://bun.sh/) or in a [web browser](https://www.google.com/chrome/).

- **Parsing** Daz Library files
- **Scene graph** to building and managing scenes
- **Morph management** and evaluation to deform and pose characters
- **Rendering** them using Three.js (web only)

## Project Scope

1. [ ] Parse and validate Daz Libary files
   1. [x] full validation for the whole `.duf`,`.dsf` files
   2. [ ] Extract metadata from Daz Library files
   3. [ ] resolve dependencies
   4. [ ] index and map all morphs, poses, and other assets
   5. [x] be fast
      1. [x] peek into json files as efficiently as possible
         1. [x] manuall [Buffer.alloc](src/utils/fsNode.ts:24)
         2. [x] use [magic-bytes.js](https://github.com/LarsKoelpin/magic-bytes) to detect if [gzipped](https://www.daz3d.com/forums/discussion/531316/daz-studio-compressed-file-format?srsltid=AfmBOorlxB7Mi1U5UX9MKfLPcf91HoEMxLI_GSmdMZSreYmhCCjPmMoD)
         3. [x] use [zlib](src/utils/readPartialGzipped.ts) efficiently to peek into first chunks of gzipped files

2. [ ] Scene manager to pose daz characters, apply daz poses, etc.
   1. [x] add characters
   2. [ ] apply poses
   3. [ ] apply manual morphs
   4. [ ] have all ERCs/MCMs/SCMs be applied automatically
   5. [ ] compute

3. [ ] ThreeJS Renderer to visualize your scnees in the browser
   1. [ ] debug info
   2. [ ] render characters
      1. [x] build a [SkinnedMesh](https://threejs.org/docs/#api/en/objects/SkinnedMesh)
      2. [x] render base geometry
      3. [ ] render textures
      4. [ ] ....

![Image](https://github.com/user-attachments/assets/7f2f51c7-65cf-41b3-a455-89ef93e63a3e)

## detailed progress of supported asset types

- [ ] character
- [ ] figure
- [ ] pose
- [ ] wearable
- [ ] can read gzipped (`gz`) files (some daz files are gzipped)

## SUpport

- [ ] Genesis 9
- [ ] morphs
  - [ ] MCMs (Morph Controller Morphs)
  - [ ] JCMs (Joint Controlled Morphs)
  - [ ] ERC (Enhanced Remote Control) links
- [ ] poses
- [ ] geoshell - is a new layer surrounding the object with a slight offset. It has the same UV layout.
- [ ] geocraft - is an object that integrtes with the base object, so it is one piece of mesh.


-------------

Explore daz folder:

```sh
$ bun src/scripts/summarize.ts

Processed 6348 relevant files.
Type                          |  .dsf |  .duf | total
-----------------------------------------------------
character                     |       |    12 |    12
figure                        |    80 |       |    80
material                      |    54 |       |    54
modifier                      |  4526 |       |  4526
preset_dform                  |       |     1 |     1
preset_hierarchical_material  |       |   407 |   407
preset_hierarchical_pose      |       |    39 |    39
preset_layered_image          |       |   195 |   195
preset_light                  |       |     3 |     3
preset_material               |       |   196 |   196
preset_pose                   |       |   211 |   211
preset_properties             |       |     1 |     1
preset_render_settings        |       |    24 |    24
preset_shader                 |       |   136 |   136
preset_shape                  |       |    92 |    92
preset_simulation_settings    |       |     2 |     2
prop                          |    29 |       |    29
scene                         |       |    36 |    36
scene_subset                  |       |    40 |    40
uv_set                        |   121 |       |   121
wearable                      |       |   143 |   143
```

-------------

## Technical overview of DAZ.

_I may be wrong, I'm learning as I go._

### Daz Studio Character Architecture

Daz Studio's character system is a layered architecture that uses a base mesh modified in real-time by a morphing and control engine.

#### 1. Core Components

* **Base Mesh:** A 3D model in a neutral state. All modifications are calculated as offsets from this base.
* **Morphs (Blend Shapes):** A set of vertex deltas that define a shape modification. Morphs are used for both character shaping and automated corrections.
* **File Structure:**
    * **`.duf` (Daz User File):** A scene file that references assets and their current property values.
    * **`.dsf` (Daz Studio File):** An asset file containing data, such as morph deltas or rigging information.

#### 2. The ERC Engine and Asset Loading

* **Asset Loading:** On figure load, the application scans the content library and loads all compatible morph (`.dsf`) assets for that figure, not just those referenced in the scene's `.duf` file.
* **Formulas (ERC - Enhanced Remote Control):** An ERC formula, stored within a `.dsf` file, defines a relationship where one property (the controller) drives the value of another (the target).
* **JCMs & MCMs:** ERC is used to create corrective morphs.
    * **JCMs (Joint Controlled Morphs)** are driven by bone rotations.
    * **MCMs (Morph Controller Morphs)** are driven by the values of other morphs.

#### 3. Evaluation Logic

* **Dependency Graph:** The engine builds a dependency graph of all properties (nodes) and the formulas (edges) that connect them.
* **Evaluation Order:** The graph is processed using a **topological sort**. This ensures that controllers are evaluated before the properties they drive.
* **Cycle Detection:** The engine detects and breaks circular dependencies (e.g., A drives B, and B drives A) during the graph-building phase to prevent infinite evaluation loops.

#### 4. Final Mesh Calculation

The final vertex positions are calculated by summing the weighted values of all active morph deltas and adding them to the base mesh vertices.

`Final Vertex = Base Vertex + Σ (Morph_Delta × Morph_Value)`
