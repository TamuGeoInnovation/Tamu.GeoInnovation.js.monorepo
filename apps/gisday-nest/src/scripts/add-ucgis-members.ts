/**
 * Adds every UCGIS member institution that a GIS Day database does not already have to its active season, so the
 * complete-profile page's institution list includes them (#2721). The list, and the other spellings that count as an
 * institution already being there, are `UCGIS_MEMBER_INSTITUTIONS` in the data-api library.
 *
 * A dry run by default: it names the database and season, lists what it would add and what is already there, and
 * writes nothing. With --apply it adds them, in one transaction. Run it again and it finds nothing to add.
 *
 * It connects as the migrations do, with the `TYPEORM_*` settings of the database it is run against
 * (docs/gisday-migrations.md, "Running against dev or production"), once per GIS Day database:
 *
 *   nx run gisday-nest:add-ucgis-members             dry run
 *   nx run gisday-nest:add-ucgis-members --apply
 *
 * Institutions it adds can be renamed or removed afterwards in the site's admin pages like any other.
 */
import { IsNull } from 'typeorm';

import { institutionKey, institutionsToAdd, Season, University, UCGIS_MEMBER_INSTITUTIONS } from '@tamu-gisc/gisday/platform/data-api';

import dataSource from '../database/data-source';

const apply = process.argv.includes('--apply');

async function main() {
  await dataSource.initialize();

  try {
    const seasons = await dataSource.getRepository(Season).find({ where: { active: true } });

    if (seasons.length !== 1) {
      throw new Error(`Expected one active season in ${process.env.TYPEORM_DATABASE}, found ${seasons.length}. Nothing written.`);
    }

    const season = seasons[0];
    const existing = await dataSource.getRepository(University).find({ where: { season: { guid: season.guid } } });
    const unattached = await dataSource.getRepository(University).count({ where: { season: IsNull() } });
    const adding = institutionsToAdd(existing.map((u) => u.name));

    console.log(`Database ${process.env.TYPEORM_DATABASE}, season ${season.year} (${season.guid}).`);
    console.log(`${existing.length} institutions in the season; ${unattached} with no season, which the site does not list.`);
    console.log(`${UCGIS_MEMBER_INSTITUTIONS.length} UCGIS members; ${UCGIS_MEMBER_INSTITUTIONS.length - adding.length} already there:`);

    for (const m of UCGIS_MEMBER_INSTITUTIONS.filter((m) => !adding.includes(m))) {
      const as = existing.find((u) => [m.name, ...(m.alsoKnownAs ?? [])].some((n) => institutionKey(n) === institutionKey(u.name ?? '')));
      console.log(`  keep  ${m.name}${as && as.name !== m.name ? `  (as "${as.name}")` : ''}`);
    }

    console.log(`${adding.length} to add:`);
    adding.forEach((m) => console.log(`  ADD   ${m.name}`));

    if (!apply) {
      console.log('Dry run: nothing written. Run again with --apply to add them.');
      return;
    }

    await dataSource.transaction(async (manager) => {
      for (const m of adding) {
        await manager.save(manager.create(University, { name: m.name, season }));
      }
    });

    const after = await dataSource.getRepository(University).count({ where: { season: { guid: season.guid } } });
    console.log(`Added ${adding.length}. The season now has ${after} institutions.`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
