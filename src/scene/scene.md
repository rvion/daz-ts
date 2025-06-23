This folder aims to contain a comprehensive scene graph architecture for our Daz asset rendering system.
Here's what has been accomplished so far:

## New Architecture Overview

### 1. **RuntimeScene** (`src/scene/RuntimeScene.ts`)
- Main scene manager that handles Three.js scene, camera, renderer, and animation loop
- Manages multiple characters in the scene
- Provides methods for adding/removing characters
- Handles window resize, lighting, and camera controls
- Includes skeleton helper visibility toggle functionality
- Proper disposal and cleanup methods

### 2. **RVCharacter** (`src/scene/Character.ts`)
- Runtime character representation that builds meshes from DazCharacter data
- Creates Three.js meshes from geometry references with proper materials and shadows
- Builds skeleton structure from figure's node_inf data for bone animation
- Includes skeleton helper for debugging bone structures
- Provides pose application methods that parse pose URLs and apply transformations
- Position/rotation control methods with clean getter/setter API
- Fallback mesh creation when geometry data is missing

### 3. **Updated DazCharacter** (`src/core/DazFileCharacter.ts`)
- Added `resolvedFigure` property that automatically resolves during initialization
- Implements figure resolution logic using common Genesis IDs and heuristics
- Early resolution follows your "Data Encapsulation & Early Resolution" principle

### 4. **Simplified Genesis9 Scene** (`src/web/scenes/genesis9.ts`)
- Dramatically simplified from 144 lines to 42 lines
- Now uses the new scene graph architecture
- Creates two character instances positioned side by side
- Clean separation of concerns - no direct Three.js mesh creation

## Key Benefits

### **Clean Architecture**
- **`src/core/`** - Pure data parsing and resolution
- **`src/scene/`** - Runtime scene graph with Three.js integration
- **`src/web/`** - Web-specific rendering and interaction

### **Pose Support Ready**
- `RVCharacter.applyPose()` method parses your DazFilePose URLs
- Skeleton structure built from figure's node_inf data
- Bone transformations applied via Three.js bone system

### **Debug-Friendly**
- Skeleton helpers for visualizing bone structure
- Toggle bone visibility with `runtimeScene.toggleAllBoneHelpersVisibility()`
- Fallback meshes when geometry data is missing

### **Extensible Design**
- Easy to add multiple characters to scenes
- Character positioning with clean API (`character.x = -75`)
- Ready for animation blending and advanced pose features

## Next Steps for Pose Implementation

1. **Enhance Bone Hierarchy**: Improve parent-child bone relationships in `buildSkeleton()`
2. **Pose Blending**: Add methods to blend between multiple poses
3. **Animation Timeline**: Create timeline controls for pose sequences
4. **GUI Controls**: Add lil-gui panels for real-time pose adjustment

The architecture now provides a solid foundation for dynamic pose application while maintaining clean separation of concerns and following your coding guidelines.