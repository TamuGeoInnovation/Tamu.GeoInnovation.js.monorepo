import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';

/**
 * The sponsors to show on the public site: those not switched off for their season. A sponsor with
 * no `active` value (an API from before #1962) counts as active.
 */
export function activeSponsors<T extends Partial<Sponsor>>(sponsors: Array<T> | null | undefined): Array<T> {
  return (sponsors ?? []).filter((sponsor) => sponsor?.active !== false);
}
