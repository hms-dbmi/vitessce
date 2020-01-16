import React from 'react';
import {openArray, slice} from "zarr";
import {Texture2D} from '@luma.gl/webgl'
import GL from '@luma.gl/constants';
import {
  ScatterplotLayer, PolygonLayer, BitmapLayer, COORDINATE_SYSTEM,
} from 'deck.gl';
import { SelectablePolygonLayer, IdentityCoordinatesTileLayer } from '../../layers';
import { cellLayerDefaultProps, PALETTE, DEFAULT_COLOR } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';
import LayersMenu from './LayersMenu';

var zarrImagePyramidArray = [];
var zarrMetaData = [];

export function square(x, y, r) {
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
}

function loadImage(src) {
  // This function replaces load from loaders.gl (7.3.5) which was not working
  // with this version of deckgl (7.1.4).
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', err => reject(err));
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

function loadZarr(x, y, z, tileSize, useHTTP2, tileSource, gl) {
  var zarrZoom = z * -1
  const config = {
    store: (useHTTP2 ? "https://vitessce-linnarsson-test.storage.googleapis.com/test-data/linnarsson_pyramid/" : 'https://vitessce-data.s3.amazonaws.com/test-data/linnarsson_pyramid/'),
    path: `pyramid_${zarrZoom}.zarr`,
    mode: "r"
  };
  // hardcoded with 3 channels (for now)
  const stride = tileSize * tileSize * 3
  if(zarrImagePyramidArray[zarrZoom] && zarrMetaData[zarrZoom]){
    const rowStride = stride * zarrMetaData[zarrZoom].width
    var arrSlice = slice((y * rowStride) + (x * stride), (y * rowStride) + ((x + 1) * stride));
    return zarrImagePyramidArray[zarrZoom].get([arrSlice,]).then((dataSlice) => {
      const texture = new Texture2D(gl, {
        width: tileSize,
        height: tileSize,
        // options for 32/16 bit data
        format: GL.RGB, //GL.RGB32UI/16UI
        // dataFormat: GL.RGB_INTEGER,
        // type: GL.UNSIGNED_SHORT,
        //format: GL.RGB,
        data: dataSlice.data,
        pixelStore: {
          [GL.UNPACK_FLIP_Y_WEBGL]: true
        },
        mipmaps: true //false for 32 and 16 bit, false for 8
      });
      return texture
    })
  } else{
    var arrSlice;
    var getMetadata = fetch(`${config.store}${config.path}/.zattrs`).then(response => response.json()).then((data) => {
      zarrMetaData[zarrZoom] = {height: data.height, width: data.width};
      const rowStride = stride * zarrMetaData[zarrZoom].width
      arrSlice = slice((y * rowStride) + (x * stride), (y * rowStride) + ((x + 1) * stride));
      return getDataSlice
    })
    var getDataSlice = openArray(config).then((arr) => {
      zarrImagePyramidArray[zarrZoom] = arr
      return arr.get([arrSlice,])
    }).then((dataSlice) => {
      const texture = new Texture2D(gl, {
        width: tileSize,
        height: tileSize,
        // options for 32/16 bit data
        format: GL.RGB, //GL.RGB32UI/16UI
        // dataFormat: GL.RGB_INTEGER,
        // type: GL.UNSIGNED_SHORT,
        //format: GL.RGB,
        data: dataSlice.data,
        pixelStore: {
          [GL.UNPACK_FLIP_Y_WEBGL]: true
        },
        mipmaps: true //false for 32 and 16 bit, false for 8
      });
      return texture
    });
    return getMetadata
  }
}


/**
 React component which expresses the spatial relationships between cells and molecules.
 */
export default class Spatial extends AbstractSelectableComponent {
  constructor(props) {
    super(props);
    this.state.layerIsVisible = {
      molecules: true,
      cells: true,
      neighborhoods: false,
      polyT: true,
      nuclei: true,
    };

    // In Deck.gl, layers are considered light weight, and
    // can be created and destroyed quickly, if the data they wrap is stable.
    // https://deck.gl/#/documentation/developer-guide/using-layers?section=creating-layer-instances-is-cheap
    this.moleculesData = [];
    this.cellsData = [];
    this.neighborhoodsData = [];
    this.images = [];
    this.maxHeight = 0;
    this.maxWidth = 0;
    this.setLayerIsVisible = this.setLayerIsVisible.bind(this);
    this.getInitialViewState = this.getInitialViewState.bind(this);
  }

  static defaultProps = {
    clearPleaseWait: (layer) => { console.warn(`"clearPleaseWait" not provided; layer: ${layer}`); },
    cellRadius: 10,
  };


  componentDidUpdate() {
    if (!this.props.images) {
      return;
    }
    const imageNames = Object.keys(this.props.images);
    // Add imagery to layerIsVisible UI toggle list, if not already present.
    if (!(imageNames[0] in this.state.layerIsVisible)) {
      // This is not ideal, but it should be OK as long as the `if` prevents an infinite loop.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState((prevState) => {
        imageNames.forEach((name) => {
          // TODO: Do not mutate! https://github.com/hubmapconsortium/vitessce/issues/148
          // eslint-disable-next-line no-param-reassign
          prevState.layerIsVisible[name] = true;
        });
        return prevState;
      });
    }
  }

  // These are called from superclass, so they need to belong to instance, I think.
  // eslint-disable-next-line class-methods-use-this
  getInitialViewState() {
    return this.props.view;
  }

  // eslint-disable-next-line class-methods-use-this
  getCellCoords(cell) {
    return cell.xy;
  }

  // eslint-disable-next-line class-methods-use-this
  getCellBaseLayerId() {
    return 'base-polygon-layer';
  }

  renderCellLayer() {
    const {
      selectedCellIds = new Set(),
      updateStatus = (message) => {
        console.warn(`Spatial updateStatus: ${message}`);
      },
      updateCellsHover = (hoverInfo) => {
        console.warn(`Spatial updateCellsHover: ${hoverInfo.cellId}`);
      },
      updateCellsSelection = (cellsSelection) => {
        console.warn(`Spatial updateCellsSelection: ${cellsSelection}`);
      },
      uuid = null,
    } = this.props;

    const { tool } = this.state;
    const { cellRadius } = this.props;

    return new SelectablePolygonLayer({
      id: 'polygon-layer',
      isSelected: cellEntry => (
        selectedCellIds.size
          ? selectedCellIds.has(cellEntry[0])
          : true // If nothing is selected, everything is selected.
      ),
      getPolygon(cellEntry) {
        const cell = cellEntry[1];
        return cell.poly.length ? cell.poly : square(cell.xy[0], cell.xy[1], cellRadius);
      },
      stroked: false,
      getColor: cellEntry => (
        (this.props.cellColors && this.props.cellColors[cellEntry[0]]) || DEFAULT_COLOR
      ),
      onClick: (info) => {
        if (tool) {
          // If using a tool, prevent individual cell selection.
          // Let SelectionLayer handle the clicks instead.
          return;
        }
        const cellId = info.object[0];
        if (selectedCellIds.has(cellId)) {
          selectedCellIds.delete(cellId);
          updateCellsSelection(selectedCellIds);
        } else {
          selectedCellIds.add(cellId);
          updateCellsSelection(selectedCellIds);
        }
      },
      visible: this.state.layerIsVisible.cells,
      ...cellLayerDefaultProps(this.cellsData, updateStatus, updateCellsHover, uuid),
    });
  }

  renderMoleculesLayer() {
    const {
      updateStatus = (message) => {
        console.warn(`Spatial updateStatus: ${message}`);
      },
    } = this.props;

    const getColor = d => PALETTE[d[2] % PALETTE.length];
    return new ScatterplotLayer({
      id: 'scatter-plot',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: this.moleculesData,
      pickable: true,
      autoHighlight: true,
      getRadius: this.props.moleculeRadius,
      getPosition: d => [d[0], d[1], 0],
      getLineColor: getColor,
      getFillColor: getColor,
      onHover: (info) => {
        if (info.object) { updateStatus(`Gene: ${info.object[3]}`); }
      },
      visible: this.state.layerIsVisible.molecules,
    });
  }

  renderNeighborhoodsLayer() {
    return new PolygonLayer({
      id: 'neighborhoods-layer',
      getPolygon(neighborhoodsEntry) {
        const neighborhood = neighborhoodsEntry[1];
        return neighborhood.poly;
      },
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: this.neighborhoodsData,
      pickable: true,
      autoHighlight: true,
      stroked: true,
      filled: false,
      getElevation: 0,
      getLineWidth: 10,
      visible: this.state.layerIsVisible.neighborhoods,
    });
  }

  renderImageLayers() {
    const layers = this.images.map(layer => this.createTileLayer(layer));
    return layers;
  }

  createTileLayer(layer) {
    const [layerType, source] = layer;
    const minZoom = Math.floor(-1 * Math.log2(Math.max(source.height, source.width)));
    return new IdentityCoordinatesTileLayer({
      id: `${layerType}-${source.tileSource}-tile-layer`,
      pickable: true,
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      getTileData: this.props.useZarr
        ? ({ x, y, z }) => {
          return loadZarr(x, y, z, source.tileSize, this.props.useHTTP2, `${source.tileSource}/${layerType}_files/img_pyramid`, this.state.gl)
        }
        : ({ x, y, z }) => {
          return loadImage(`${source.tileSource}/${layerType}_files/${z - minZoom}/${x}_${y}.jpeg`)
        },
      maxCacheSize: 100,
      minZoom: minZoom,
      maxZoom: 0,
      maxHeight: source.height,
      maxWidth: source.width,
      tileSize: source.tileSize,
      tileSource: source.tileSource,
      visible: this.state.layerIsVisible[layerType],
      renderSubLayers: (props) => {
        const {
          bbox: {
            west, south, east, north,
          },
        } = props.tile;
        const bml = new BitmapLayer(props, {
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          data: null,
          image: props.data,
          bounds: [west, south, east, north],
        });
        return bml;
      },
    });
  }

  setLayerIsVisible(layers) {
    this.setState({ layers });
  }

  renderLayersMenu() { // eslint-disable-line class-methods-use-this
    return (
      <LayersMenu
        layerIsVisible={this.state.layerIsVisible}
        setLayerIsVisible={this.setLayerIsVisible}
      />
    );
  }

  renderLayers() {
    const {
      molecules,
      cells,
      neighborhoods,
      images,
      clearPleaseWait,
    } = this.props;
    // Process molecules data and cache into re-usable array.
    if (molecules && this.moleculesData.length === 0) {
      Object.entries(molecules).forEach(([molecule, coords], index) => {
        this.moleculesData = this.moleculesData.concat(
          coords.map(([x, y]) => [x, y, index, molecule]), // eslint-disable-line no-loop-func
          // Because we use the inner function immediately,
          // the eslint warning about closures is a red herring:
          // The index and molecule values are correct.
        );
      });
    }
    // Process cells data and cache into re-usable array.
    if (cells && this.cellsData.length === 0) {
      this.cellsData = Object.entries(cells);
    }
    // Process neighborhoods data and cache into re-usable array.
    if (neighborhoods && this.neighborhoodsData.length === 0) {
      this.neighborhoodsData = Object.entries(neighborhoods);
    }
    if (images && this.images.length === 0) {
      this.images = Object.entries(images);
    }

    // Append each layer to the list.
    const layerList = [];

    if (images && clearPleaseWait) clearPleaseWait('images');
    layerList.push(...this.renderImageLayers());

    if (cells && clearPleaseWait) clearPleaseWait('cells');
    layerList.push(this.renderCellLayer());

    if (neighborhoods && clearPleaseWait) clearPleaseWait('neighborhoods');
    layerList.push(this.renderNeighborhoodsLayer());

    if (molecules && clearPleaseWait) clearPleaseWait('molecules');
    layerList.push(this.renderMoleculesLayer());

    return layerList;
  }
}
