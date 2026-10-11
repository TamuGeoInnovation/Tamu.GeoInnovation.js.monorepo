import { orderHitsForPopup, SELECTION_LAYER_ID } from './hit-order';

import esri = __esri;

/**
 * Which graphic under a click gets the popup (#1614).
 *
 * A link to a Tailgating zone highlights the zone. When the highlight is drawn above the map's own
 * layers it covers every tent in the zone, and a click on a tent reached the highlight first: the popup
 * that opened was the selection layer's, an empty building popup reading ", TX".
 */
const on = (layerId: string, name: string) => ({ layer: { id: layerId }, attributes: { name } }) as unknown as esri.Graphic;

const names = (graphics: esri.Graphic[]) => graphics.map((graphic) => graphic.attributes.name);

describe('the order of the graphics under a click', () => {
  it('puts the feature under a selection highlight before the highlight', () => {
    const hits = [on(SELECTION_LAYER_ID, 'highlight'), on('tents', 'Tent A21'), on('zones', 'Aggie Spirit Lawn')];

    expect(names(orderHitsForPopup(hits))).toEqual(['Tent A21', 'Aggie Spirit Lawn', 'highlight']);
  });

  it('keeps the highlight when nothing else is under the click', () => {
    const hits = [on(SELECTION_LAYER_ID, 'highlight')];

    expect(names(orderHitsForPopup(hits))).toEqual(['highlight']);
  });

  it('leaves the order alone when no highlight is involved', () => {
    const hits = [on('tents', 'Tent A21'), on('zones', 'Aggie Spirit Lawn')];

    expect(names(orderHitsForPopup(hits))).toEqual(['Tent A21', 'Aggie Spirit Lawn']);
  });

  it('copes with a graphic that has no layer', () => {
    const loose = { attributes: { name: 'loose' } } as unknown as esri.Graphic;

    expect(names(orderHitsForPopup([on(SELECTION_LAYER_ID, 'highlight'), loose]))).toEqual(['loose', 'highlight']);
  });
});
