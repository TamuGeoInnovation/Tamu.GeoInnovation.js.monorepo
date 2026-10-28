import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import { factory } from '../utils/definitionFactory';

/**
 * The Single Occupancy Restroom layer opens the restroom popup (#1961).
 *
 * It used the generic markdown popup, filled from a template in its layer source, which could not leave
 * out a row with no value and never showed the building number, while the restroom popup sat unused.
 */
describe('the Single Occupancy Restroom layer', () => {
  it('opens the restroom popup', () => {
    expect(factory({ environment: 'prod' }).Definitions.SINGLE_OCCUPANCY_RESTROOMS.popupComponent).toBe(
      Popups.RestroomPopupComponent
    );
  });

  it('takes nothing from a popup template in its layer source', () => {
    const source = factory({ environment: 'prod' }).LayerSources.find(
      (s) => s.id === 'single-occupancy-restroom-locations-layer'
    );

    expect(source?.popupComponent).toBe(Popups.RestroomPopupComponent);
    expect(source?.popupData).toBeUndefined();
  });
});
