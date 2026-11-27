import { Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionForm, CompetitionSeason } from '../entities/all.entities';
import { FormService } from './form.service';

/**
 * #3862. A competition form saved without the season's settings keeps them (found by home's g238). The designer sends all
 * three, so nothing lost them from the site, but an update left without `season` turned submissions off and cleared the
 * scoring window. The stored season has every setting; one update of the form's questions reads them all back unchanged.
 */
describe('FormService.updateForm, a partial update (#3862)', () => {
  const opens = new Date('2026-11-16T15:00:00.000Z');
  const closes = new Date('2026-11-20T23:00:00.000Z');

  function stored() {
    const competitionSeason = {
      guid: 'cs-1',
      allowSubmissions: true,
      scoringOpensAt: opens,
      scoringClosesAt: closes,
      form: { guid: 'f-1', source: 'made-up', model: [] },
      save: vi.fn(function (this: unknown) {
        return Promise.resolve(this);
      })
    };
    const repo = { findOne: vi.fn(async () => competitionSeason) } as unknown as Repository<CompetitionSeason>;

    return {
      competitionSeason,
      service: new FormService({} as Repository<CompetitionForm>, repo, {} as Repository<Season>)
    };
  }

  const model = [{ attribute: 'kind', title: 'What did you find?', type: 'select', isDiscriminator: true, options: [] }];

  it("keeps whether submissions are open, and the scoring window, when the update does not send the season's settings", async () => {
    const { competitionSeason, service } = stored();

    await service.updateForm('f-1', { model } as never);

    expect(competitionSeason).toMatchObject({ allowSubmissions: true, scoringOpensAt: opens, scoringClosesAt: closes });
  });

  it('changes only the setting it is sent', async () => {
    const { competitionSeason, service } = stored();

    await service.updateForm('f-1', { model } as never, { allowSubmissions: false });

    expect(competitionSeason).toMatchObject({ allowSubmissions: false, scoringOpensAt: opens, scoringClosesAt: closes });
  });

  it('still clears the window when it is sent empty, as the designer does with Clear', async () => {
    const { competitionSeason, service } = stored();

    await service.updateForm('f-1', { model } as never, {
      allowSubmissions: true,
      scoringOpensAt: null,
      scoringClosesAt: null
    });

    expect(competitionSeason).toMatchObject({ allowSubmissions: true, scoringOpensAt: null, scoringClosesAt: null });
  });
});
