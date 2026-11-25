import { AggiemapCustomMapConfiguration } from '../../interfaces/special-event.interface';
import { EventPopups } from '../../modules/popups/popups';
import { DCBushSchoolTs } from './dc-bush-school.definitions';
import { FortWorthLawTs } from './fort-worth-law.definitions';
import { GalvestonTs } from './galveston.definitions';
import { HoustonSpaceInstituteTs } from './houston-space-institute.definitions';
import { HscCollegeOfDentistryTs } from './hsc-college-of-dentistry.definitions';
import { HscCorpusChristiTs } from './hsc-corpus-christi.definitions';
import { HscKingsvilleTs } from './hsc-kingsville.definitions';
import { HscRoundRockTs } from './hsc-round-rock.definitions';
import { MaysCityCenterTs } from './mays-city-center.definitions';
import { McAllenTs } from './mcallen.definitions';

/**
 * What each satellite campus map resolves to, kept in a file (#2600). The ten are built by one function, and lint and
 * the other specs check that each campus is correct, not that it came out as it was: a builder that quietly changed one
 * campus's field names, layer index or popup would pass them all. This compares every campus with what it resolved to
 * before the builder, so a change to any of them shows here as a diff to read.
 *
 * Keys are sorted, so an order change is not a difference; `undefined` values and the popup components' names are kept,
 * so an added empty key or a different component is.
 */
const CAMPUSES: Record<string, AggiemapCustomMapConfiguration> = {
  'dc-bush-school': DCBushSchoolTs,
  'fort-worth-law': FortWorthLawTs,
  galveston: GalvestonTs,
  'houston-space-institute': HoustonSpaceInstituteTs,
  'hsc-college-of-dentistry': HscCollegeOfDentistryTs,
  'hsc-corpus-christi': HscCorpusChristiTs,
  'hsc-kingsville': HscKingsvilleTs,
  'hsc-round-rock': HscRoundRockTs,
  'mays-city-center': MaysCityCenterTs,
  mcallen: McAllenTs
};

function resolved(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, v) => {
      if (v === undefined) return '[undefined]';
      // A popup is a lazy loader, so it is named by which one it is rather than by its anonymous function.
      const popup = Object.entries(EventPopups).find(([, p]) => p === v);
      if (popup) return `[EventPopups.${popup[0]}]`;
      if (typeof v === 'function') return `[Function ${v.name}]`;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, v[k]])
        );
      }
      return v;
    },
    2
  );
}

describe('the satellite campus maps', () => {
  for (const [id, campus] of Object.entries(CAMPUSES)) {
    it(`${id} resolves as it did before the builder`, async () => {
      expect(campus.configuration?.id).toBe(id);
      await expect(`${resolved(campus)}\n`).toMatchFileSnapshot(`./__snapshots__/satellite-campuses/${id}.json`);
    });
  }
});
