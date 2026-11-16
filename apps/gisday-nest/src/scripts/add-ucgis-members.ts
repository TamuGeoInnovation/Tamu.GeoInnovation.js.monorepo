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
 *
 * On production it is not run this way: the script in the operations repository's GIS Day `data/` folder signs in as the
 * maintainer's admin account and asks this one only for the plan (#2730), with no database:
 *
 *   node -r ts-node/register -r tsconfig-paths/register apps/gisday-nest/src/scripts/add-ucgis-members.ts --plan=<file>
 *
 * where <file> is a JSON array of the season's institution names. It prints one line, `PLAN ` and the plan as JSON.
 */
import { readFileSync } from 'fs';

import { IsNull } from 'typeorm';

import { planMembers, Season, University, UCGIS_MEMBER_INSTITUTIONS } from '@tamu-gisc/gisday/platform/data-api';

const apply = process.argv.includes('--apply');
const planFile = process.argv.find((a) => a.startsWith('--plan='))?.slice('--plan='.length);

async function main() {
  if (planFile) {
    const names: Array<string> = JSON.parse(readFileSync(planFile, 'utf8'));
    console.log(`PLAN ${JSON.stringify(planMembers(names))}`);
    return;
  }

  // Loaded only here, so the plan needs no database settings.
  const dataSource = (await import('../database/data-source')).default;
  await dataSource.initialize();

  try {
    const seasons = await dataSource.getRepository(Season).find({ where: { active: true } });

    if (seasons.length !== 1) {
      throw new Error(`Expected one active season in ${process.env.TYPEORM_DATABASE}, found ${seasons.length}. Nothing written.`);
    }

    const season = seasons[0];
    const existing = await dataSource.getRepository(University).find({ where: { season: { guid: season.guid } } });
    const unattached = await dataSource.getRepository(University).count({ where: { season: IsNull() } });
    const plan = planMembers(existing.map((u) => u.name));

    console.log(`Database ${process.env.TYPEORM_DATABASE}, season ${season.year} (${season.guid}).`);
    console.log(`${existing.length} institutions in the season; ${unattached} with no season, which the site does not list.`);
    console.log(`${UCGIS_MEMBER_INSTITUTIONS.length} UCGIS members; ${plan.keep.length} already there:`);
    plan.keep.forEach((k) => console.log(`  keep  ${k.name}${k.as !== k.name ? `  (as "${k.as}")` : ''}`));

    console.log(`${plan.add.length} to add:`);
    plan.add.forEach((name) => console.log(`  ADD   ${name}`));

    if (!apply) {
      console.log('Dry run: nothing written. Run again with --apply to add them.');
      return;
    }

    await dataSource.transaction(async (manager) => {
      for (const name of plan.add) {
        await manager.save(manager.create(University, { name, season }));
      }
    });

    const after = await dataSource.getRepository(University).count({ where: { season: { guid: season.guid } } });
    console.log(`Added ${plan.add.length}. The season now has ${after} institutions.`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
