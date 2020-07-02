/* eslint-disable */
import React, {
  useRef, useState, useCallback, useEffect, useMemo,
} from 'react';
import DeckGL, {
  ScatterplotLayer, PolygonLayer, OrthographicView, COORDINATE_SYSTEM,
} from 'deck.gl';
import { VivViewerLayer, StaticImageLayer } from '@hubmap/vitessce-image-viewer';
import { SelectablePolygonLayer, getSelectionLayers } from '../../layers';
import LayersMenu from './LayersMenu';
import ToolMenu from '../ToolMenu';
import {
  cellLayerDefaultProps, PALETTE, DEFAULT_COLOR,
  DEFAULT_GL_OPTIONS,
  createDefaultUpdateStatus, createDefaultUpdateCellsSelection,
  createDefaultUpdateCellsHover,
  createDefaultUpdateViewInfo, createDefaultClearPleaseWait,
} from '../utils';

const COMPONENT_NAME = 'Spatial';
const CELLS_LAYER_ID = 'cells-layer';


export function square(x, y, r) {
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
}

/**
 * React component which expresses the spatial relationships between cells and molecules.
 * @prop {string} uuid
 * @prop {object} view
 * @prop {number} view.zoom
 * @prop {number[]} view.target See https://github.com/uber/deck.gl/issues/2580 for more information.
 * @prop {object} molecules
 * @prop {object} cells
 * @prop {object} neighborhoods
 * @prop {number} cellRadius
 * @prop {number} moleculeRadius
 * @prop {number} cellOpacity The value for `opacity` to pass
 * to the deck.gl cells PolygonLayer.
 * @prop {object} imageLayerProps
 * @prop {object} imageLayerLoaders
 * @prop {object} cellColors Object mapping cell IDs to colors.
 * @prop {Set} selectedCellIds Set of selected cell IDs.
 * @prop {function} getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @prop {function} getCellColor Getter function for cell color as [r, g, b] array.
 * @prop {function} getCellPolygon
 * @prop {function} getCellIsSelected Getter function for cell layer isSelected.
 * @prop {function} getMoleculeColor
 * @prop {function} getMoleculePosition
 * @prop {function} getNeighborhoodPolygon
 * @prop {function} updateStatus
 * @prop {function} updateCellsSelection
 * @prop {function} updateCellsHover
 * @prop {function} updateViewInfo
 * @prop {function} clearPleaseWait
 * @prop {function} onCellClick Getter function for cell layer onClick.
 */
export default function Spatial(props) {
  const {
    uuid = null,
    view = {
      zoom: 2,
      target: [0, 0, 0],
    },
    molecules = {},
    cells = {},
    neighborhoods = {},
    cellRadius = 50,
    moleculeRadius = 10,
    cellOpacity = 1.0,
    imageLayerProps = {},
    imageLayerLoaders = {},
    cellColors = {},
    selectedCellIds = new Set(),
    getCellCoords = cell => cell.xy,
    getCellColor = cellEntry => (cellColors && cellColors[cellEntry[0]]) || DEFAULT_COLOR,
    getCellPolygon = (cellEntry) => {
      const cell = cellEntry[1];
      return cell.poly.length ? cell.poly : square(cell.xy[0], cell.xy[1], cellRadius);
    },
    getCellIsSelected = cellEntry => (
      selectedCellIds.size
        ? selectedCellIds.has(cellEntry[0])
        : true // If nothing is selected, everything is selected.
    ),
    getMoleculeColor = d => PALETTE[d[2] % PALETTE.length],
    getMoleculePosition = d => [d[0], d[1], 0],
    getNeighborhoodPolygon = (neighborhoodsEntry) => {
      const neighborhood = neighborhoodsEntry[1];
      return neighborhood.poly;
    },
    updateStatus = createDefaultUpdateStatus(COMPONENT_NAME),
    updateCellsSelection = createDefaultUpdateCellsSelection(COMPONENT_NAME),
    updateCellsHover = createDefaultUpdateCellsHover(COMPONENT_NAME),
    updateViewInfo = createDefaultUpdateViewInfo(COMPONENT_NAME),
    clearPleaseWait = createDefaultClearPleaseWait(COMPONENT_NAME),
    onCellClick = (info) => {
      const cellId = info.object[0];
      const newSelectedCellIds = new Set(selectedCellIds);
      if (selectedCellIds.has(cellId)) {
        newSelectedCellIds.delete(cellId);
        updateCellsSelection(newSelectedCellIds);
      } else {
        newSelectedCellIds.add(cellId);
        updateCellsSelection(newSelectedCellIds);
      }
    },
  } = props;

  // In Deck.gl, layers are considered light weight, and
  // can be created and destroyed quickly, if the data they wrap is stable.
  // https://deck.gl/#/documentation/developer-guide/using-layers?section=creating-layer-instances-is-cheap

  const [layerIsVisible, setLayerIsVisible] = useState({
    molecules: false,
    cells: false,
    neighborhoods: false,
  });

  const deckRef = useRef();
  const viewRef = useRef({
    viewport: null,
    width: null,
    height: null,
    uuid,
  });
  const [gl, setGl] = useState(null);
  const [tool, setTool] = useState(null);

  const onViewStateChange = useCallback(({ viewState }) => {
    // Update the viewport field of the `viewRef` object
    // to satisfy components (e.g. CellTooltip2D) that depend on an
    // up-to-date viewport instance (to perform projections).
    const viewport = (new OrthographicView()).makeViewport({
      viewState,
      width: viewRef.current.width,
      height: viewRef.current.height,
    });
    viewRef.current.viewport = viewport;
    updateViewInfo(viewRef.current);
  }, [viewRef, updateViewInfo]);

  const onInitializeViewInfo = useCallback(({ width, height, viewport }) => {
    viewRef.current.viewport = viewport;
    viewRef.current.width = width;
    viewRef.current.height = height;
    updateViewInfo(viewRef.current);
  }, [viewRef, updateViewInfo]);

  const moleculesData = useMemo(() => {
    let result = null;
    if (molecules) {
      // Process molecules data and cache into re-usable array.
      result = [];
      result = Object.entries(molecules).flatMap(([molecule, coords], index) => {
          return coords.map(([x, y]) => [x, y, index, molecule]);
          // Because we use the inner function immediately,
          // the eslint warning about closures is a red herring:
          // The index and molecule values are correct.
      });
      if (clearPleaseWait) clearPleaseWait('molecules');
      setLayerIsVisible(prevLayerIsVisible => ({
        molecules: true,
        cells: prevLayerIsVisible.cells,
        neighborhoods: prevLayerIsVisible.neighborhoods,
      }));
    }
    console.log("running effect for molecules");
    return result;
  }, [molecules, clearPleaseWait]);

  const cellsData = useMemo(() => {
    let result = null
    if (cells) {
      // Process cells data and cache into re-usable array.
      result = Object.entries(cells);
      if (clearPleaseWait) clearPleaseWait('cells');
      setLayerIsVisible(prevLayerIsVisible => ({
        molecules: prevLayerIsVisible.molecules,
        cells: true,
        neighborhoods: prevLayerIsVisible.neighborhoods,
      }));
    }
    console.log("running effect for cells");
    return result;
  }, [cells, clearPleaseWait]);

  const neighborhoodsData = useMemo(() => {
    let result = null;
    if (neighborhoods) {
      // Process neighborhoods data and cache into re-usable array.
      result = Object.entries(neighborhoods);
      if (clearPleaseWait) clearPleaseWait('neighborhoods');
      setLayerIsVisible(prevLayerIsVisible => ({
        molecules: prevLayerIsVisible.molecules,
        cells: prevLayerIsVisible.cells,
        neighborhoods: false,
      }));
    }
    console.log("running effect for neighborhoods");
    return result;
  }, [neighborhoods, clearPleaseWait]);

  const cellsLayer = useMemo(() => {
    return new SelectablePolygonLayer({
      id: CELLS_LAYER_ID,
      backgroundColor: [0, 0, 0],
      opacity: cellOpacity,
      isSelected: getCellIsSelected,
      stroked: false,
      getPolygon: getCellPolygon,
      getColor: getCellColor,
      onClick: (info) => {
        if (tool) {
          // If using a tool, prevent individual cell selection.
          // Let SelectionLayer handle the clicks instead.
          return;
        }
        onCellClick(info);
      },
      visible: layerIsVisible.cells,
      ...cellLayerDefaultProps(cellsData, updateStatus, updateCellsHover, uuid),
    });
  }, [cellsData, layerIsVisible, updateStatus, updateCellsHover,
    uuid, onCellClick, tool, getCellColor, getCellPolygon, cellOpacity,
    getCellIsSelected]);

  const moleculesLayer = useMemo(() => new ScatterplotLayer({
    id: 'molecules-layer',
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    data: moleculesData,
    pickable: true,
    autoHighlight: true,
    getRadius: moleculeRadius,
    radiusMaxPixels: 3,
    getPosition: getMoleculePosition,
    getLineColor: getMoleculeColor,
    getFillColor: getMoleculeColor,
    onHover: (info) => {
      if (info.object) { updateStatus(`Gene: ${info.object[3]}`); }
    },
    visible: layerIsVisible.molecules,
  }), [moleculesData, moleculeRadius, getMoleculePosition, getMoleculeColor,
    layerIsVisible, updateStatus]);

  const neighborhoodsLayer = useMemo(() => new PolygonLayer({
    id: 'neighborhoods-layer',
    getPolygon: getNeighborhoodPolygon,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    data: neighborhoodsData,
    pickable: true,
    autoHighlight: true,
    stroked: true,
    filled: false,
    getElevation: 0,
    getLineWidth: 10,
    visible: layerIsVisible.neighborhoods,
  }), [neighborhoodsData, layerIsVisible, getNeighborhoodPolygon]);

  const renderImageLayer = useCallback((layerId, loader) => {
    const layerProps = imageLayerProps[layerId];
    if (!loader || !layerProps) return null;
    const { scale, translate, isPyramid } = loader;
    const Layer = isPyramid ? VivViewerLayer : StaticImageLayer;
    return new Layer({
      loader,
      id: layerId,
      colorValues: layerProps.colors,
      sliderValues: layerProps.sliders,
      loaderSelection: layerProps.selections,
      channelIsOn: layerProps.visibilities,
      opacity: layerProps.opacity,
      colormap: layerProps.colormap.length > 0 && layerProps.colormap,
      scale: scale || 1,
      translate: translate ? [translate.x, translate.y] : [0, 0],
    });
  }, [imageLayerProps]);

  const imageLayers = useMemo(() => Object.entries(imageLayerLoaders)
    .map(([layerId, layerLoader]) => renderImageLayer(layerId, layerLoader)), [
    renderImageLayer, imageLayerLoaders,
  ]);

  const layers = [
    ...imageLayers,
    cellsLayer,
    neighborhoodsLayer,
    moleculesLayer,
  ];

  const selectionLayers = getSelectionLayers(
    tool,
    view.zoom,
    CELLS_LAYER_ID,
    getCellCoords,
    updateCellsSelection,
  );

  const layersMenu = useMemo(() => {
    // Don't render if just image data
    if (!molecules && !neighborhoods && !cells) return null;
    return (
      <LayersMenu
        layerIsVisible={layerIsVisible}
        setLayerIsVisible={setLayerIsVisible}
      />
    );
  }, [setLayerIsVisible, layerIsVisible, molecules, neighborhoods, cells]);

  const deckProps = {
    views: [new OrthographicView({ id: 'ortho' })], // id is a fix for https://github.com/uber/deck.gl/issues/3259
    // gl needs to be initialized for us to use it in Texture creation
    layers: gl ? layers.concat(selectionLayers) : [],
    initialViewState: view,
    ...(tool ? {
      controller: { dragPan: false },
      getCursor: () => 'crosshair',
    } : {
      controller: true,
      getCursor: interactionState => (interactionState.isDragging ? 'grabbing' : 'default'),
    }),
  };

  return (
    <>
      <div className="d-flex">
        <ToolMenu
          activeTool={tool}
          setActiveTool={setTool}
          onViewStateChange={onViewStateChange}
        />
        {layersMenu}
      </div>
      <DeckGL
        glOptions={DEFAULT_GL_OPTIONS}
        ref={deckRef}
        onWebGLInitialized={setGl}
        {...deckProps}
      >
        {onInitializeViewInfo}
      </DeckGL>
    </>
  );
}
