Coding Guidelines & Preferences Summary:

*   Modularity:
    *   `src/core/` - Core data model and parsing logic. ()`src/spec.ts` for the global schema and types. you can reexport more types from here if need be.)
    *   `src/scene/` - Runtime scene graph management with class that prepare all data for rendering.
    *   `src/web/` - Web-specific rendering, examples, and interaction code.
    Add new classes in those folders as soon as you encounter an important abstraction that would benefit having dedicated methods.

*   general preferences:
    *   avoid free functions, try to add methods and getters to classes.
    *   add helpers, methods, getters, etc so code around key places remains clean and legible.
    *   avoid deeply nested indentation, prefer early returns or guard clauses to keep code flat.
    *   when working with refs (nodeRefs, geometryRefs, etc.) make sure to add getters early to keep chains small.
    *   avoid long dot notation like `foo.bar.baz.quux` but rather `foo.qux <- getter`.
    *   avoid convoluted access chains like `foo.getBar().getBaz().getQuux()`, prefer `foo.barBazQuux <- getter`.
    *   avoid long error control in key functions.
    *   make code concise. avoid repetition. be smart so the code remains small. this is very important

*   Data Encapsulation & Early Resolution:
    *   Core data model classes (e.g., those in `src/core/`) should be responsible for resolving their own essential dependencies during their initialization phase (e.g., `static async init()`).
    *   For instance, a `DazCharacter` should load or link to its corresponding `DazFigure` at load time, rather than having rendering or scene management code handle this lookup later.
    *   Aim for data objects to be as self-contained and fully resolved as possible after loading.

*   Test-Driven Development (TDD) for Complex Logic:
    *   For intricate features like skeletal systems, animation, or complex transformations, adopt a test-driven approach using Bun Test.
    *   Tests should cover:
        *   Correct instantiation and data loading (e.g., `resolvedFigure` is present).
        *   Existence and count of key components (e.g., number of bones).
        *   Correct hierarchical relationships (e.g., `pelvis` is a child of `hip`).
        *   Transformation accuracy (e.g., bone positions and rotations), being mindful of local vs. world space.
    *   use real mgr, no fs mock: `const mgr = new DazMgr('/Volumes/ssd4t1/daz-lib/', fs)`

*   3D Coordinate Spaces in Tests & Logic:
    *   When testing or manipulating 3D object positions, clearly distinguish between local coordinates (`object.position`) and world coordinates.
    *   Use methods like `object.getWorldPosition(targetVector)` when asserting or needing the final transformed position of an object in the scene, especially for elements in a hierarchy.

*   Debugging 3D Visuals:
    *   make use `THREE.SkeletonHelper` and other debug utils to help troubleshoot common issues.
    *   use https://lil-gui.georgealways.com/ to build a global floating panel with core options.
    *   Temporarily making occluding objects (like character meshes) transparent or wireframe is a preferred technique for debugging underlying structures.

*   TypeScript & Type Safety:
    *   Address TypeScript errors promptly.
    *   Ensure types are correctly imported from their definitive source modules.
    *   When working with data from external sources or complex structures (like Daz file channels typed as `unknown`), use type guards, explicit checks (e.g., `typeof value === 'number'`), or helper functions that ensure type correctness before values are used in strongly-typed contexts (e.g., assertions like `toBeCloseTo`).

*   Misc
    *   imporpting the DI module `import '../DI.js'` is necessary in entrypoints / test files.
    *   installing packages is done with `bun install <package>`

-----

- Consider the server to always be running
- Consider the frontend to always be running at `http://localhost:6660/` ; you never need to start it manually
