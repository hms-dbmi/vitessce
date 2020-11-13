import expect from 'expect';
import {
  encodeConfInUrl,
  decodeURLParamsToConf,
} from './export-utils';

const fakeConfig = {
  version: '0.1.0',
  public: false,
  layers: [
    {
      name: 'cells',
      type: 'CELLS',
      fileType: 'cells.json',
      url: 'http://example.com/cells.json',
    },
  ],
  name: 'Just scatterplot',
  staticLayout: [
    {
      component: 'scatterplot',
      props: {
        mapping: 't-SNE',
        view: {
          zoom: 0.75,
          target: [0, 0, 0],
        },
      },
      x: 0,
      y: 0,
      w: 12,
      h: 2,
    },
  ],
};

function makeLongString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

describe('src/app/export-utils.js', () => {
  describe('encodeConfInUrl', () => {
    it('encodes a view config for a URL', () => {
      const urlParams1 = encodeConfInUrl({ conf: {}, baseUrl: 'https://example.com' });
      expect(urlParams1).toEqual('conf_length=5&version=0.0.1&vitessce_conf=N4XyA');

      const urlParams2 = encodeConfInUrl({ conf: fakeConfig, baseUrl: 'https://example.com' });
      expect(urlParams2).toEqual('conf_length=327&version=0.0.1&vitessce_conf=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA');
    });

    it('Calls onOverMaximumUrlLength for conf too long', () => {
      let browsers;
      // eslint-disable-next-line no-return-assign
      const onOverMaximumUrlLength = ({ willWorkOn }) => browsers = willWorkOn;
      encodeConfInUrl({ conf: { foo: makeLongString(69000) }, baseUrl: 'https://example.com', onOverMaximumUrlLength });
      expect(browsers).toEqual([]);

      encodeConfInUrl({ conf: { foo: makeLongString(37000) }, baseUrl: 'https://example.com', onOverMaximumUrlLength });
      expect(browsers).toEqual(['Safari', 'Firefox']);
    });

    it('decodes a view config for a URL', () => {
      const viewConfig1 = decodeURLParamsToConf('conf_length=5&version=0.0.1&vitessce_conf=N4XyA');
      expect(viewConfig1).toEqual({});

      const viewConfig2 = decodeURLParamsToConf('conf_length=327&version=0.0.1&vitessce_conf=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA');
      expect(viewConfig2).toEqual(fakeConfig);
    });
  });
  describe('encodeConfInUrl with custom param', () => {
    it('encodes a view config for a URL', () => {
      const urlParams1 = encodeConfInUrl({ conf: {}, baseUrl: 'https://example.com', confParameter: 'foo' });
      expect(urlParams1).toEqual('conf_length=5&version=0.0.1&foo=N4XyA');

      const urlParams2 = encodeConfInUrl({ conf: fakeConfig, baseUrl: 'https://example.com', confParameter: 'foo' });
      expect(urlParams2).toEqual('conf_length=327&version=0.0.1&foo=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA');
    });

    it('decodes a view config for a URL', () => {
      const viewConfig1 = decodeURLParamsToConf('conf_length=5&version=0.0.1&foo=N4XyA', 'foo');
      expect(viewConfig1).toEqual({});

      const viewConfig2 = decodeURLParamsToConf('conf_length=327&version=0.0.1&foo=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA', 'foo');
      expect(viewConfig2).toEqual(fakeConfig);
    });
  });
});
