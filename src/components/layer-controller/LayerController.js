import React, { useState } from 'react';
import { MAX_SLIDERS_AND_CHANNELS, getChannelStats } from '@hms-dbmi/viv';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Slider from '@material-ui/core/Slider';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

import LayerOptions from './LayerOptions';
import VolumeOptions from './VolumeOptions';
import {
  useControllerSectionStyles,
  StyledExpansionPanelDetails,
  StyledExpansionPanelSummary,
  StyledInputLabel,
  OverflowEllipsisGrid,
} from './styles';
import { getMultiSelectionStats } from './utils';

import { GLOBAL_LABELS } from '../spatial/constants';
import { getSourceFromLoader, isRgb } from '../../utils';
import { DOMAINS } from './constants';


function TabPanel(props) {
  const {
    children, value, index, ...other
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}


// Set the domain of the sliders based on either a full range or min/max.
async function getDomainsAndSliders(loader, loaderSelection, domainType, use3d) {
  let domains;
  const stats = await getMultiSelectionStats({
    loader: loader.data, selections: loaderSelection, use3d,
  });
  const { sliders } = stats;
  if (domainType === 'Min/Max') {
    // eslint-disable-next-line prefer-destructuring
    domains = stats.domains;
  } if (domainType === 'Full') {
    const source = getSourceFromLoader(loader);
    domains = loaderSelection.map(() => DOMAINS[source.dtype]);
  }
  return { domains, sliders };
}

const buttonStyles = { borderStyle: 'dashed', marginTop: '10px', fontWeight: 400 };

/**
 * Controller for the various imaging options (color, opactiy, sliders etc.)
 * @prop {object} imageData Image config object, one of the `images` in the raster schema.
 * @prop {object} layerId Randomly generated id for the image layer that this controller handles.
 * @prop {function} handleLayerRemove Callback for handling the removal of a layer.
 * @prop {object} loader Loader object for the current imaging layer.
 * @prop {function} handleLayerChange Callback for handling the changing of layer properties.
 */
export default function LayerController(props) {
  const {
    layer, name, loader, theme,
    handleLayerRemove, handleLayerChange,
    shouldShowTransparentColor,
    shouldShowDomain, shouldShowColormap, ChannelController,
    setViewState, disable3d, setRasterLayerCallback,
    setAreLayerChannelsLoading, areLayerChannelsLoading, disabled,
    spatialHeight, spatialWidth,
  } = props;

  const {
    colormap,
    opacity,
    channels,
    transparentColor,
    renderingMode,
    xSlice,
    ySlice,
    zSlice,
    resolution,
    use3d,
    modelMatrix,
  } = layer;
  const firstSelection = channels[0]?.selection || {};

  const { data, channels: channelOptions } = loader;
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };
  const { labels, shape } = Array.isArray(data) ? data[data.length - 1] : data;
  const [domainType, setDomainType] = useState(layer.domainType);
  const [isExpanded, setIsExpanded] = useState(true);
  const [globalLabelValues, setGlobalLabelValues] = useState(
    GLOBAL_LABELS
      .filter(field => typeof firstSelection[field] === 'number')
      .reduce((o, key) => ({ ...o, [key]: firstSelection[key] }), {}),
  );

  function setVisible(v) {
    handleLayerChange({ ...layer, visible: v });
  }

  function setColormap(v) {
    handleLayerChange({ ...layer, colormap: v });
  }

  function setOpacity(v) {
    handleLayerChange({ ...layer, opacity: v });
  }

  function setChannels(v) {
    handleLayerChange({ ...layer, channels: v });
  }
  function setTransparentColor(v) {
    handleLayerChange({ ...layer, transparentColor: v });
  }
  function setRenderingMode(v) {
    handleLayerChange({ ...layer, renderingMode: v });
  }

  function handleMultiPropertyChange(obj) {
    handleLayerChange({ ...layer, ...obj });
  }

  function handleSlicerSetting(slice, val) {
    handleLayerChange({ ...layer, [`${slice}Slice`]: val });
  }

  function setChannelsAndDomainType(newChannels, newDomainType) {
    handleLayerChange({
      ...layer,
      channels: newChannels,
      domainType: newDomainType,
    });
  }

  function setChannel(v, i) {
    const newChannels = [...channels];
    newChannels[i] = v;
    handleLayerChange({ ...layer, channels: newChannels });
  }

  function addChannel(v) {
    const newChannels = [...channels, v];
    handleLayerChange({ ...layer, channels: newChannels });
  }

  function removeChannel(i) {
    const newChannels = [...channels];
    newChannels.splice(i, 1);
    handleLayerChange({ ...layer, channels: newChannels });
  }

  const setAreAllChannelsLoading = (val) => {
    const newAreLayerChannelsLoading = channels.map(() => val);
    setAreLayerChannelsLoading(newAreLayerChannelsLoading);
  };

  // Handles adding a channel, creating a default selection
  // for the current global settings and domain type.
  const handleChannelAdd = async () => {
    const selection = {};
    labels.forEach((label) => {
      // Set new image to default selection for non-global selections (0)
      // and use current global selection otherwise.
      selection[label] = GLOBAL_LABELS.includes(label)
        ? (globalLabelValues[label] || 0)
        : 0;
    });
    const { domains, sliders } = await getDomainsAndSliders(loader, [selection], domainType, use3d);
    const domain = domains[0];
    const slider = domain;
    const color = [255, 255, 255];
    const visible = true;
    const newChannelId = channels.length;
    const newAreLayerChannelsLoading = [...areLayerChannelsLoading];
    newAreLayerChannelsLoading[newChannelId] = true;
    setAreLayerChannelsLoading(newAreLayerChannelsLoading);
    const channel = {
      selection, slider, visible, color,
    };
    setRasterLayerCallback(() => {
      setChannel({ ...channel, slider: sliders[0] }, newChannelId);
      const areLayerChannelsLoadingCallback = [...newAreLayerChannelsLoading];
      areLayerChannelsLoadingCallback[newChannelId] = false;
      setAreLayerChannelsLoading(areLayerChannelsLoadingCallback);
      setRasterLayerCallback(null);
    });
    addChannel(channel);
  };

  const handleDomainChange = async (value) => {
    setDomainType(value);
    const loaderSelection = channels.map(
      channel => channel.selection,
    );
    let sliders = channels.map(
      channel => channel.slider,
    );
    const { domains } = await getDomainsAndSliders(
      loader,
      loaderSelection,
      value,
      use3d,
    );

    // If it's the right-most slider, we take the minimum of that and the new value.
    // Otherwise, we use the maximum of the left-hand side and the new value.
    sliders = sliders.map(
      (slider, i) => {
        const [left, right] = slider;
        return [
          Math.max(left, domains[i][0]),
          Math.min(right, domains[i][1]),
        ];
      },
    );

    const newChannels = channels.map((c, i) => ({ ...c, slider: sliders[i] }));
    setChannelsAndDomainType(newChannels, value);
  };

  // This call updates all channel selections with new global selection from the UI.
  const handleGlobalChannelsSelectionChange = async ({ selection, event }) => {
    const loaderSelection = channels.map(channel => ({
      ...channel.selection,
      ...selection,
    }));
    const canUpdateChannels = event.type === 'mouseup' || event.type === 'keydown';
    // Only update domains on a mouseup event for the same reason as above.
    if (canUpdateChannels) {
      setAreAllChannelsLoading(true);
      getDomainsAndSliders(loader, loaderSelection, domainType, use3d).then(({ sliders }) => {
        const newChannelsWithSelection = channels.map(c => ({
          ...c,
          selection: { ...c.selection, ...selection },
        }));
        // Set the callback before changing the selection
        // so the callback is used when the layer (re)loads its data.
        setRasterLayerCallback(() => {
          setRasterLayerCallback(null);
          setAreAllChannelsLoading(false);
          const newChannelsWithSliders = [...newChannelsWithSelection].map(
            (c, i) => ({
              ...c,
              slider: sliders[i],
            }),
          );
          setChannels(newChannelsWithSliders);
        });
        setChannels(newChannelsWithSelection);
      });
    }
    setGlobalLabelValues(prev => ({ ...prev, ...selection }));
  };

  let channelControllers = [];
  if (labels.length > 0) {
    const channelLabel = labels.find(c => c === 'channel' || c === 'c') || labels[0];
    // Create the channel controllers for each channel.
    channelControllers = channels.map(
      // c is an object like { color, selection, slider, visible }.
      (c, channelId) => {
        // Update the auxiliary store with the current loading state of a channel.
        const setIsLoading = (val) => {
          const newAreLayerChannelsLoading = [...areLayerChannelsLoading];
          newAreLayerChannelsLoading[channelId] = val;
          setAreLayerChannelsLoading(newAreLayerChannelsLoading);
        };
        // Change one property of a channel (for now - soon
        // nested structures allowing for multiple z/t selecitons at once, for example).
        const handleChannelPropertyChange = (property, value) => {
          // property is something like "selection" or "slider."
          // value is the actual change, like { channel: "DAPI" }.
          const update = { [property]: value };
          if (property === 'selection') {
            // Channel is loading until the layer callback is called
            // by the layer, which fetches the raster data.
            setIsLoading(true);
            update.selection = {
              ...globalLabelValues,
              ...update.selection,
            };
            setChannel({ ...c, ...update }, channelId);
            // Call back for raster layer handles update of UI
            // like sliders and the loading state of the channel.
            setRasterLayerCallback(async () => {
              const loaderSelection = [
                { ...channels[channelId][property], ...value },
              ];
              const { sliders } = await getDomainsAndSliders(
                loader, loaderSelection, domainType, use3d,
              );
              [update.slider] = sliders;
              setChannel({ ...c, ...update }, channelId);
              setRasterLayerCallback(null);
              setIsLoading(false);
            });
          } else {
            setChannel({ ...c, ...update }, channelId);
          }
        };
        const handleChannelRemove = () => {
          removeChannel(channelId);
        };
        const handleIQRUpdate = async () => {
          const { data: loaderData } = loader;
          const source = Array.isArray(loaderData) ? loaderData[loaderData.length - 1] : loaderData;
          const raster = await source.getRaster({
            selection: channels[channelId].selection,
          });
          const stats = getChannelStats(raster.data);
          const { q1, q3 } = stats;
          setChannel({ ...c, slider: [q1, q3] }, channelId);
        };
        return (
          <ChannelController
            // eslint-disable-next-line react/no-array-index-key
            key={`channel-controller-${channelId}`}
            dimName={channelLabel}
            visibility={c.visible}
            selectionIndex={c.selection[channelLabel]}
            slider={c.slider}
            color={c.color}
            channels={channels}
            channelId={channelId}
            domainType={domainType}
            loader={loader}
            globalLabelValues={globalLabelValues}
            theme={theme}
            channelOptions={channelOptions}
            colormapOn={Boolean(colormap)}
            handlePropertyChange={handleChannelPropertyChange}
            handleChannelRemove={handleChannelRemove}
            handleIQRUpdate={handleIQRUpdate}
            setRasterLayerCallback={setRasterLayerCallback}
            isLoading={areLayerChannelsLoading[channelId]}
            use3d={use3d}
          />
        );
      },
    );
  }

  const controllerSectionClasses = useControllerSectionStyles();

  const { visible } = layer;
  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = visibleSetting ? VisibilityIcon : VisibilityOffIcon;
  // Only show Volume tabs if 3D is available.
  const useVolumeTabs = !disable3d && shape[labels.indexOf('z')] > 1;
  const FullController = (
    <>
      <LayerOptions
        channels={channels}
        opacity={opacity}
        colormap={colormap}
        transparentColor={transparentColor}
        domainType={domainType}
      // Only allow for global dimension controllers that
      // exist in the `dimensions` part of the loader.
        globalControlLabels={labels.filter(label => GLOBAL_LABELS.includes(label))}
        globalLabelValues={globalLabelValues}
        handleOpacityChange={setOpacity}
        handleColormapChange={setColormap}
        handleGlobalChannelsSelectionChange={handleGlobalChannelsSelectionChange}
        handleTransparentColorChange={setTransparentColor}
        isRgb={isRgb(loader)}
        handleDomainChange={handleDomainChange}
        shouldShowTransparentColor={shouldShowTransparentColor}
        shouldShowDomain={shouldShowDomain}
        shouldShowColormap={shouldShowColormap}
        use3d={use3d}
        loader={loader}
        handleMultiPropertyChange={handleMultiPropertyChange}
        resolution={resolution}
        disable3d={disable3d}
        setRasterLayerCallback={setRasterLayerCallback}
        setAreAllChannelsLoading={setAreAllChannelsLoading}
        setViewState={setViewState}
        spatialHeight={spatialHeight}
        spatialWidth={spatialWidth}
        modelMatrix={modelMatrix}
      />
      {!isRgb(loader) ? channelControllers : null}
      {!isRgb(loader) && (
      <Button
        disabled={channels.length === MAX_SLIDERS_AND_CHANNELS}
        onClick={handleChannelAdd}
        fullWidth
        variant="outlined"
        style={buttonStyles}
        startIcon={<AddIcon />}
        size="small"
      >
                Add Channel
      </Button>
      )}
    </>
  );
  return (
    <ExpansionPanel
      className={controllerSectionClasses.root}
      onChange={(e, expanded) => !disabled && setIsExpanded(expanded && e?.target?.attributes?.role?.value === 'presentation')}
      TransitionProps={{ enter: false }}
      expanded={!disabled && isExpanded}
    >
      <StyledExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`layer-${name}-controls`}
      >
        <Grid container direction="column" m={1} justify="center">
          <OverflowEllipsisGrid item>
            <Button
              onClick={(e) => {
                if (!disabled) {
                  // Needed to prevent affecting the expansion panel from changing
                  e.stopPropagation();
                  const nextVisible = (typeof visible === 'boolean' ? !visible : false);
                  setVisible(nextVisible);
                }
              }}
              style={{
                marginRight: 8, marginBottom: 2, padding: 0, minWidth: 0,
              }}
            >
              <Visibility />
            </Button>
            {name}
          </OverflowEllipsisGrid>
          {!disabled && !isExpanded && !use3d && (
            <Grid container direction="row" alignItems="center" justify="center">
              <Grid item xs={6}>
                <StyledInputLabel htmlFor={`layer-${name}-opacity-closed`}>Opacity:</StyledInputLabel>
              </Grid>
              <Grid item xs={6}>
                <Slider
                  id={`layer-${name}-opacity-closed`}
                  value={opacity}
                  onChange={(e, v) => setOpacity(v)}
                  valueLabelDisplay="auto"
                  getAriaLabel={() => 'opacity slider'}
                  min={0}
                  max={1}
                  step={0.01}
                  orientation="horizontal"
                />
              </Grid>
            </Grid>
          )}
        </Grid>
      </StyledExpansionPanelSummary>
      <StyledExpansionPanelDetails>
        {useVolumeTabs ? (
          <>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              aria-label="simple tabs example"
              style={{ height: '24px', minHeight: '24px' }}
            >
              <Tab
                label="Channels"
                style={{
                  fontSize: '.75rem',
                  bottom: 12,
                  width: '50%',
                  minWidth: '50%',
                }}
                disableRipple
              />
              <Tab
                label="Volume"
                style={{
                  fontSize: '.75rem',
                  bottom: 12,
                  width: '50%',
                  minWidth: '50%',
                }}
              />
            </Tabs>
            <TabPanel value={tab} index={0}>
              {FullController}
            </TabPanel>
            <TabPanel value={tab} index={1} style={{ marginTop: 4 }}>
              <VolumeOptions
                loader={loader}
                handleSlicerSetting={handleSlicerSetting}
                handleRenderingModeChange={setRenderingMode}
                renderingMode={renderingMode}
                xSlice={xSlice}
                ySlice={ySlice}
                zSlice={zSlice}
                use3d={use3d}
                setViewState={setViewState}
                spatialHeight={spatialHeight}
                spatialWidth={spatialWidth}
                modelMatrix={modelMatrix}
              />
            </TabPanel>
          </>
        ) : FullController}
        <Button
          onClick={handleLayerRemove}
          fullWidth
          variant="outlined"
          style={buttonStyles}
          size="small"
        >
          Remove Image Layer
        </Button>
      </StyledExpansionPanelDetails>
    </ExpansionPanel>
  );
}
