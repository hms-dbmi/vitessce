import Ajv from 'ajv';

import datasetSchema from '../schemas/dataset.schema.json';

// Exported because used by the cypress tests: They route API requests to the fixtures instead.
export const urlPrefix = 'https://s3.amazonaws.com/vitessce-data/0.0.18/separate_scripts';

function makeLayerNameToConfig(datasetPrefix) {
  return name => ({
    name,
    type: name.toUpperCase(),
    url: `${urlPrefix}/${datasetPrefix}.${name}.json`,
  });
}

const linnarssonLayerNames = [
  'cells',
  'clusters',
  'factors',
  'genes',
  'images',
  'molecules',
  'neighborhoods',
];
const linnarssonDescription = 'Spatial organization of the somatosensory cortex revealed by cyclic smFISH';
const linnarssonBase = {
  description: linnarssonDescription,
  layers: linnarssonLayerNames
    .map(makeLayerNameToConfig('linnarsson')),
};
const linnarssonBaseNoClusters = {
  description: linnarssonDescription,
  layers: linnarssonLayerNames.filter(name => name !== 'clusters')
    .map(makeLayerNameToConfig('linnarsson')),
};

const driesDescription = 'Giotto, a pipeline for integrative analysis and visualization of single-cell spatial transcriptomic data';
const driesBase = {
  description: driesDescription,
  layers: [
    'cells',
    'factors',
  ].map(makeLayerNameToConfig('giotto')),
};

const wangDescription = 'Multiplexed imaging of high-density libraries of RNAs with MERFISH and expansion microscopy';
const wangBase = {
  description: wangDescription,
  layers: [
    'cells',
    'molecules',
  ].map(makeLayerNameToConfig('mermaid')),
};

/* eslint-disable object-property-newline */
/* eslint-disable object-curly-newline */
const configs = {
  'linnarsson-2018': {
    ...linnarssonBase,
    name: 'Linnarsson (responsive layout)',
    public: true,
    responsiveLayout: {
      columns: {
        // First two columns are equal,
        // third column is constant;
        // Grid cell width stays roughly constant,
        // but more columns are available in a wider window.
        1400: [0, 6, 12, 14],
        1200: [0, 5, 10, 12],
        1000: [0, 4, 8, 10],
        800: [0, 3, 6, 8],
        600: [0, 2, 4, 8],
      },
      components: [
        { component: 'Description',
          props: {
            description: `Linnarsson: ${linnarssonDescription}`,
          },
          x: 0, y: 0 },
        { component: 'StatusSubscriber',
          x: 0, y: 1 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 't-SNE' },
          x: 0, y: 2, h: 2 },
        { component: 'HoverableSpatialSubscriber',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 1, y: 0, h: 2 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 'PCA' },
          x: 1, y: 2, h: 2 },
        { component: 'FactorsSubscriber',
          x: 2, y: 0, h: 1 },
        { component: 'CellSetsManagerSubscriber',
          x: 2, y: 1, h: 1 },
        { component: 'GenesSubscriber',
          x: 2, y: 2, h: 2 },
        { component: 'HoverableHeatmapSubscriber',
          x: 0, y: 4, w: 3 },
      ],
    },
  },
  'linnarsson-2018-two-spatial': {
    ...linnarssonBase,
    name: 'Linnarsson (two spatial)',
    responsiveLayout: {
      columns: {
        // First two columns are equal,
        // third column is constant;
        // Grid cell width stays roughly constant,
        // but more columns are available in a wider window.
        1400: [0, 6, 12, 14],
        1200: [0, 5, 10, 12],
        1000: [0, 4, 8, 10],
        800: [0, 3, 6, 8],
        600: [0, 2, 4, 8],
      },
      components: [
        { component: 'HoverableSpatialSubscriber',
          props: {
            view: {
              zoom: -8,
              target: [18000, 18000, 0],
            },
          },
          x: 0, y: 0, h: 2 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 't-SNE' },
          x: 0, y: 2, h: 2 },
        { component: 'HoverableSpatialSubscriber',
          props: {
            view: {
              zoom: -6,
              target: [18000, 18000, 0],
            },
          },
          x: 1, y: 0, h: 2 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 'PCA' },
          x: 1, y: 2, h: 2 },
        { component: 'FactorsSubscriber',
          x: 2, y: 0, h: 2 },
        { component: 'GenesSubscriber',
          x: 2, y: 2, h: 2 },
        { component: 'HoverableHeatmapSubscriber',
          x: 0, y: 4, w: 3 },
      ],
    },
  },
  'linnarsson-2018-just-spatial': {
    ...linnarssonBaseNoClusters,
    name: 'Linnarsson (just spatial)',
    responsiveLayout: {
      columns: {
        1400: [0, 12, 14],
        1200: [0, 10, 12],
        1000: [0, 8, 10],
        800: [0, 6, 8],
        600: [0, 4, 8],
      },
      components: [
        { component: 'HoverableSpatialSubscriber',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 0, y: 0, h: 2 },
        { component: 'FactorsSubscriber',
          x: 1, y: 0, h: 1 },
        { component: 'GenesSubscriber',
          x: 1, y: 1, h: 1 },
      ],
    },
  },
  'linnarsson-2018-static': {
    ...linnarssonBase,
    name: 'Linnarsson (static layout)',
    staticLayout: [
      { component: 'Description',
        props: {
          description: `Linnarsson (static layout): ${linnarssonDescription}`,
        },
        x: 0, y: 0, w: 3, h: 1 },
      { component: 'ScatterplotSubscriber',
        props: { mapping: 't-SNE' },
        x: 0, y: 2, w: 3, h: 2 },
      { component: 'SpatialSubscriber',
        props: {
          view: {
            zoom: -6.5,
            target: [18000, 18000, 0],
          },
        },
        x: 3, y: 0, w: 6, h: 4 },
      { component: 'FactorsSubscriber',
        x: 9, y: 0, w: 3, h: 2 },
      { component: 'GenesSubscriber',
        x: 9, y: 2, w: 3, h: 2 },
      { component: 'HeatmapSubscriber',
        x: 0, y: 4, w: 12, h: 1 },
    ],
  },
  'linnarsson-2018-dozen': {
    ...linnarssonBase,
    name: 'Linnarsson (responsive layout, redundant components for performance testing)',
    responsiveLayout: {
      columns: {
        // First two columns are equal,
        // third column is constant;
        // Grid cell width stays roughly constant,
        // but more columns are available in a wider window.
        1400: [0, 6, 12, 14],
        1200: [0, 5, 10, 12],
        1000: [0, 4, 8, 10],
        800: [0, 3, 6, 8],
        600: [0, 2, 4, 8],
      },
      components: [
        { component: 'HoverableSpatialSubscriber',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 0, y: 0, h: 1 },
        { component: 'HoverableSpatialSubscriber',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 0, y: 1, h: 1 },
        { component: 'HoverableSpatialSubscriber',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 1, y: 0, h: 1 },
        { component: 'HoverableSpatialSubscriber',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 1, y: 1, h: 1 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 't-SNE' },
          x: 0, y: 2, h: 1 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 't-SNE' },
          x: 0, y: 3, h: 1 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 't-SNE' },
          x: 0, y: 4, h: 1 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 't-SNE' },
          x: 0, y: 5, h: 1 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 'PCA' },
          x: 1, y: 2, h: 1 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 'PCA' },
          x: 1, y: 3, h: 1 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 'PCA' },
          x: 1, y: 4, h: 1 },
        { component: 'HoverableScatterplotSubscriber',
          props: { mapping: 'PCA' },
          x: 1, y: 5, h: 1 },
        { component: 'FactorsSubscriber',
          x: 2, y: 0, h: 2 },
        { component: 'GenesSubscriber',
          x: 2, y: 2, h: 2 },
        { component: 'HeatmapSubscriber',
          x: 2, y: 4, w: 1, h: 2 },
      ],
    },
  },
  'dries-2019': {
    ...driesBase,
    name: 'Dries (responsive layout)',
    public: false,
    responsiveLayout: {
      columns: {
        // First two columns are equal,
        // third column is constant;
        // Grid cell width stays roughly constant,
        // but more columns are available in a wider window.
        1400: [0, 6, 12, 14],
        1200: [0, 5, 10, 12],
        1000: [0, 4, 8, 10],
        800: [0, 3, 6, 8],
        600: [0, 2, 4, 8],
      },
      components: [
        { component: 'Description',
          props: {
            description: driesDescription,
          },
          x: 0, y: 0 },
        { component: 'StatusSubscriber',
          x: 0, y: 1 },
        { component: 'ScatterplotSubscriber',
          props: { mapping: 't-SNE' },
          x: 0, y: 2, h: 2 },
        { component: 'SpatialSubscriber',
          props: {
            cellRadius: 50,
            view: {
              zoom: -4.4,
              target: [3800, -900, 0],
            },
          },
          x: 1, y: 0, h: 2 },
        { component: 'ScatterplotSubscriber',
          props: { mapping: 'UMAP' },
          x: 1, y: 2, h: 2 },
        { component: 'FactorsSubscriber',
          x: 2, y: 0, h: 4 },
      ],
    },
  },
  'wang-2019': {
    ...wangBase,
    name: 'Wang (responsive layout)',
    public: false,
    responsiveLayout: {
      columns: {
        // First two columns are equal,
        // third column is constant;
        // Grid cell width stays roughly constant,
        // but more columns are available in a wider window.
        1400: [0, 14],
        1200: [0, 12],
        1000: [0, 10],
        800: [0, 8],
        600: [0, 6],
      },
      components: [
        { component: 'SpatialSubscriber',
          props: {
            view: {
              zoom: -1.8,
              target: [10, -70, 0],
            },
            moleculeRadius: 2,
          },
          x: 0, y: 0, h: 2 },
      ],
    },
  },
};
/* eslint-enable */

export function listConfigs(showAll) {
  return Object.entries(configs).filter(
    entry => showAll || entry[1].public,
  ).map(
    ([id, config]) => ({
      id,
      name: config.name,
      description: config.description,
    }),
  );
}

export function getConfig(id) {
  const datasetConfig = configs[id];
  const validate = new Ajv().compile(datasetSchema);
  const valid = validate(datasetConfig);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    console.warn('dataset validation failed', failureReason);
  }
  return datasetConfig;
}
