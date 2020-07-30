# Changelog

## 0.2.2

### Added

### Changed
- Removed the lines between the radio buttons in the cell set manager to make a more compact interface.

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
