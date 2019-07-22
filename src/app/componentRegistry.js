import React from 'react';

import TitleInfo from '../components/TitleInfo';
import StatusSubscriber from '../components/status/StatusSubscriber';
import FactorsSubscriber from '../components/factors/FactorsSubscriber';
import GenesSubscriber from '../components/genes/GenesSubscriber';
import CellSetsManagerSubscriber from '../components/user-defined-sets/CellSetsManagerSubscriber';
import HoverableScatterplotSubscriber from '../components/scatterplot/HoverableScatterplotSubscriber';
import HoverableSpatialSubscriber from '../components/spatial/HoverableSpatialSubscriber';
import HoverableHeatmapSubscriber from '../components/heatmap/HoverableHeatmapSubscriber';
import componentCss from '../css/component.module.scss';

class Description extends React.Component {
  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  render() {
    const { description } = this.props;
    return (
      <TitleInfo title="Data Set" isScroll>
        <p className={componentCss.details}>{description}</p>
      </TitleInfo>
    );
  }
}

const registry = {
  description: Description,
  status: StatusSubscriber,
  factors: FactorsSubscriber,
  genes: GenesSubscriber,
  cellSets: CellSetsManagerSubscriber,
  scatterplot: HoverableScatterplotSubscriber,
  spatial: HoverableSpatialSubscriber,
  heatmap: HoverableHeatmapSubscriber,
};

export default function getComponent(name) {
  return registry[name];
}
