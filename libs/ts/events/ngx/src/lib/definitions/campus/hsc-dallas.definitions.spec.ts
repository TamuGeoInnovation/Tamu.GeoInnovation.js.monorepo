import { LayerSource } from '@tamu-gisc/common/types';

import {
  HscDallasNorthwestLayerSources,
  HscDallasNorthwestTs,
  HscDallasSoutheastLayerSources,
  HscDallasSoutheastTs
} from './hsc-dallas.definitions';

/**
 * HSC Dallas is one service published as two maps (#2476), told apart by postcode. Each must open on its
 * own site and show and search only its own buildings; a map that lost its filter would show all six.
 */
const sites = [
  { label: 'northwest', zip: '75246', root: HscDallasNorthwestTs, sources: HscDallasNorthwestLayerSources },
  { label: 'southeast', zip: '75210', root: HscDallasSoutheastTs, sources: HscDallasSoutheastLayerSources }
];

const overlay = (sources: LayerSource[]) => sources.find((source) => source.type === 'feature');

describe('HSC Dallas campus maps', () => {
  it.each(sites)('$label shows only its own postcode', ({ zip, sources }) => {
    expect((overlay(sources)?.native as { definitionExpression?: string }).definitionExpression).toBe(`zip = '${zip}'`);
  });

  it.each(sites)('$label searches only its own postcode', ({ zip, root }) => {
    const queryParams = root.configuration?.searchSources?.[0]?.queryParams;

    expect(queryParams?.fixedWhere).toBe(`zip = '${zip}'`);
  });

  it('are two maps, with their own ids and centres, from the one service', () => {
    const [northwest, southeast] = sites.map(({ root }) => root.configuration);

    expect(northwest?.id).not.toBe(southeast?.id);
    expect(northwest?.mapCenter).not.toEqual(southeast?.mapCenter);

    const urls = sites.flatMap(({ sources }) => sources.map((source) => source.url));

    expect(urls.every((url) => url?.includes('/Hosted/HSCD/'))).toBe(true);
  });

  it('give every layer an id of its own, so one map cannot be confused with the other', () => {
    const ids = sites.flatMap(({ sources }) => sources.map((source) => source.id));

    expect(new Set(ids).size).toBe(ids.length);
  });
});
