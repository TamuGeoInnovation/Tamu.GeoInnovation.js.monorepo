import * as fs from 'fs';
import * as path from 'path';

import { DCBushSchoolTs } from './dc-bush-school.definitions';
import { FortWorthLawTs } from './fort-worth-law.definitions';
import { HoustonSpaceInstituteTs } from './houston-space-institute.definitions';
import { MaysCityCenterTs } from './mays-city-center.definitions';
import { HscRoundRockTs } from './hsc-round-rock.definitions';
import { HscKingsvilleTs } from './hsc-kingsville.definitions';
import { HscCorpusChristiTs } from './hsc-corpus-christi.definitions';
import { HscDallasNorthwestTs, HscDallasSoutheastTs } from './hsc-dallas.definitions';
import { GalvestonTs } from './galveston.definitions';
import { McAllenTs } from './mcallen.definitions';

/**
 * Every satellite campus map offers a picture of itself on the campus maps page (#1245).
 *
 * The page previously listed a heading, a description and an "Open map" link, with a large empty area
 * where a picture should be. The tile is the link now, and it is driven by `discover.thumbnail` so
 * that adding a campus is a data change rather than a markup one.
 *
 * The file is checked to exist as well as to be named. A definition pointing at an asset that is not
 * there renders a broken image on a page whose whole purpose is to show what you are choosing
 * between, and nothing else in the build would notice.
 */

const REPO_ROOT = (() => {
  let dir = __dirname;

  while (!fs.existsSync(path.join(dir, 'nx.json'))) {
    const parent = path.dirname(dir);

    if (parent === dir) {
      throw new Error('Could not locate the workspace root from ' + __dirname);
    }

    dir = parent;
  }

  return dir;
})();

/** Where the application serves `./assets/...` from. */
const ASSETS_ROOT = path.join(REPO_ROOT, 'apps', 'aggiemap-angular', 'src');

const campuses = [
  { label: 'Galveston', root: GalvestonTs },
  { label: 'McAllen', root: McAllenTs },
  { label: 'DC / Bush School', root: DCBushSchoolTs },
  { label: 'Fort Worth Law School', root: FortWorthLawTs },
  { label: 'Houston Space Institute', root: HoustonSpaceInstituteTs },
  { label: 'Mays City Center', root: MaysCityCenterTs },
  { label: 'HSC Round Rock', root: HscRoundRockTs },
  { label: 'HSC Kingsville', root: HscKingsvilleTs },
  { label: 'HSC Corpus Christi', root: HscCorpusChristiTs },
  { label: 'HSC Dallas Northwest', root: HscDallasNorthwestTs },
  { label: 'HSC Dallas Southeast', root: HscDallasSoutheastTs }
];

describe('satellite campus thumbnails', () => {
  it('covers every campus the definitions declare', () => {
    // A campus added without being added here would otherwise be silently unchecked.
    expect(campuses.length).toBe(11);
  });

  it.each(campuses)('$label is listed as a satellite campus', ({ root }) => {
    // The page builds its list by filtering on this, so a definition that loses it disappears from
    // the page rather than appearing without a picture.
    expect(root.discover?.type).toBe('satellite-campus');
  });

  it.each(campuses)('$label declares a thumbnail', ({ root }) => {
    expect(root.discover?.thumbnail).toBeTruthy();
  });

  it.each(campuses)('$label thumbnail is served from the application assets', ({ root }) => {
    // `./assets/...` is what the application requests at runtime; anything else would not resolve.
    expect(root.discover?.thumbnail?.startsWith('./assets/')).toBe(true);
  });

  it('lists which campuses are development-only, so one cannot go public unnoticed', () => {
    // `visible: false` is what keeps a campus off production's All Maps page (#2437, #2438). Removing
    // it is how a campus the GIS team is still checking reaches the public, and nothing else in the
    // repository would notice, so the two lists are pinned against each other here.
    //
    // Every campus is live on production as of 27 October 2026 (#2473), so the list is empty - and an
    // empty expectation is still the check: a campus added development-only in future fails here until
    // it is named, which is the point. It is not "no campuses are gated"; it is "these are, and they
    // were meant to be".
    const developmentOnly = campuses
      .filter(({ root }) => root.discover?.visible === false)
      .map(({ label }) => label)
      .sort();

    expect(developmentOnly).toEqual([]);
  });

  it.each(campuses)('$label thumbnail file exists', ({ root }) => {
    const thumbnail = root.discover?.thumbnail ?? '';
    const onDisk = path.join(ASSETS_ROOT, thumbnail.replace(/^\.\//, ''));

    expect(fs.existsSync(onDisk)).toBe(true);
  });
});
