import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';

import { sponsorLogoClass } from './sponsor-logo-size';

describe('sponsorLogoClass', () => {
  it("gives each sponsor its logo size's class", () => {
    const sponsors = [{ logoSize: 'small' }, { logoSize: 'large' }, { logoSize: 'extra-large' }] as Array<Partial<Sponsor>>;

    expect(sponsors.map(sponsorLogoClass)).toEqual(['logo-small', 'logo-large', 'logo-extra-large']);
  });

  it('draws a sponsor with no size, or an unknown one, at the regular size', () => {
    const sponsors = [{}, { logoSize: 'huge' }, null] as Array<Partial<Sponsor>>;

    expect(sponsors.map(sponsorLogoClass)).toEqual(['logo-regular', 'logo-regular', 'logo-regular']);
  });
});
