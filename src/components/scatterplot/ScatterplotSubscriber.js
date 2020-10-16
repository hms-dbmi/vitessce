/* eslint-disable */
import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { extent } from 'd3-array';
import clamp from 'lodash/clamp';
import TitleInfo from '../TitleInfo';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls } from '../hooks';
import { setCellSelection, mergeCellSets } from '../utils';
import { useCellsData, useCellSetsData, useExpressionMatrixData } from '../data-hooks';
import { getCellColors } from '../interpolate-colors';
import Scatterplot from './Scatterplot';
import ScatterplotTooltipSubscriber from './ScatterplotTooltipSubscriber';
import {
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

const SCATTERPLOT_DATA_TYPES = ['cells', 'expression-matrix', 'cell-sets'];

export default function ScatterplotSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    removeGridComponent,
    theme,
    disableTooltip = false,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Get "props" from the coordination space.
  const [{
    dataset,
    embeddingZoom: zoom,
    embeddingTargetX: targetX,
    embeddingTargetY: targetY,
    embeddingTargetZ: targetZ,
    embeddingType: mapping,
    cellFilter,
    cellHighlight,
    geneSelection,
    cellSetSelection,
    cellSetColor,
    cellColorEncoding,
    additionalCellSets,
  }, {
    setEmbeddingZoom: setZoom,
    setEmbeddingTargetX: setTargetX,
    setEmbeddingTargetY: setTargetY,
    setEmbeddingTargetZ: setTargetZ,
    setCellFilter,
    setCellSetSelection,
    setCellHighlight,
    setCellSetColor,
    setAdditionalCellSets,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.scatterplot, coordinationScopes);

  const [urls, addUrl, resetUrls] = useUrls();
  const [width, height, deckRef] = useDeckCanvasSize();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    SCATTERPLOT_DATA_TYPES,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells, cellsCount] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [cellSets] = useCellSetsData(
    loaders,
    dataset,
    setItemIsReady,
    addUrl,
    false,
  );
  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, false,
  );

  const [cellRadiusScale, setCellRadiusScale] = useState(0.2);

  const mergedCellSets = useMemo(() => {
    return mergeCellSets(cellSets, additionalCellSets);
  }, [cellSets, additionalCellSets]);
  
  const cellColors = useMemo(() => getCellColors({
    cellColorEncoding,
    expressionMatrix,
    geneSelection,
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
  }), [cellColorEncoding, geneSelection, mergedCellSets, cellSetSelection, cellSetColor, expressionMatrix]);
  const cellSelection = Array.from(cellColors.keys());

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if (cells) {
      const cellCoordinates = Object.values(cells)
        .map(c => c.mappings[mapping]);
      const xExtent = extent(cellCoordinates, c => c[0]);
      const yExtent = extent(cellCoordinates, c => c[1]);
      const xRange = xExtent[1] - xExtent[0];
      const yRange = yExtent[1] - yExtent[0];
      const diagonalLength = Math.sqrt((xRange ** 2) + (yRange ** 2));
      // The 300 value here is a heuristic.
      const newScale = clamp(diagonalLength / 300, 0, 0.2);
      if (newScale) {
        setCellRadiusScale(newScale);
      }
    }
  }, [cells, mapping]);

  const getCellInfo = useCallback((cellId) => {
    const cellInfo = cells[cellId];
    return {
      [`${capitalize(observationsLabel)} ID`]: cellId,
      ...(cellInfo ? cellInfo.factors : {}),
    };
  }, [cells, observationsLabel]);

  return (
    <TitleInfo
      title={`Scatterplot (${mapping})`}
      info={`${cellsCount} ${pluralize(observationsLabel, observationsPluralLabel, cellsCount)}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <Scatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={({ zoom: newZoom, target }) => {
          setZoom(newZoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
          setTargetZ(target[2]);
        }}
        cells={cells}
        mapping={mapping}
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        cellColors={cellColors}

        setCellFilter={setCellFilter}
        setCellSelection={(v) => {
          setCellSelection(v, additionalCellSets, cellSetColor, setCellSetSelection, setAdditionalCellSets, setCellSetColor);
        }}
        setCellHighlight={setCellHighlight}
        cellRadiusScale={cellRadiusScale}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
      />
      {!disableTooltip && (
      <ScatterplotTooltipSubscriber
        parentUuid={uuid}
        cellHighlight={cellHighlight}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
      />
      )}
    </TitleInfo>
  );
}
