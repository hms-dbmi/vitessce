## In Progress

### Added
- Attach on load callbacks and loading indicators to layer controller when using (global) selection slider.

### Changed
- Change bitmask rendering to only display a unique pixel value instead of blending.
- Use component height for determining 3D sizing.
  - Use state rather than computing every render.
- Fix cell highlight bug with bitmask where tooltip information remains on screen after no longer highlighting.
- No selection of cells in bitmask now results in default "grey" color instead of the last selected cell set.
- Cache computation of internal data structures on `AnnData` zarr loaders.
- Upgrade zarr.js to 0.4.0
- Fixed backwards-compatibility `spatialRasterLayers` bugs:
    - The layer `type` should not be used, since it is currently expected to be either `"raster"` or `"bitmask"`, but previously was allowed to be any string including `"t"`. Instead, need to detect whether the layer is a bitmask layer using `layerMeta.metadata.isBitmask` defined in the `raster.json` file definition.
    - The `visible` property was previously only available for channels. Now, there is a per-layer `visible` property, but old view configs may not contain this. Therefore, we need to explicitly check that the value is a boolean rather than simply falsy `undefined` or `null`.

## [1.1.11](https://www.npmjs.com/package/vitessce/v/1.1.11) - 2021-06-25

### Added
- Global visibility button next to name in layer controller.
- Volumetric ray casting from `Viv`
    - Upgrade `Viv` to 0.10.4
    - Add new coordination types `spatialRotationX` `spatialRotationY` `spatialRotationZ` `spatialRotationOrbit` `spatialOrbitAxis` and update `spatialRasterLayers` with new parts
    - Add spatial view state coordination types to `LayerController`
    - Update UI for `LayerController`
- Global visbiility prop per layer in `spatialRasterLayers`.
- Add indication to Y axis title of cell set expression violin plot when log-transformation is active.

### Changed
- Cache cell set polygon outputs and do not calculate them unless requested.
  - Modify the cache to use an array of tuples, since using an array as an object key results in conversion to string.
- Clean up `getFlatArrDecompressed` fetching.
- Fix bitmask remove button style.
- Don't show 3D dropdown if only 2D is available.
- Don't show Volume tab (or any tabs) when 3D is not available.

## [1.1.10](https://www.npmjs.com/package/vitessce/v/1.1.10) - 2021-05-19

### Added
- Add support for bitmasks to `Spatial` component and raster schema.
- Worker pool for processing heatmap tiles.

### Changed
- Use GH Action for Cypress specifically due to random failures on OME-TIFF example.
- Use raster loader for initial view state when present instead of cells.
- Fix `VlenUtf8` parsing for zarr.
- Fix bug where adding/removing layers only adds a `bitmask` controller.
- Fix condition for showing lasso with bitmask and/or centroids.
- Fix 0's displaying when selection is not enabled for `Spatial`.
- Fix bug where polygons or centroids would show under the `bitmask`.
- `bitmask` color texture creation assumed that `cellColors` prop was only rgb, but it can be rgba.
- Fix bug where quadtree wouldn't work with only scatterplot.
- Fix controller padding bug.
- Ensure `VlenUtf8` filter is only used/checked when necessary.

## [1.1.9](https://www.npmjs.com/package/vitessce/v/1.1.9) - 2021-05-07

### Added
- Add opacity slider when `layerController` is closed, with label.

### Changed
- Fix `cellSetColor` null bug.
- Improve violin plot performance by making `useExpressionByCellSet` faster.
- Allow for autosizing `CellSetExpressionPlot` bottom margin depending on axis labels.
- Make margin bottom of `CellSetExpressionPlot` proportional to the square root of the number of characters because the `labelAngle` is 45.

## [1.1.8](https://www.npmjs.com/package/vitessce/v/1.1.8) - 2021-03-31

### Added

### Changed
- Don't request `zattrs` every time when running `loadGeneSelection` on the AnnData loader.
- Fixed scale bar not displaying from `Viv` `0.9.3` issue.
- Fixed interleaved image not dispalying bug.
- Fix `raster` schema bug.
- Cache initial load of image settings.

## [1.1.7](https://www.npmjs.com/package/vitessce/v/1.1.7) - 2021-03-24

### Added
- Added logo to README.
- Log2 (plus 1) scaling for Violin Plot
- Add gene name to expression violin plot.
- Added a new view config schema version `1.0.1` which splits `spatialLayers` into `spatialRasterLayers`, `spatialCellsLayer`, `spatialMoleculesLayer`, and `spatialNeighborhoodsLayer`.
    - Added an auto-upgrade function to upgrade from v1.0.0 to v1.0.1.
    - Spatial layer definition objects in v1.0.1 do not have a `type` property.
- Added support for OME-Zarr raster files with the `OmeZarrLoader` class.
- Added a `title` prop for all subscriber components, to allow users to override component titles through the view config.
- `fetchOptions` for zarr loader via `requestInit` in config.

### Changed
- Fix bug from #867 where the view config is temporarily invalid due to null values.
- Separate out hooks to allow for arbitrary gene slicing.
- Update AnnData loader to handle artbitrary gene slicing.
- Updated the data hook functions to handle coordination value initialization, rather than doing initialization at the subscriber component level.
- `useDevicePixels` for large datasets in `AbstractSpatialOrScatterplot`.
- Use `Array.from` instead of `new Array` for `BaseAnnDataLoader`
- Use `concaveman` instead of `@turf/concave`.
- Fix `categories` parsing for AnnData with `dtype=|O`.
- Do not do call `makeDefaultGetCellIsSelected` if not necessary.
- Upgrade `Viv` to 0.9.3.
- Fix bug where formatting was required for image loader `metadata`.

## [1.1.6](https://www.npmjs.com/package/vitessce/v/1.1.6) - 2021-03-05

### Added
- Added a banner to the current minimal demo site, pointing to the beta version of the documentation and next iteration of the demo site.

### Changed
- Used `DataFilterExtension` from `deck.gl` to speed up filtering selections.

## [1.1.5](https://www.npmjs.com/package/vitessce/v/1.1.5) - 2021-02-25

### Added
- View state will automatically be set if it is not found for `Scatterplot` and `Spatial` components.

### Changed
- Added a check for undefined in the `nodeToSet` function in `cell-set-utils.js`.
- Fix bug which previously caused `anndata-cells.zarr` file types to fail to load when lacking a `"factors"` option.
- `targetX` and `targetY` coordination values are `null` by default.

## [1.1.4](https://www.npmjs.com/package/vitessce/v/1.1.4) - 2021-02-11

### Added
- Added an optional `description` field to the dataset definition config object. Updated the `<Description/>` component to prefer this value over the top-level description value, if available.
- Add `transparentColor` to `LayerController` for multi-modal imaging.

### Changed
- Fix AnnData text decoding.
- Refactor AnnData flat array decoding and resolve bug.
- Upgrade viv to 0.8.3
- Fix non-string cell id parsing in AnnData.
- Add automatic physical size scaling for multi-modal imaging if sizes are found.

## [1.1.3](https://www.npmjs.com/package/vitessce/v/1.1.3) - 2021-01-07

### Added
- Added a windows OS build to the Github Actions test matrix.

### Changed
- Upgrade Viv to 0.8.2 and deck.gl to 8.4.0-alpha.4

## [1.1.2](https://www.npmjs.com/package/vitessce/v/1.1.2) - 2020-12-31

### Added
- Allow for non-remote raster schemas.

### Changed
- Upgrade Viv to 0.8.0 and deck.gl to 8.4.0-alpha.2
- Added GitHub Actions workflow to replace the Travis CI workflow.
- Fix `test.sh` branch variable again.
- Fix deploy step again.
- Changed to using camelCase in the cell-sets-tabular schema.
- Fixed CSV and JSON file import / export bugs in the cell set manager component.

## [1.1.1](https://www.npmjs.com/package/vitessce/v/1.1.1) - 2020-12-27

### Added
- Implemented the view config API in JavaScript in a class called `VitessceConfig`.
- Add searchable genes list.
- Support loading AnnData from zarr.
- Added scatterplot component options pane.
- Added a `TextLayer` to render cell set names over the corresponding cell set centroid in the scatterplot.
- Added a gene expression histogram Vega-Lite component and a cell set by gene expression violin plot Vega component.

### Changed
- Genes list is now a virtual scroll to allow for more performant rendering.
- Fix molecules highlight reversion - hovered molecules now appear in the status component.
- Remove "Add Channel" button for RGB images.
- Lazy load HiGlass (and PIXI.js) from absolute URLs (unpkg) to avoid dynamic script import issues with relative paths after bundling.
    - When loading JS resources for HiGlass and PIXI.js, use the current environment (dev/prod) to determine `min.js` vs `js` extensions, and use `package.json` to determine package versions.
- Make ability to do cell set operations (union, intersection, complement) less restrictive
- Implemented the `genomicZoomX`, `genomicZoomY`, `genomicTargetX`, and `genomicTargetY` coordination types for coordinating the zoom and pan interactions of multiple HiGlass views.
    - Simplified the `hgViewConfig` prop so that it supports only a single HiGlass view, and then allows Vitessce to handle the HiGlass view's `initialXDomain` and `initialYDomain` properties (through the coordination space), as well as the rest of the view config.
    - Added the `genomicProfiles` component which abstracts away the HiGlass view config.

## [1.1.0](https://www.npmjs.com/package/vitessce/v/1.1.0) - 2020-11-17

### Added
- Built-in support for encoding and decoding compressed conf as url param.
- Add heatmap controls state to saved view config.
- Add `spatialLayers` validation to config schema.
- Add heatmap support to schema.
- `domainType` is now part of the raster spatial layers.
- `domain` is now removed from raster spatial layer channel definition schema, since channel-level domain settings could conflict with layer-level domain _type_ settings.

### Changed
- Fixed schema validity as state updates.
    - Expanded schema to allow null values which denote that these values can be auto-initialized.
        - Note that we do not want the empty array to denote anything special.
- For demos, added a `&debug=true` GET parameter option, to enable logging and validating the published view config on every change.
- Updated cell set functionality to support exporting state via view config:
    - Added the `additionalCellSets` coordination type to store user-defined cell sets
    - Added the `cellSetColor` coordination type to store mappings from cell set paths to cell set colors (for both user-defined and dataset-defined cell sets).
    - Updated the code to avoid reliance on uuid "key" variables. Instead, we want to always use the "name path": the array of strings representing the path down the hierarchy to the node.
    - Removed the distinction between "visible" sets and "selected" (i.e. checked) sets.
- Upgrade deck.gl to 8.3 and viv to 0.5
- Fix build issues with nebula.
- Use URL fragment instead of query param for `export-utils`.
- Store updates to the grid layout (removing / moving / resizing) in the view config zustand store.
- Clear the cell set selection when selecting a gene in `GenesSubsrciber`. Clear the gene selection when selecting cell set(s) in `CellSetsManagerSubscriber`.
- Don't require raster imagery for `layerController`.
- Fix bug from removing `domain` from the config schema that prevented updates when loader selection changes.
- Fix `additionalCellSets` having a tree without a version number.
- Update Viv reference

## [1.0.0](https://www.npmjs.com/package/vitessce/v/1.0.0) - 2020-09-2

### Added
- Introduced a [zustand](https://github.com/react-spring/zustand) store for managing the view config:
    - coordination space
    - layout
        - component-level coordination scopes
- Introduced a provider component: `DatasetLoaderProvider`.
    - `DatasetLoaderProvider` sets up Loader objects for each file of each dataset in the view config.
    - `VitessceGrid` is a consumer of `DatasetLoaderProvider` and injects the mapping from datasets-to-loaders into the child `___Subscriber` components. This functionality replaces the `SourcePublisher` component.
        - The loading spinner was moved into a new `LoadingIndicator` component.
        - Added a new prop `isReady` for the `TitleInfo` component (parent of the `LoadingIndicator` component), so that each `___Subscriber` component can handle its own loading spinner.
- Added a required `version` property to the view config schema.
- Added the `initStrategy` property to the `v1.0.0` view config schema, where the value can be one of `"auto"` or `"none"` (and potentially other things in the future).
    - This will determine how the coordination space is initialized.
    - `"auto"` results in certain coordination types having "global" coordination (all components map to same scope) while the remaining coordination types have "independent" coordination (all components map to different scopes).
        - The `"auto"` strategy also respects any initial coordination setup, and only fills in missing values.
- Added support for both `v0.1.0` ("legacy") and `v1.0.0` (coordination model) view configs via an `upgrade()` function.
    - `v0.1.0` view configs will be validated against the `v0.1.0` schema, then upgraded, and then validated again against the `v1.0.0` schema.
- Added a unique name constraint for cell set names.
    - Because `cellSetSelection` is now a coordination type, the value must be stored in the view config. Previously, multiple cell sets were allowed to exist with the same name because cell sets were identified with a random uuid key internally. We would not want a random uuid key to "leak" into the global state or view config, and instead want to use an externally-meaningful name when identifying cell sets in the view config.
    - Due to this constraint, the automatic naming for cell selections as `"Current selection"` (or `"Current union"`, `"Current intersection"`, `"Current complement"`) have been changed to `"Selection {i}"` (or `"Union {i}"`, `"Intersection {i}"`, `"Complement {i}"`) where `{i}` is the next integer that does not cause a conflict.
- Added the optional `onConfigChange` and `onLoaderChange` callback props to the `Vitessce` component.
    - These allow a consumer app to be notified of all view config (and by extension coordination object) updates.

### Changed
- Update README screenshots.
- Fixed bug in `Status` component in which `cellHighlight` and `geneHighlight` were incorrectly expected to be objects.
- Moved the `Vitessce` component out of `src/app/app.js` into `src/app/Vitessce.js`.
- Moved the `Warning` component out of `src/app/app.js` into `src/app/Warning.js`.
- Renamed `VitessceGrid` to `VitessceGridLayout`.
- Renamed `PubSubVitessceGrid` to `VitessceGrid`.
- Moved utility functions that are common to both `src/components/` and `src/app/` to a new `src/utils.js` file.
- Updated the view config schema to include a coordination space, which supports coordinated multiple view functionality. The coordination space holds coordination objects, each of which has a type, a set of scopes, and a value assigned to each scope.
- Updated the view config schema to handle multiple datasets, and added a `dataset` configuration object type for coordinated multi-dataset view configs.
- Added a mapping from component type to coordination object types, streamlining the process of consuming and updating coordination object state in the `___Subscriber` components.
- Removed the unnecessary `name` field from dataset file definitions (previously a property of the `layers` objects) in the view config.
- Changed view config `layers[].type` (now `datasets[].files[].type`) values to lowercase.
- Renamed `staticLayout` to `layout` in the view config.
- Changed the title text of `LayerController` from "Layer Controller" to "Spatial Layers".
- Moved the Spatial layer initialization from `LayerControllerSubscriber` to `SpatialSubscriber`.
    - Changed the `LayerControllerSubscriber` to a "controlled" component which obtains layer state information from the `spatialLayers` coordination object.
    - Eliminated usage of randomly-generated uuids for layer and channel states.
- Changed the `Spatial` component implementation (back) to a React class component, after experiencing difficult-to-debug performance issues with the function component implementation.
- Simplified the `GenesSubscriber` implementation such that it no longer handles converting gene expression data to colors. Instead, the plot components (spatial, scatterplot, and heatmap) must look up the gene expression data and handle color conversion themselves, de-coupling them from `GenesSubscriber`.
- Added a file `src/components/data-hooks.js` containing React hook functions for initial data load (and data update subscriptions) for each data type.
    - Added error handling for data loading errors within the hook functions, which emit the `STATUS_WARN` event and subsequently call the `Vitessce` component's `onWarn` prop.
- Added a file `src/components/hooks.js` containing custom React hook functions which are un-related to dataset management (see above bullet).
    - Moved existing hook functions out of `src/components/utils.js` and into this `src/components/hooks.js` file.
- Removed the global app-level "please wait" spinner, and replaced with component-level spinners, to account for the multi-dataset support (for example if the dataset coordination object for a component changes then the component will need to obtain a different dataset, and this may occur at any time).
- Moved auto image layer initialization out of `LayerControllerSubscriber` and into `SpatialSubscriber` to allow initialization even when no `layerController` component exists.
- Removed usage of random uuid values from image layer identifiers, and instead replace with the `index` property, which refers to the index of the layer within the `raster.json` layer array.
- Switched from a local layer controller state management approach (via local reducer functions) to a global coordination object layer state management approach.
- Switched from using the property `visibility` to `visible` in image channel state to be more consistent with DeckGL layer `visible` convention.
- Moved a `range()` function call out of a "hot" loop in `src/components/heatmap/utils.js` to cache the value and prevent calling every iteration (every row and column during heatmap tile creation).
- Updated `___TooltipSubscriber` components and the `Status` component to use the `cellHighlight` and `geneHighlight` coordination object values. This allows highlight functionality to be local to a particular coordination scope (rather than global to the whole app).
- Updated the `DescriptionSubscriber` to use the image layer definitions in the `spatialLayers` coordination object.
- Refactored the `Status` and `StatusSubscriber` components to move the `TitleInfo` child component out of `Status` and into `StatusSubscriber` to be consistent with the other subscriber components.
- Separate out development from production builds.
- Only test/publish on production builds.
- Don't include dependencies in production ES build.
- Added terms and diagrams related to the coordination model to the `GLOSSARY.md` document.
- Update README screenshots.
- Use a random `uuid` when upgrading `v0.1.0` view configs to `v1.0.0` to enable the data hook `dataset` dependency to detect dataset updates resulting from passing new view configs.
- Fixed bug in `Status` component in which `cellHighlight` and `geneHighlight` were incorrectly expected to be objects.
- Fix `Spatial` initialization bug.

## [0.2.5](https://www.npmjs.com/package/vitessce/v/0.2.5) - 2020-08-31

### Added
- Add contributor information to homepage.

### Changed
- Updated styling and text of homepage.

## [0.2.4](https://www.npmjs.com/package/vitessce/v/0.2.4) - 2020-08-24

### Added
- Added the `higlass-zarr-datafetchers` dependency.
- Added a demo containing a HiGlass component with a `horizontal-multivec` track using a `zarr-multivec` plugin data fetcher.
- Add auto-sliders to layer controller.

### Changed
- In the SpatialSubscriber component, no longer display counts for cells, molecules, or locations if the count value is zero.
- Upgrade Viv to 0.4.2.
- Fix channel names bug (#721) where they do not show if they are not the first dimension.
- Make sliders nicer for 32 bit data.

## [0.2.3](https://www.npmjs.com/package/vitessce/v/0.2.3) - 2020-08-04

### Changed
- Upgrade Viv to 0.3.3 to fix a tiff parsing issue.
- Removed the lines between the radio buttons in the cell set manager to make a more compact interface.


## [0.2.2](https://www.npmjs.com/package/vitessce/v/0.2.2) - 2020-08-03

### Changed
- Upgrade `vitessce-grid` to 0.0.10 to fix problem switching view configurations.
- Copied the `vitessce-grid` source files into the `vitessce` repository to reduce friction when updating the `vitessce-grid` code (avoids an extra NPM publish / pull-down).
- Fixed tests in `VitessceGrid.test.js`.


## [0.2.1](https://www.npmjs.com/package/vitessce/v/0.2.1) - 2020-07-30

### Changed
- Fixed a bug (typo in prop name) in which the heatmap axis title overrides were not passed correctly from HeatmapSubscriber to Heatmap.


## [0.2.0](https://www.npmjs.com/package/vitessce/v/0.2.0) - 2020-07-30

### Added
- Added the `fileType` property to the view config `layers` objects, which is used to choose a data loader class.

### Changed
- Improved the heatmap by re-implementing using DeckGL layers.
- Update Download button style/action in `TitleInfo` as per #681.
- Bump Viv to 0.3.2.
- Prevent CellSetManager leaf node "switcher icons" from calling the TreeNode component's `onNodeExpand` function.


## [0.1.10](https://www.npmjs.com/package/vitessce/v/0.1.10) - 2020-07-24

### Added

### Changed
- Fix #674 bug around flipped scatterplots.
- Fix #645 bug around clearing genes and heatmap.
- Add heatmap label override.
- Fix #682 `TitleInfo` spacing bug.
- Remove Global dimensions when there is only one value (for OME-TIFF, mostly).


## [0.1.9](https://www.npmjs.com/package/vitessce/v/0.1.9) - 2020-07-23

### Added
- Add `labelOverride` prop for genes component.
- Cell boundaries are visible when opacity drops below a cutoff.
- Add download lists for files to components that display data.
- Added `onWarn` callback to the `<Vitessce/>` component to allow a consumer app to manage display of warning messages.
- Set RGB defaults for Viv.

### Changed
- Remove layers menu and add functionality to layer controller + opacity control.
- Update genes schema to take non-integer values.
- Changed the `SelectionLayer` picking approach to use a quadtree rather than the built-in deck.gl pixel-based method.
- Flip y-axis for our graphics use-case.
- Clean up pubsub events in layer controller.
- Slider range remains as unchanged as possible under domain changes.
- Take away some spacing from `LayerController`.
- Make `LayerControllerSubscriber` names booleans-questions.
- Fix reisizing bug.
- Bump `vitessce-data` to 0.0.30.
- Changed the "Please wait" modal to a spinner.
- Bump `viv` to 0.3.1.
- Fix Heatmap regression/bug.
- Fix Cypress tests.
- Make cell boundaries depend on a pixel size setting.
- Fix small slider bug so the range stays the same.
- Filter our zarr from file list.

## [0.1.8](https://www.npmjs.com/package/vitessce/v/0.1.8) - 2020-07-02

### Added
- Trevor's slides from NLM conference to README.md.
- Added a `cell-sets.json` schema version `0.1.3` to support probabilistic cell set assignments, with backwards compatibility with schema version `0.1.2`.
- Added a `RESET` event so that the `SourcePublisher` can notify other components that a new viewconfig and dataset has been loaded.
- Added a callback for the `RESET` event in the `SpatialSubscriber` component to clear previous cells, molecules, neighborhoods, and imaging data.
- Added a callback for the `RESET` event in the `DescriptionSubscriber` component to clear previous imaging metadata tables.
- Added a callback for the `RESET` event in the `CellSetsManagerSubscriber` component to clear previous cell sets.
- Added a publisher for `GRID_RESIZE` when `rowHeight` changes in `PubSubVitessceGrid` to allow the `useGridItemSize` hook to update in this additional case. 

### Changed
- Updated the `cell-sets.json` schemas to allow both leaf nodes and non-leaf nodes in the same tree level.
- Updated the `cell-sets.json` schemas to allow both leaf nodes and non-leaf nodes in the same tree level.
- Update layer controller overflow.
- Updated the `Spatial` component data processing of `cells`, `molecules`, and `neighborhoods` with `useMemo` (rather than `useRef` + `useEffect`).
- Temporarily removed the `React.lazy` wrapper for the `Vega` component from `react-vega`, as a workaround for https://github.com/hubmapconsortium/portal-ui/issues/571 (using Vitessce viewconfigs with React.lazy components is causing the HuBMAP portal interface to crash).
- Increased the `isNarrow` threshold from `300` to `500` for the `CellTooltip` component, to use a smaller font size at a wider plot width.


## [0.1.7](https://www.npmjs.com/package/vitessce/v/0.1.7) - 2020-06-25

## Added
- Testing protocol calls for all three browsers now.

### Changed
- Fix Safari channel controller bug.
- Fix Safari heatmap display bug.
- Heatmap color canvas has precedence over selection canvas when resizing.

## [0.1.6](https://www.npmjs.com/package/vitessce/v/0.1.6) - 2020-06-23

### Added
- Added the `cellOpacity` prop for the `Scatterplot` and `Spatial` components, to pass a value to the `opacity` deck.gl `ScatterplotLayer` and `PolygonLayer` prop.
- Imaging support for Safari via a new Viv version.

### Changed
- Change one of the initial colors from red to magenta.
- Use kebab-case for cell sets files (`cell_sets` becomes `cell-sets`).
- Upgraded HiGlass to v1.9.5 and scoped the HiGlass external CSS under the `vitessce-container` class using SCSS nesting.
- Remove height css from color palette.

## [0.1.5](https://www.npmjs.com/package/vitessce/v/0.1.5) - 2020-06-15

### Added
- Initial slider/selection values and light theme for channel controller.
- Added a `VegaPlot` component, a Vega-Lite implementation of a cell set size bar plot, and a `useGridItemSize` hook to enable responsive charts.
- Compute the `cellRadiusScale` prop of `Scatterplot` relative to the extent of the `cells` mapping coordinates.

### Changed
- Updated the selection coloring for the `Scatterplot` and `Spatial` layers to take the theme background color into account.
- Switched to a black background color for `Spatial` regardless of theme.
- Pass the `height` prop to `VitessceGrid` so that the `WidthProvider` component can detect `height` changes.
- Updated slider color for white slider with white theme.

## [0.1.4](https://www.npmjs.com/package/vitessce/v/0.1.4) - 2020-06-01

### Added
- Added `METADATA_REMOVE` event to facilitate removal of image layer metadata from the `DescriptionSubscriber` upon layer removal.
- Added support for providing cell sets files in view configs.
- Added support for responsive height in the `Welcome` and `PubSubVitessceGrid` components.

### Changed
- Refactored the Scatterplot and Spatial components. Removed the AbstractSelectableComponent class. Moved getter functions to props.
- Added `src/` to the list of directories to publish to NPM, and renamed build directories (`build-lib/` to `dist/` and `build-demo/` to `dist-demo/`).
- Abstracted the CellTooltip components to allow any child element to be passed as the tooltip content.
- Updated the cell set hierarchy schema.
- Updated the cell set manager, to try to improve usability.
- Updated the default color palette to improve visibility when using the light theme.
- Increased the minimum & maximum scatterplot radius and added the `cellRadiusScale` prop.

## [0.1.3](https://www.npmjs.com/package/vitessce/v/0.1.3) - 2020-05-15

### Added
- Trevor's lab presentation on multimodal imaging (2020-05-14).
- Added support for displaying tables of metadata in the `Description` component by wrapping in a `DescriptionSubscriber` component.

### Changed
- Updated README to note a change to the development process: back to merging feature branches into `master` (rather than a `dev` branch).
- Reduced global style creep by adding a `StylesProvider` with custom `generateClassName` function from [mui](https://material-ui.com/styles/api/#creategenerateclassname-options-class-name-generator). Temporarily commented out HiGlass styles.
- Scrollable image layer popout.
- Upgrade `viv` to 0.2.5.
- Theme for image layer button.

## [0.1.2](https://www.npmjs.com/package/vitessce/v/0.1.2) - 2020-05-12

### Added
- Added a Travis CI `deploy` step for publishing to NPM when on the master branch.
- OMETIFF loading for raster imagery.

### Changed
- Moved `demos.md` to `DEMOS.md`.
- Fixed the example JSON URL config in `TESTING.md`.
- Fixed a horizontal scroll bug caused by overflow of the `{num} genes` subtitle in the Linnarsson demo.
- Fixed a regression caused by the updated bundling scripts minifying HTML assets and removing intentional spaces.
- Upgrade LayerController to be more general.
- In `src/app/app.js` and `src/demo/index.js`, separated rendering from validation.
- Changed export method for components.
- Fixed backwards webpack `externals` object (`react` and `react-dom` were not properly externalized previously).
- Upgrade `viv` and `vitessce-grid` to 0.2.4 and 0.0.7, respectively.

## [0.1.1](https://www.npmjs.com/package/vitessce/v/0.1.1) - 2020-05-05

### Added
- HiGlass integration
- Added multi-modal Spraggins example.
- Added a new event type `METADATA_ADD` for publishing layer metadata (image layer details, heatmap layer details, etc).

### Changed
- Changed rectangle tool interaction to dragging (rather than clicking twice).
- Clicking while using the rectangle or lasso tool now clears the current selection by emitting a new empty selection.
- Upgrade vitessce-image-viewer to `0.2.2`
- Changed `raster.json` schema.
- Changed `Channels` component to more general `LayerController` component which publishes `LAYER_ADD`, `LAYER_REMOVE`, and `LAYER_CHANGE` events.

## [0.1.0](https://www.npmjs.com/package/vitessce/v/0.1.0) - 2020-04-28

### Added
- Added a selectable table component with radio- and checkbox-like functionality.

### Changed
- Changed the bundling process so that subsets of components are bundled into separate JS files by targeting the `src/components/{name}/index.js` files.

## [0.0.25](https://www.npmjs.com/package/vitessce/v/0.0.25) - 2020-03-26
### Added
- Removed nwb, added custom webpack configuration.
- Added glossary.
- Added theme props, with support for "light" and "dark". Added a URL theme parameter for the demo.

### Changed
- Upgrade vitessce-image-viewer to 0.1.3 & use data loaders.
- Rename "LayerPublisher" to "SourcePublisher".
- Converted the polygon tool to a lasso tool.
- Loosened assumptions about cell info object properties when rendering cell hover messages to fix a `TypeError` bug.

## [0.0.24](https://www.npmjs.com/package/vitessce/v/0.0.24) - 2020-03-02
### Added
- Check that HTTP status is good before trying to parse response.
- Please-wait only applies to component.
- Make scatterplot dot size a constant 1px, and molecules 3px.
- Friendlier error if mapping in config doesn't match data.
- Test error handling in Cypress.
- Log a data-URI for the viewconf on load.
- Restore dark background to homepage.

### Changed
- No more missing spaces when we spell out the acronym.

### Removed
- Remove vestigial gh-pages.

## [0.0.23](https://www.npmjs.com/package/vitessce/v/0.0.23) - 2020-02-06
### Added
- HTTP headers to pass can be specified in the layers of the viewconf.
### Changed
- Fix merge-to-master builds on Travis.
- Upgrade vitessce-grid to v0.0.6 to support pane closing.
- Removed bootstrap and moved the small set of bootstrap styles being used into an SCSS mixin.
- Fixed broken rectangular selection tool (broke due to a `nebula.gl` upgrade from v0.12.0 to v0.17.1), but switched the interaction from dragging to clicking.

## [0.0.22](https://www.npmjs.com/package/vitessce/v/0.0.22) - 2019-01-22
### Added
- Now, a plain scatterplot will also clear the please-wait.

## [0.0.21](https://www.npmjs.com/package/vitessce/v/0.0.21) - 2019-01-21
### Added
- Until UI is available, dump viewconf to console.
- Added styles to prevent unintentional text selection during grid item resize in Safari.
### Changed
- Loosen the cells schema to accommodate data from HuBMAP.

## [0.0.20](https://www.npmjs.com/package/vitessce/v/0.0.20) - 2019-01-06
### changed
- Removed OpenSeadragon in favor of deckgl

## [0.0.19](https://www.npmjs.com/package/vitessce/v/0.0.19) - 2019-12-10
### Removed
- Removed Docz and .mdx files and update package.json.
### Added
- Travis checks that changelog was updated.
- Links to component demos.
- Top-level CSS rule to keep component styles from leaking out.
### Changed
- CSS filename in UMD no longer contains hash.
- Update to NodeJS 10 on Travis.

## [0.0.18](https://www.npmjs.com/package/vitessce/v/0.0.18) - 2019-11-18
### Added
- Initial zoom can be specified for scatterplots.
- Allow background imagery to be translated horizontally and vertically.
- Close cell set tabs.
- Color cell sets.
- Split long menu of cell operations into smaller menus from icons.
- Cell sets can be exported and imported as JSON.
- Union, intersection, and complement of cell sets.
- View all set descendants at a particular level.
- More public demos.
- Export `validateAndRender` for use as component.
### Changed
- Gave up on CSS modules. We'll still split out CSS into separate files, but the extra name-munging was just confusing.
- Crosshairs are now full height and width.
- S3 data is now organized by dataset.

## [0.0.17](https://www.npmjs.com/package/vitessce/v/0.0.17) - 2019-07-19
### Added
- Polygon selection tool leveraging the Nebula.gl package.
- Tooltip in heatmap.
- WIP: Using CSS modules.
- Hierarchical cell set manager component with save, name, rename, delete, rearrange, and view functionality.
### Changed
- PubSubVitessceGrid is now exported, and the registry lookup function is a parameter.
- A HiGlass demo no longer requires HiGlass to be checked in as part of this project.

## [0.0.16](https://www.npmjs.com/package/vitessce/v/0.0.16) - 2019-06-26
### Added
- Linked hover effect between spatial, scatterplot, and heatmap.
- Tooltip for cell status text upon hover in spatial and scatterplot views.
### Changed
- Using Deck.gl's built in picking instead of quadtree.

## [0.0.15](https://www.npmjs.com/package/vitessce/v/0.0.15) - 2019-06-07
### Added
- The `<TitleInfo>` component now takes children, and our JSX is tidier.
- Using [docz](https://www.docz.site/) for documentation, and add to the push script.
- Each JSON schema now checks that we are getting all and only the expected fields...
and we have a sort-of schema for the schema to make sure these checks are in place.
- Handle arbitrary mappings, not just t-SNE. Now computing PCA in vitessce-data.
- Flexible configuration: load components by name, or have multiple instances
of the same type of component.
- Half-baked proof-of-concept integration with HiGlass.
- Separate registry that holds Name -> Component mappings.
- Easy deployment to vitessce.io.
- Friendlier error page on AWS deployment.
- Display current version info in deployed demo.
- Can now specify the URL of a JSON config to load.
### Changed
- Make Heatmap more usable as a standalone.
- Fix (?) the scrollbars which had spontaneously appeared.
- Factor out the grid machinery into a separate package, `vitessce-grid`.
- More information on the Welcome page, so changed it to a two-column layout.

## [0.0.14](https://www.npmjs.com/package/vitessce/v/0.0.14) - 2019-04-29
### Added
- Add Cypress.io tests.
- Thank-you to NIH on the front page.
- Add Google Analytics to all pages.
- "Please wait" now waits for all layers.
- Use [react-grid-layout](https://github.com/STRML/react-grid-layout) for draggable panes;
Layouts can be specified either responsively, or with fixed grid positions. Grid height is
based on window height at load.
- Script (`push-demo.sh`) to push demo to S3, without making a new release.
- Use [OpenSeadragon](http://openseadragon.github.io/) for tiled imagery.
### Changed
- Spatial viewport is part of the initial FAKE_API_RESPONSE, instead of being hardcoded.
- Neighborhoods are enabled, but hidden by default.

## [0.0.13](https://www.npmjs.com/package/vitessce/v/0.0.13) - 2019-03-26
### Changed
- Lots of display tweaks to create a consistent dark color scheme.

## [0.0.12](https://www.npmjs.com/package/vitessce/v/0.0.12) - 2019-03-26
### Added
- Heatmap is row-normed. (This is a change in `vitessce-data`.)
- Borders on heatmap components... but this will be reverted.
- Cells are visible on initial load.
### Changed
- Dark color scheme, with better contrast when colored
- Heatmap spans the entire bottom.

## [0.0.11](https://www.npmjs.com/package/vitessce/v/0.0.11) - 2019-03-20
### Added
- Roll up the layers list when not hovered.
- Component titles give summary stats about data.
### Changed
- Change color scales, styling of unselected cells, and marquee rendering, to improve contrast.
- Only update selected set at end of drag.

## [0.0.10](https://www.npmjs.com/package/vitessce/v/0.0.10) - 2019-03-19
### Added
- Heatmap: Gene expression levels occupy most of the space; Above, there are bands showing
the currently selected cell set, and the current cell coloring.
### Changed
- Spatial and t-SNE backgrounds are now black.
- Move the Factor radio buttons to their own component, above Genes.

## [0.0.9](https://www.npmjs.com/package/vitessce/v/0.0.9) - 2019-03-17
### Added
- Neighborhoods layer: no interactivity, and it's obvious that the source data has some problems.
### Changed
- Got the image registration right, finally.
- Initial viewport is hardcoded: Data is no longer centered on (0, 0) origin.

## [0.0.8](https://www.npmjs.com/package/vitessce/v/0.0.8) - 2019-03-16
### Added
- Load and validate JSON for clusters, categorical factors, gene expression levels, and cell neighborhoods.
- Toggle between factor values: Spatial and t-SNE categorical colors are updated.
- Toggle between gene expression levels: Spatial and t-SNE continuous colors are updated.
- Toggle between multiple imagery layers.
### Changed
- The stained imagery is positioned and scaled better, but still slightly off.
- No outlines on cell polygons.

## [0.0.7](https://www.npmjs.com/package/vitessce/v/0.0.7) - 2019-03-07
### Added
- Component diagram and minimal documentation of library.
- Make space for a brief description of the dataset on the welcome page.
- Load background imagery.
- More unit tests.
- Label each component, and identify the current dataset.
- Replace global selection tools with in-component tools.
- Toggle visibility of each layer.
- "Please wait" while molecules load.
- Add placeholder for genes component.
### Changed
- Use a quadtree to identify the cells in the selected region.

## [0.0.6](https://www.npmjs.com/package/vitessce/v/0.0.6) - 2019-02-25
### Added
- Welcome screen where user picks dataset.
- All the cells are selected on start.
### Removed
- No longer supports drag and drop to add file.

## [0.0.5](https://www.npmjs.com/package/vitessce/v/0.0.5) - 2019-02-20
### Added
- Distinguish pan and single-select mode from drag-to-select.
- Drag-to-select supported for both Spatial and Tsne: Selection state is linked.
- Set of selected cells is updated during drag; there is also a grey overlay.
- Add the strict AirBNB linting rules.
- Load Linnarsson cell data by default, rather than starting from a blank screen.
### Changed
- Assume data has been scaled to fit a 2000 pixel-wide window, centered on the origin,
  and adjust line widths and dot sizes accordingly.

## [0.0.4](https://www.npmjs.com/package/vitessce/v/0.0.4) - 2019-02-08
### Added
- Drag and drop JSON files representing cells and molecules.
- There is a helpful link to the sample data download.
- JSON files are validated against schema, and detailed errors go to console.
- Flexbox CSS for clean columns.
