import { NotFoundException } from '@nestjs/common';
import { FindOptionsRelations, Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason } from '../entities/all.entities';

/**
 * The active GIS Day season, or a 404 "No active season found." (#3325). The competition services each looked it up
 * themselves, six times, with messages and statuses that had begun to differ.
 */
export async function activeSeason(seasons: Repository<Season>): Promise<Season> {
  const season = await seasons.findOne({ where: { active: true } });

  if (!season) {
    throw new NotFoundException('No active season found.');
  }

  return season;
}

/**
 * The active season's competition season, with `relations`, or a 404 saying which is missing: "No active season found."
 * or "No competition season found." (#3325).
 */
export async function activeCompetitionSeason(
  seasons: Repository<Season>,
  compSeasons: Repository<CompetitionSeason>,
  relations?: FindOptionsRelations<CompetitionSeason>
): Promise<CompetitionSeason> {
  const season = await activeSeason(seasons);
  const compSeason = await compSeasons.findOne({ where: { season: { guid: season.guid } }, relations });

  if (!compSeason) {
    throw new NotFoundException('No competition season found.');
  }

  return compSeason;
}
