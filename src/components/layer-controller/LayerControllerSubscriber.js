/* eslint-disable dot-notation */
import React, {
  useEffect, useCallback, useRef, forwardRef,
} from 'react';
import Grid from '@material-ui/core/Grid';
import TitleInfo from '../TitleInfo';
import RasterChannelController from './RasterChannelController';
import BitmaskChannelController from './BitmaskChannelController';
import VectorLayerController from './VectorLayerController';
import LayerController from './LayerController';
import ImageAddButton from './ImageAddButton';
import { useReady, useClosestVitessceContainerSize, useWindowDimensions } from '../hooks';
import { useCellsData, useMoleculesData, useRasterData } from '../data-hooks';
import {
  useCoordination,
  useLoaders,
  useAuxiliaryCoordination,
  useComponentLayout,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { initializeLayerChannels } from '../spatial/utils';
import { DEFAULT_RASTER_LAYER_PROPS } from '../spatial/constants';

const LAYER_CONTROLLER_DATA_TYPES = ['raster'];

// LayerController is memoized to prevent updates from prop changes that
// are caused by view state updates i.e zooming and panning within
// the actual Spatial component.  Re-rendering this component is very
// expensive so we have to be careful with props in this file in general.
const LayerControllerMemoized = React.memo(
  forwardRef((props, ref) => {
    const {
      title,
      removeGridComponent,
      theme,
      isReady,
      moleculesLayer,
      dataset,
      setMoleculesLayer,
      cellsLayer,
      canShowCellVecmask,
      setCellsLayer,
      rasterLayers,
      imageLayerLoaders,
      imageLayerMeta,
      rasterLayersCallbacks,
      setRasterLayersCallbacks,
      areLoadingRasterChannnels,
      setAreLoadingRasterChannnels,
      handleRasterLayerChange,
      handleRasterLayerRemove,
      disable3d,
      layerIs3DIndex,
      setZoom,
      setTargetX,
      setTargetY,
      setTargetZ,
      setRotationX,
      setRotationOrbit,
      componentHeight,
      componentWidth,
      spatialLayout,
      handleImageAdd,
    } = props;
    return (
      <TitleInfo
        title={title}
        isScroll
        removeGridComponent={removeGridComponent}
        theme={theme}
        isReady={isReady}
      >
        <div className="layer-controller-container" ref={ref}>
          {moleculesLayer && (
            <VectorLayerController
              key={`${dataset}-molecules`}
              label="Molecules"
              layerType="molecules"
              layer={moleculesLayer}
              handleLayerChange={setMoleculesLayer}
            />
          )}
          {cellsLayer && canShowCellVecmask && (
            <VectorLayerController
              key={`${dataset}-cells`}
              label="Cell Segmentations"
              layerType="cells"
              layer={cellsLayer}
              handleLayerChange={setCellsLayer}
            />
          )}
          {rasterLayers
            && rasterLayers.map((layer, i) => {
              const { index } = layer;
              const loader = imageLayerLoaders[index];
              const layerMeta = imageLayerMeta[index];
              // Could also be bitmask at the moment.
              const isRaster = !layerMeta?.metadata?.isBitmask;
              const ChannelController = isRaster
                ? RasterChannelController
                : BitmaskChannelController;
              // Set up the call back mechanism so that each layer manages
              // callbacks/loading state for itself and its channels.
              const setRasterLayerCallback = (cb) => {
                const newRasterLayersCallbacks = [
                  ...(rasterLayersCallbacks || []),
                ];
                newRasterLayersCallbacks[i] = cb;
                setRasterLayersCallbacks(newRasterLayersCallbacks);
              };
              const areLayerChannelsLoading = (areLoadingRasterChannnels || [])[i] || [];
              const setAreLayerChannelsLoading = (v) => {
                const newAreLoadingRasterChannnels = [
                  ...(areLoadingRasterChannnels || []),
                ];
                newAreLoadingRasterChannnels[i] = v;
                setAreLoadingRasterChannnels(newAreLoadingRasterChannnels);
              };
              return loader && layerMeta ? (
                <Grid
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${dataset}-raster-${index}-${i}`}
                  item
                  style={{ marginTop: '10px' }}
                >
                  <LayerController
                    name={layerMeta.name}
                    layer={layer}
                    loader={loader}
                    theme={theme}
                    handleLayerChange={v => handleRasterLayerChange(v, i)}
                    handleLayerRemove={() => handleRasterLayerRemove(i)}
                    ChannelController={ChannelController}
                    shouldShowTransparentColor={isRaster}
                    shouldShowDomain={isRaster}
                    shouldShowColormap={isRaster}
                    // Disable 3D if given explicit instructions to do so
                    // or if another layer is using 3D mode.
                    disable3d={
                      (disable3d || []).indexOf(layerMeta.name) >= 0
                      || (typeof layerIs3DIndex === 'number'
                        && layerIs3DIndex !== -1
                        && layerIs3DIndex !== i)
                    }
                    disabled={
                      typeof layerIs3DIndex === 'number'
                      && layerIs3DIndex !== -1
                      && layerIs3DIndex !== i
                    }
                    rasterLayersCallbacks={rasterLayersCallbacks}
                    setRasterLayerCallback={setRasterLayerCallback}
                    setViewState={({
                      zoom: newZoom,
                      target,
                      rotationX: newRotationX,
                      rotationOrbit: newRotationOrbit,
                    }) => {
                      setZoom(newZoom);
                      setTargetX(target[0]);
                      setTargetY(target[1]);
                      setTargetZ(target[2]);
                      setRotationX(newRotationX);
                      setRotationOrbit(newRotationOrbit);
                    }}
                    setAreLayerChannelsLoading={setAreLayerChannelsLoading}
                    areLayerChannelsLoading={areLayerChannelsLoading}
                    spatialHeight={(componentHeight * spatialLayout.h) / 12}
                    spatialWidth={(componentWidth * spatialLayout.w) / 12}
                  />
                </Grid>
              ) : null;
            })}
          <Grid item>
            <ImageAddButton
              imageOptions={imageLayerMeta}
              handleImageAdd={handleImageAdd}
            />
          </Grid>
        </div>
      </TitleInfo>
    );
  }),
);

/**
 * A subscriber component for the spatial layer controller.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 * @param {Object} props.disable3d Which layers should have 3D disabled (from `raster.json` names).
 */
function LayerControllerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Spatial Layers',
    disable3d,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [
    {
      dataset,
      spatialRasterLayers: rasterLayers,
      spatialCellsLayer: cellsLayer,
      spatialMoleculesLayer: moleculesLayer,
    },
    {
      setSpatialRasterLayers: setRasterLayers,
      setSpatialCellsLayer: setCellsLayer,
      setSpatialMoleculesLayer: setMoleculesLayer,
      setSpatialTargetX: setTargetX,
      setSpatialTargetY: setTargetY,
      setSpatialTargetZ: setTargetZ,
      setSpatialRotationX: setRotationX,
      setSpatialRotationOrbit: setRotationOrbit,
      setSpatialZoom: setZoom,
    },
  ] = useCoordination(
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
  );

  const [
    {
      rasterLayersCallbacks,
      areLoadingRasterChannnels,
    },
    {
      setRasterLayersCallbacks,
      setAreLoadingRasterChannnels,
    },
  ] = useAuxiliaryCoordination(
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
  );
  // Spatial layout + window size is needed for the "re-center" button to work properly.
  // Dimensions of the Spatial component can be inferred and used for resetting view state to
  // a nice, centered view.
  const [spatialLayout] = useComponentLayout('spatial', ['spatialRasterLayers'], coordinationScopes);
  const layerControllerRef = useRef();
  const [componentWidth, componentHeight] = useClosestVitessceContainerSize(layerControllerRef);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    LAYER_CONTROLLER_DATA_TYPES,
  );

  // Reset loader progress when the dataset has changed.
  useEffect(() => {
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [raster, imageLayerLoaders, imageLayerMeta] = useRasterData(
    loaders, dataset, setItemIsReady, () => { }, false,
    { setSpatialRasterLayers: setRasterLayers },
    { spatialRasterLayers: rasterLayers },
  );

  useCellsData(
    loaders, dataset, setItemIsReady, () => {}, false,
    { setSpatialCellsLayer: setCellsLayer },
    { spatialCellsLayer: cellsLayer },
  );
  useMoleculesData(
    loaders, dataset, setItemIsReady, () => {}, false,
    { setSpatialMoleculesLayer: setMoleculesLayer },
    { spatialMoleculesLayer: moleculesLayer },
  );

  // useCallback prevents new functions from propogating
  // changes to the underlying component.
  const handleImageAdd = useCallback(async (index) => {
    const loader = imageLayerLoaders[index];
    const newChannels = await initializeLayerChannels(
      loader,
      (rasterLayers[index] || {}).use3d,
    );
    const newLayer = {
      index,
      modelMatrix: imageLayerMeta[index]?.metadata?.transform?.matrix,
      ...DEFAULT_RASTER_LAYER_PROPS,
      channels: newChannels,
      type: imageLayerMeta[index]?.metadata?.isBitmask ? 'bitmask' : 'raster',
    };
    const newLayers = [...rasterLayers, newLayer];
    setRasterLayers(newLayers);
  }, [imageLayerLoaders, imageLayerMeta, rasterLayers, setRasterLayers]);

  const handleRasterLayerChange = useCallback((newLayer, i) => {
    const newLayers = [...rasterLayers];
    newLayers[i] = newLayer;
    setRasterLayers(newLayers);
  }, [rasterLayers, setRasterLayers]);

  const handleRasterLayerRemove = useCallback((i) => {
    const newLayers = [...rasterLayers];
    newLayers.splice(i, 1);
    setRasterLayers(newLayers);
  }, [rasterLayers, setRasterLayers]);

  const hasNoBitmask = (
    imageLayerMeta.length ? imageLayerMeta : [{ metadata: { isBitmask: true } }]
  ).every(l => !l?.metadata?.isBitmask);
  // Only want to show vector cells controller if there is no bitmask
  const canShowCellVecmask = hasNoBitmask;
  const layerIs3DIndex = rasterLayers?.findIndex && rasterLayers.findIndex(layer => layer.use3d);
  return (
    <LayerControllerMemoized
      ref={layerControllerRef}
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      moleculesLayer={moleculesLayer}
      dataset={dataset}
      setMoleculesLayer={setMoleculesLayer}
      cellsLayer={cellsLayer}
      canShowCellVecmask={canShowCellVecmask}
      setCellsLayer={setCellsLayer}
      rasterLayers={rasterLayers}
      imageLayerLoaders={imageLayerLoaders}
      imageLayerMeta={imageLayerMeta}
      rasterLayersCallbacks={rasterLayersCallbacks}
      setRasterLayersCallbacks={setRasterLayersCallbacks}
      areLoadingRasterChannnels={areLoadingRasterChannnels}
      setAreLoadingRasterChannnels={setAreLoadingRasterChannnels}
      handleRasterLayerChange={handleRasterLayerChange}
      handleRasterLayerRemove={handleRasterLayerRemove}
      disable3d={disable3d}
      layerIs3DIndex={layerIs3DIndex}
      setZoom={setZoom}
      setTargetX={setTargetX}
      setTargetY={setTargetY}
      setTargetZ={setTargetZ}
      setRotationX={setRotationX}
      setRotationOrbit={setRotationOrbit}
      // Fall back to window for height and width.
      componentHeight={componentHeight || windowHeight}
      componentWidth={componentWidth || windowWidth}
      spatialLayout={spatialLayout}
      handleImageAdd={handleImageAdd}
    />
  );
}

export default LayerControllerSubscriber;
