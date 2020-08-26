import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import { useCoordination } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { STATUS_WARN } from '../../events';
import TitleInfo from '../TitleInfo';
import Status from './Status';

export default function StatusSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
  } = props;

  // Get "props" from the coordination space.
  const [{
    cellHighlight,
    geneHighlight,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.status, coordinationScopes);

  const [warn, setWarn] = useState();

  useEffect(() => {
    const warnToken = PubSub.subscribe(STATUS_WARN, (msg, data) => {
      setWarn(data);
    });
    return PubSub.unsubscribe(warnToken);
  }, []);

  const infos = [
    ...(cellHighlight && cellHighlight.cellId
      ? [`Hovered cell ${cellHighlight.cellId}`]
      : []
    ),
    ...(geneHighlight && geneHighlight.geneId
      ? [`Hovered gene ${geneHighlight.geneId}`]
      : []
    ),
  ];
  const info = infos.join('; ');

  return (
    <TitleInfo
      title="Status"
      theme={theme}
      removeGridComponent={removeGridComponent}
      isScroll
      isReady
    >
      <Status warn={warn} info={info} />
    </TitleInfo>
  );
}
