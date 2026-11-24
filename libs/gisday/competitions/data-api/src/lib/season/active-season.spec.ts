import { NotFoundException } from '@nestjs/common';

import { activeCompetitionSeason, activeSeason } from './active-season';

/** #3325. Made-up seasons only. */
describe('the active season lookups', () => {
  const seasons = (season: object | null) => ({ findOne: jest.fn(async () => season) }) as never;
  const compSeasons = (compSeason: object | null) => ({ findOne: jest.fn(async () => compSeason) });

  it('finds the active GIS Day season, or says there is none', async () => {
    await expect(activeSeason(seasons({ guid: 's-1' }))).resolves.toEqual({ guid: 's-1' });
    await expect(activeSeason(seasons(null))).rejects.toEqual(new NotFoundException('No active season found.'));
  });

  it("finds the active season's competition season, with the relations asked for", async () => {
    const comp = compSeasons({ guid: 'c-1' });

    await expect(activeCompetitionSeason(seasons({ guid: 's-1' }), comp as never, { form: true })).resolves.toEqual({ guid: 'c-1' });
    expect(comp.findOne).toHaveBeenCalledWith({ where: { season: { guid: 's-1' } }, relations: { form: true } });
  });

  it('says which is missing: the season, or its competition season', async () => {
    await expect(activeCompetitionSeason(seasons(null), compSeasons(null) as never)).rejects.toEqual(
      new NotFoundException('No active season found.')
    );
    await expect(activeCompetitionSeason(seasons({ guid: 's-1' }), compSeasons(null) as never)).rejects.toEqual(
      new NotFoundException('No competition season found.')
    );
  });
});
