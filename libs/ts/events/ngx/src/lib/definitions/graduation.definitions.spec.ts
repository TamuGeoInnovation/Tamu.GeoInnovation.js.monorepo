import { GRADUATION_LAYERS, GraduationColdLayerSources } from './graduation.definitions';

/**
 * The Event Parking layer leaves out the road closures (#2764).
 *
 * The service stores Olsen Blvd's and Reed Arena Loop's closures twice, in Road Closures (layer 2) and again in Event
 * Parking (layer 3), on both hosts. The filter is what stops every graduation map drawing them as parking, and a comment
 * beside it once said to remove it when production matched development - a condition that read as met while the filter
 * was still needed. Nothing else fails if it goes, so this does; the comment beside the filter says when it can.
 */
describe('Graduation Event Parking (#2764)', () => {
  it('leaves out the road closures that layer 2 draws', () => {
    const eventParking = GraduationColdLayerSources.find(
      (source) => source.id === GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS
    ) as { native?: { definitionExpression?: string } };

    expect(eventParking.native?.definitionExpression).toBe(`Type <> 'Closure'`);
  });
});
