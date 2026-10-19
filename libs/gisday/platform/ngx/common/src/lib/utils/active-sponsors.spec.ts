import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';

import { activeSponsors } from './active-sponsors';

describe('activeSponsors', () => {
  it('leaves out sponsors switched off for the season', () => {
    const sponsors = [
      { name: 'Landpoint', active: true },
      { name: 'Last year only', active: false },
      { name: 'From an older API' }
    ] as Array<Partial<Sponsor>>;

    expect(activeSponsors(sponsors).map((s) => s.name)).toEqual(['Landpoint', 'From an older API']);
  });

  it('answers an empty list for no sponsors', () => {
    expect(activeSponsors(null)).toEqual([]);
  });
});
