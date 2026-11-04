import { Sponsor, SponsorLogoSize } from '@tamu-gisc/gisday/platform/data-api';

/**
 * The logo sizes an organizer can choose for a sponsor, smallest first, with their labels (#2638).
 */
export const SPONSOR_LOGO_SIZES: Array<{ value: SponsorLogoSize; label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'regular', label: 'Regular' },
  { value: 'large', label: 'Large' },
  { value: 'extra-large', label: 'Extra large' }
];

/**
 * The class that sizes a sponsor's logo on the public site, from the shared `.icon-grid` styles. A
 * sponsor with no size, or one this site does not know (an API from before #2638), is `regular`.
 */
export function sponsorLogoClass(sponsor: Partial<Sponsor> | null | undefined): string {
  const size = SPONSOR_LOGO_SIZES.some((s) => s.value === sponsor?.logoSize) ? sponsor.logoSize : 'regular';

  return `logo-${size}`;
}
