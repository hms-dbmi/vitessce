/* eslint-disable dot-notation */
import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import TitleInfo from '../TitleInfo';
import RasterChannelController from './RasterChannelController';
import BitmaskChannelController from './BitmaskChannelController';
import VectorLayerController from './VectorLayerController';
import LayerController from './LayerController';
import ImageAddButton from './ImageAddButton';
import { useReady } from '../hooks';
import { useCellsData, useMoleculesData, useRasterData } from '../data-hooks';
import { useCoordination, useLoaders, useAuxiliaryCoordination } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { initializeLayerChannels } from '../spatial/utils';
import { DEFAULT_RASTER_LAYER_PROPS } from '../spatial/constants';

const LAYER_CONTROLLER_DATA_TYPES = ['raster'];

/**
 * A subscriber component for the spatial layer controller.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
function LayerControllerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Spatial Layers',
    disable3D = {},
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [
    {
      dataset,
      spatialRasterLayers: rasterLayers,
      spatialCellsLayer: cellsLayer,
      spatialMoleculesLayer: moleculesLayer,
      spatialZoom: zoom,
      spatialTargetX: targetX,
      spatialTargetY: targetY,
      spatialTargetZ: targetZ,
      spatialRotationX: rotationX,
      spatialRotationY: rotationY,
      spatialRotationZ: rotationZ,
      spatialRotationOrbit: rotationOrbit,
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
      spatialRasterLayers: rasterLayersCallbacks,
      rasterLayersIsChannelLoading: areLoadingRasterChannnels,
    },
    {
      setRasterLayersCallbacks,
      setRasterLayersIsChannelLoading: setAreLoadingRasterChannnels,
    },
  ] = useAuxiliaryCoordination(
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
  );

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

  const handleImageAdd = async (index) => {
    const loader = imageLayerLoaders[index];
    const newChannels = await initializeLayerChannels(loader);
    const newLayer = {
      index,
      modelMatrix: imageLayerMeta[index]?.metadata?.transform?.matrix,
      ...DEFAULT_RASTER_LAYER_PROPS,
      channels: newChannels,
      type: imageLayerMeta[index]?.metadata?.isBitmask ? 'bitmask' : 'raster',
    };
    const newLayers = [...rasterLayers, newLayer];
    setRasterLayers(newLayers);
  };

  function handleRasterLayerChange(newLayer, i) {
    const newLayers = [...rasterLayers];
    newLayers[i] = newLayer;
    setRasterLayers(newLayers);
  }

  function handleRasterLayerRemove(i) {
    const newLayers = [...rasterLayers];
    newLayers.splice(i, 1);
    setRasterLayers(newLayers);
  }

  const hasNoBitmask = (
    imageLayerMeta.length ? imageLayerMeta : [{ metadata: { isBitmask: true } }]
  ).every(l => !l?.metadata?.isBitmask);
  // Only want to show vector cells controller if there is no bitmask
  const canShowCellVecmask = hasNoBitmask;
  const layerIs3DIndex = rasterLayers?.findIndex && rasterLayers.findIndex(layer => layer.use3D);
  return (
    <TitleInfo
      title={title}
      isScroll
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
    >
      <div className="layer-controller-container">
        {moleculesLayer && (
          <VectorLayerController
            key={`${dataset}-molecules`}
            label="Molecules"
            layerType="molecules"
            layer={moleculesLayer}
            handleLayerChange={setMoleculesLayer}
          />
        )}
        {cellsLayer
          && canShowCellVecmask && (
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
            const isRaster = layer.type === 'raster';
            const ChannelController = isRaster
              ? RasterChannelController
              : BitmaskChannelController;
            const setRasterLayerCallback = (cb) => {
              const newRasterLayersCallbacks = [...(rasterLayersCallbacks || [])];
              newRasterLayersCallbacks[i] = cb;
              setRasterLayersCallbacks(newRasterLayersCallbacks);
            };
            const areLayerChannelsLoading = (areLoadingRasterChannnels || [])[i] || [];
            const setAreLayerChannelsLoading = (v) => {
              const newAreLayerChannelsLoading = [...areLayerChannelsLoading];
              newAreLayerChannelsLoading[i] = v;
              setAreLoadingRasterChannnels(newAreLayerChannelsLoading);
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
                  disable3D={(disable3D || {})[layer.name]
                    || (typeof layerIs3DIndex === 'number' && layerIs3DIndex !== -1 && layerIs3DIndex !== i)}
                  disabled={typeof layerIs3DIndex === 'number' && layerIs3DIndex !== -1 && layerIs3DIndex !== i}
                  rasterLayersCallbacks={rasterLayersCallbacks}
                  setRasterLayerCallback={setRasterLayerCallback}
                  viewState={{
                    zoom,
                    target: [targetX, targetY, targetZ],
                    rotationX,
                    rotationY,
                    rotationZ,
                    rotationOrbit,
                  }}
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
}

export default LayerControllerSubscriber;
