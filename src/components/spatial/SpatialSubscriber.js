/* eslint-disable */
import React, {
  useState, useCallback, useEffect, useMemo, useRef,
} from 'react';
import PubSub from 'pubsub-js';
import shortNumber from 'short-number';
import TitleInfo from '../TitleInfo';
import {
  MOLECULES_ADD,
  MOLECULES_SET_OPACITY,
  MOLECULES_TURN_ON,
  NEIGHBORHOODS_ADD,
  CELLS_ADD,
  CELLS_COLOR,
  CELLS_SET_OPACITY,
  CELLS_TURN_ON,
  STATUS_INFO,
  CELLS_SELECTION,
  CELLS_HOVER,
  CLEAR_PLEASE_WAIT,
  VIEW_INFO,
  CELL_SETS_VIEW,
  LAYER_ADD,
  LAYER_REMOVE,
  LAYER_CHANGE,
  RESET,
  RASTER_ADD,
} from '../../events';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize, useReady } from '../utils';
import Spatial from './Spatial';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber';

import { useCoordination } from '../../app/state/hooks';
import { componentCoordinationTypes } from '../../app/state/coordination';

export default function SpatialSubscriber(props) {
  const {
    uid,
    loaders,
    coordinationScopes,
    removeGridComponent,
    moleculeRadius,
    cellRadius,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    subobservationsPluralLabelOverride: subobservationsPluralLabel = `${subobservationsLabel}s`,
    theme,
    disableTooltip = false,
  } = props;
  // Create a UUID so that hover events
  // know from which DeckGL element they were generated.
  const uuid = uid;

  const [{
    dataset,
    spatialZoom: zoom,
    spatialTarget: target,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTarget: setTarget,
  }] = useCoordination(componentCoordinationTypes.spatial, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(['cells']);

  const [cellsData, setCellsData] = useState(null);
  const [molecules, setMolecules] = useState(null);
  const [cellColors, setCellColors] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState(null);
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [imageLayerProps, setImageLayerProps] = useState({});
  const [imageLayerLoaders, setImageLayerLoaders] = useState({});
  const [cellOpacity, setCellOpacity] = useState(1);
  const [areCellsOn, setCellsOn] = useState(true);
  const [moleculesOpacity, setMoleculesOpacity] = useState(1);
  const [areMoleculesOn, setMoleculesOn] = useState(true);
  const [urls, setUrls] = useState([]);

  const [width, height, deckRef] = useDeckCanvasSize();


  useEffect(() => {
    resetReadyItems();
    loaders[dataset]?.loaders['cells'].load().then((d) => {
      setCellsData(Object.entries(d));
      setItemIsReady('cells');
    });
    
  }, [loaders, dataset]);



  const cellsCount = (cellsData ? cellsData.length : 0);
  const [moleculesCount, locationsCount] = useMemo(() => {
    if (!molecules) return [0, 0];
    return [
      Object.keys(molecules).length,
      Object.values(molecules)
        .map(l => l.length)
        .reduce((a, b) => a + b, 0),
    ];
  }, [molecules]);
  const updateStatus = useCallback(
    message => PubSub.publish(STATUS_INFO, message),
    [],
  );
  const updateCellsSelection = useCallback(
    selectedIds => PubSub.publish(CELLS_SELECTION, selectedIds),
    [],
  );
  const updateCellsHover = useCallback(
    hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo),
    [],
  );
  const updateViewInfo = useCallback(
    viewInfo => PubSub.publish(VIEW_INFO, viewInfo),
    [],
  );
  const clearPleaseWait = useCallback(
    layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName),
    [],
  );

  const getCellInfo = (cellId) => {
    const cell = cellsData.find(cell => cell[0] === cellId)
    if(cell && cell[1]) {
      return {
        [`${capitalize(observationsLabel)} ID`]: cell[0],
        ...cell[1].factors,
      };
    }
  };

  return (
    <TitleInfo
      title="Spatial"
      info={
        `${cellsCount} ${pluralize(observationsLabel, observationsPluralLabel, cellsCount)},
         ${moleculesCount} ${pluralize(subobservationsLabel, subobservationsPluralLabel, moleculesCount)}
         at ${shortNumber(locationsCount)} locations`
      }
      isSpatial
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <Spatial
        ref={deckRef}
        zoom={zoom}
        target={target}
        setZoom={setZoom}
        setTarget={setTarget}
        cells={cellsData}
        selectedCellIds={selectedCellIds}
        neighborhoods={neighborhoods}
        molecules={molecules}
        moleculesOpacity={moleculesOpacity}
        areCellsOn={areCellsOn}
        cellOpacity={cellOpacity}
        cellColors={cellColors}
        areMoleculesOn={areMoleculesOn}
        imageLayerProps={imageLayerProps}
        imageLayerLoaders={imageLayerLoaders}
        cellRadius={cellRadius}
        moleculeRadius={moleculeRadius}
        uuid={uuid}
        updateStatus={updateStatus}
        updateCellsSelection={updateCellsSelection}
        updateCellsHover={updateCellsHover}
        updateViewInfo={updateViewInfo}
        clearPleaseWait={clearPleaseWait}
      />
      {!disableTooltip && (
      <SpatialTooltipSubscriber
        uuid={uuid}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
      />
      )}
    </TitleInfo>
  );
}

SpatialSubscriber.defaultProps = {
  cellRadius: 50,
  moleculeRadius: 10,
};
