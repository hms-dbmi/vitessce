import { ZarrLoader } from '@hms-dbmi/viv';
import range from 'lodash/range';
import { openArray } from 'zarr';
import AbstractZarrLoader from './AbstractZarrLoader';
import { AbstractLoaderError } from './errors';
import LoaderResult from './LoaderResult';

import { initializeRasterLayersAndChannels } from '../components/spatial/utils';

function hexToRgb(hex) {
  const result = /^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/i.exec(hex);
  return [
    parseInt(result[1].toLowerCase(), 16),
    parseInt(result[2].toLowerCase(), 16),
    parseInt(result[3].toLowerCase(), 16),
  ];
}

async function openMultiResolutionData(store, rootAttrs) {
  let resolutions = ['0'];
  if ('multiscales' in rootAttrs) {
    const { datasets } = rootAttrs.multiscales[0];
    resolutions = datasets.map(d => d.path);
  }
  const promises = resolutions.map(path => openArray({ store, path }));
  const data = await Promise.all(promises);
  return data;
}

function createLoader(dataArr, dimensions) {
  // TODO: There should be a much better way to do this.
  // If base image is small, we don't need to fetch data for the
  // top levels of the pyramid. For large images, the tile sizes (chunks)
  // will be the same size for x/y. We check the chunksize here for this edge case.
  const base = dataArr[0];
  const { chunks } = base;
  const [tileHeight, tileWidth] = chunks.slice(-2);
  // TODO: Need function to trim pyramidal levels that aren't chunked w/ even tile sizes.
  // Lowest resolution doesn't need to have square chunks, but all others do.
  const data = dataArr.length === 1 || tileHeight !== tileWidth ? base : dataArr;
  // need to make dimensions to use ZarrLoader, but not necessary
  return new ZarrLoader({ data, dimensions });
}

export default class OmeZarrLoader extends AbstractZarrLoader {
  async load() {
    const payload = await this.getJson('.zattrs').catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }

    const { omero } = payload;

    if (!omero) {
      console.error('Path for image not valid');
      return Promise.reject(payload);
    }
    console.log(omero) // eslint-disable-line 

    const { rdefs, channels, name } = omero;

    const time = rdefs.defaultT ?? 0;
    const z = rdefs.defaultZ ?? 0;

    const multiresData = await openMultiResolutionData(this.store, payload);
    const { shape } = multiresData[0];
    const image = {
      name,
      type: 'ome-zarr',
      url: this.url,
      metadata: {
        isPyramid: true,
        dimensions: [
          {
            field: 'time',
            type: 'ordinal',
            values: range(shape[0]),
          },
          {
            field: 'channel',
            type: 'nominal',
            values: channels.map(ch => ch.label),
          },
          {
            field: 'z',
            type: 'ordinal',
            values: range(shape[2]),
          },
          {
            field: 'y',
            type: 'quantitative',
            values: [],
          },
          {
            field: 'x',
            type: 'quantitative',
            values: [],
          },
        ],
        transform: {
          translate: {
            y: 0,
            x: 0,
          },
          scale: 1,
        },
      },
    };

    const imagesWithLoaderCreators = [
      {
        ...image,
        channels: channels.map((channel, i) => ({
          selection: { z, time, channel: i },
          slider: [channel.window.start, channel.window.end],
          color: hexToRgb(channel.color),
        })),
        loaderCreator: async () => {
          const loader = createLoader(multiresData, image.metadata.dimensions);
          return loader;
        },
      },
    ];

    // TODO: use options for initial selection of channels
    // which omit domain/slider ranges.
    const [
      autoImageLayers, imageLayerLoaders, imageLayerMeta,
    ] = await initializeRasterLayersAndChannels(
      imagesWithLoaderCreators, undefined,
    );

    const coordinationValues = {
      spatialRasterLayers: autoImageLayers,
    };
    return Promise.resolve(new LoaderResult(
      { loaders: imageLayerLoaders, meta: imageLayerMeta },
      [],
      coordinationValues,
    ));
  }
}
