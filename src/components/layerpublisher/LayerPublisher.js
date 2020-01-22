import Ajv from 'ajv';
import PubSub from 'pubsub-js';
import React from 'react';

import {
  STATUS_WARN, STATUS_INFO,
  CELLS_ADD, CLUSTERS_ADD, FACTORS_ADD, GENES_ADD, IMAGES_ADD, MOLECULES_ADD, NEIGHBORHOODS_ADD,
  CLEAR_PLEASE_WAIT,
} from '../../events';

import cellsSchema from '../../schemas/cells.schema.json';
import clustersSchema from '../../schemas/clusters.schema.json';
import factorsSchema from '../../schemas/factors.schema.json';
import genesSchema from '../../schemas/genes.schema.json';
import imagesSchema from '../../schemas/images.schema.json';
import moleculesSchema from '../../schemas/molecules.schema.json';
import neighborhoodsSchema from '../../schemas/neighborhoods.schema.json';

const typeToSchema = {
  CELLS: cellsSchema,
  CLUSTERS: clustersSchema,
  FACTORS: factorsSchema,
  GENES: genesSchema,
  IMAGES: imagesSchema,
  MOLECULES: moleculesSchema,
  NEIGHBORHOODS: neighborhoodsSchema,
};
const typeToEvent = {
  CELLS: CELLS_ADD,
  CLUSTERS: CLUSTERS_ADD,
  FACTORS: FACTORS_ADD,
  GENES: GENES_ADD,
  IMAGES: IMAGES_ADD,
  MOLECULES: MOLECULES_ADD,
  NEIGHBORHOODS: NEIGHBORHOODS_ADD,
};

function warn(message) {
  PubSub.publish(STATUS_WARN, message);
}

function info(fileName) {
  PubSub.publish(STATUS_INFO, `Loaded ${fileName}.`);
}

function fetchDataFromDZI(layerType, dziSource) {
  return fetch(dziSource).then(response => response.text())
    .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'))
    .then((layer) => {
      const layerData = {};
      if (Number(layer.getElementsByTagName('Image')[0].attributes.Overlap.value) !== 0) {
        throw new Error('Overlap paramter is nonzero and should be 0');
      }
      layerData.layerType = layerType;
      layerData.tileSource = dziSource.substring(0, dziSource.lastIndexOf('/'));
      layerData.height = Number(layer.getElementsByTagName('Size')[0].attributes.Height.value);
      layerData.width = Number(layer.getElementsByTagName('Size')[0].attributes.Width.value);
      layerData.tileSize = Number(layer.getElementsByTagName('Image')[0].attributes.TileSize.value);
      return layerData;
    });
}

function fetchImageMetadata(data) {
  const imagePlanes = Object.keys(data);
  return Promise.all(imagePlanes.map(plane => fetchDataFromDZI(plane, data[plane].tileSource)));
}

function publishLayer(data, type, name, url) {
  const schema = typeToSchema[type];
  if (!schema) {
    throw Error(`No schema for ${type}`);
  }
  const validate = new Ajv().compile(schema);
  const valid = validate(data);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    warn(`Error while validating ${name}. Details in console.`);
    console.warn(`"${name}" (${type}) from ${url}: validation failed`, failureReason);
  }
  if (type === 'IMAGES') {
    const pubSubData = {};
    fetchImageMetadata(data).then((resData) => {
      resData.forEach((e) => { pubSubData[e.layerType] = e; });
      PubSub.publish(typeToEvent[type], pubSubData);
      info(name);
    });
  } else {
    PubSub.publish(typeToEvent[type], data);
    info(name);
  }
}

function loadLayer(layer) {
  const { name, type, url, requestInit={} } = layer;
  fetch(url, requestInit)
    .then((response) => {
      response.json().then((data) => {
        publishLayer(data, type, name, url);
      }, (failureReason) => {
        warn(`Error while parsing ${name}. Details in console.`);
        console.warn(`"${name}" (${type}) from ${url}: parse failed`, failureReason);
      });
    }, (failureReason) => {
      warn(`Error while fetching ${name}. Details in console.`);
      console.warn(`"${name}" (${type}) from ${url}: fetch failed`, failureReason);
    });
}

export default class LayerPublisher extends React.Component {
  constructor(props) {
    super(props);
    const { layers } = this.props;
    const pleaseWaits = {};
    layers.map(layer => layer.name).forEach((name) => { pleaseWaits[name] = true; });
    this.state = { pleaseWaits };
  }

  clearPleaseWait(event, layerName) {
    this.setState((prevState) => {
      // TODO: Do not mutate! https://github.com/hubmapconsortium/vitessce/issues/148
      // eslint-disable-next-line no-param-reassign
      prevState.pleaseWaits[layerName] = false;
      const waitingOn = Object.entries(prevState.pleaseWaits)
        .filter(entry => entry[1])
        .map(entry => entry[0]);
      console.warn(`cleared "${layerName}"; waiting on ${waitingOn.length}:`, waitingOn);
      return prevState;
    });
  }

  componentWillMount() {
    this.clearPleaseWaitToken = PubSub.subscribe(
      CLEAR_PLEASE_WAIT, this.clearPleaseWait.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.clearPleaseWaitToken);
  }

  componentDidMount() {
    const { layers } = this.props;
    layers.forEach((layer) => {
      loadLayer(layer);
    });
  }

  render() {
    const { pleaseWaits } = this.state;
    const unloadedLayers = Object.entries(pleaseWaits).filter(
      ([name, stillWaiting]) => stillWaiting, // eslint-disable-line no-unused-vars
    ).map(
      ([name, stillWaiting]) => name, // eslint-disable-line no-unused-vars
    );

    if (unloadedLayers.length) {
      return (
        <React.Fragment>
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-body">
                  <p>Please wait...</p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </React.Fragment>
      );
    }
    return null;
  }
}
