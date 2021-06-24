import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Slider from '@material-ui/core/Slider';
import { RENDERING_MODES } from '@hms-dbmi/viv';
import { abbreviateNumber, getBoundingCube } from './utils';

const useSlicerStyles = makeStyles(theme => createStyles({
  enabled: {},
  disabled: {
    color: theme.palette.text.disabled,
    // Because of the .5 opacity of the disabled color in the theme, and the fact
    // that there are multiple overlaid parts to the slider,
    // this needs to be set manually for the desired effect.
    '& .MuiSlider-thumb': {
      color: 'rgb(100, 100, 100, 1.0)',
    },
    '&  .MuiSlider-track': {
      color: 'rgb(100, 100, 100, 1.0)',
    },
  },
}));

const Slicer = ({
  xSlice,
  ySlice,
  zSlice,
  handleSlicerSetting,
  loader,
  use3d,
}) => {
  const [xSliceInit, ySliceInit, zSliceInit] = getBoundingCube(loader.data);
  const sliceValuesAndSetSliceFunctions = [
    [
      xSlice,
      xSliceNew => handleSlicerSetting('x', xSliceNew),
      'x',
      xSliceInit,
    ],
    [
      ySlice,
      ySliceNew => handleSlicerSetting('y', ySliceNew),
      'y',
      ySliceInit,
    ],
    [
      zSlice,
      zSliceNew => handleSlicerSetting('z', zSliceNew),
      'z',
      zSliceInit,
    ],
  ];
  const classes = useSlicerStyles();
  const Slicers = sliceValuesAndSetSliceFunctions.map(
    ([val, setVal, label, [min, max]]) => (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="center"
        key={label}
      >
        <Grid item xs={1}>
          <Typography
            className={!use3d ? classes.disabled : classes.enabled}
            style={{ marginBottom: 0 }}
          >
            {label}:
          </Typography>
        </Grid>
        <Grid item xs={11}>
          <Slider
            disabled={!use3d}
            className={!use3d ? classes.disabled : classes.enabled}
            value={val}
            onChange={(e, v) => setVal(v)}
            valueLabelDisplay="auto"
            valueLabelFormat={v => abbreviateNumber(v)}
            getAriaLabel={() => `${label} slider`}
            min={min}
            max={max}
            step={0.005}
            orientation="horizontal"
          />
        </Grid>
      </Grid>
    ),
  );
  return (
    <>
      <Typography
        className={!use3d ? classes.disabled : classes.enabled}
        style={{ marginTop: 16, marginBottom: 0 }}
      >
        Clipping Planes:{' '}
      </Typography>{' '}
      {Slicers}
    </>
  );
};

const renderingOptions = Object.values(RENDERING_MODES);

function RenderingModeSelect({
  handleRenderingModeChange,
  renderingMode,
  use3d,
}) {
  // Empty option allows for displaying the title of the dropdown fully in the UI.
  const options = !use3d ? [...renderingOptions, ''] : renderingOptions;
  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="rendering-mode-select">Rendering Mode</InputLabel>
      <Select
        native
        onChange={e => handleRenderingModeChange(e.target.value)}
        value={use3d ? renderingMode : ''}
        inputProps={{
          name: 'rendering-mode',
          id: 'rendering-mode-select',
        }}
        disabled={!use3d}
      >
        {options.map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}

const VolumeOptions = ({
  handleSlicerSetting,
  handleRenderingModeChange,
  renderingMode,
  xSlice,
  ySlice,
  zSlice,
  use3d,
  loader,
}) => (
  <>
    <RenderingModeSelect
      handleRenderingModeChange={handleRenderingModeChange}
      renderingMode={renderingMode}
      use3d={use3d}
    />
    <Slicer
      xSlice={xSlice}
      ySlice={ySlice}
      zSlice={zSlice}
      handleSlicerSetting={handleSlicerSetting}
      use3d={use3d}
      loader={loader}
    />
  </>
);

export default VolumeOptions;
