import React from 'react';
import HeatmapDataCanvas from './HeatmapDataCanvas';
import HeatmapCellSelectionCanvas from './HeatmapCellSelectionCanvas';
import HeatmapCellColorCanvas from './HeatmapCellColorCanvas';

export default function Heatmap(props) {
  const {
    cells,
    clusters,
    selectedCellIds,
    cellColors,
    clearPleaseWait,
    updateCellsHover = (hoverInfo) => {
      console.warn(`Heatmap updateCellsHover: ${hoverInfo.cellId}`);
    },
  } = props;
  if (clearPleaseWait && clusters) {
    clearPleaseWait('clusters');
  }
  return (
    <React.Fragment>
      <HeatmapCellColorCanvas
        clusters={clusters}
        cellColors={cellColors}
        height="15%"
      />
      <HeatmapCellSelectionCanvas
        cells={cells}
        clusters={clusters}
        selectedCellIds={selectedCellIds}
        updateCellsHover={updateCellsHover}
        height="15%"
      />
      <HeatmapDataCanvas
        clusters={clusters}
        height="70%"
      />
    </React.Fragment>
  );
}
