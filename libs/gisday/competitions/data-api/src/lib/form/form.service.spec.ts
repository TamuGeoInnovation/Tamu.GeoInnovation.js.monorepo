import { BadRequestException } from '@nestjs/common';

import { FormService } from './form.service';

/**
 * #2474: the Designer saves when a season's submissions start and stop counting, with its form.
 */
describe('FormService, saving the scoring window', () => {
  const model = [{ attribute: 'memorial_type', isDiscriminator: true, options: [] }];
  const opens = '2026-11-14T06:00:00.000Z';
  const closes = '2026-11-20T17:00:00.000Z';

  let competitionSeason: Record<string, unknown> & { save: jest.Mock };
  let create: jest.Mock;
  let service: FormService;

  beforeEach(() => {
    competitionSeason = { guid: 'cs-2026', form: { guid: 'f-1' }, save: jest.fn(function () { return Promise.resolve(this); }) };
    create = jest.fn((values) => ({ ...values, save: jest.fn(() => Promise.resolve(values)) }));

    service = new FormService(
      { create: jest.fn((values) => values) } as never,
      {
        findOne: jest.fn(({ where }) => Promise.resolve(where.form ? competitionSeason : null)),
        create
      } as never,
      { findOne: jest.fn(() => Promise.resolve({ guid: 's-2026', active: true })) } as never
    );
  });

  it('saves both moments with the form', async () => {
    await service.updateForm('f-1', { source: 's', model } as never, {
      allowSubmissions: true,
      scoringOpensAt: opens,
      scoringClosesAt: closes
    } as never);

    expect(competitionSeason.save).toHaveBeenCalled();
    expect(competitionSeason.scoringOpensAt).toEqual(new Date(opens));
    expect(competitionSeason.scoringClosesAt).toEqual(new Date(closes));
  });

  it('clears a moment left empty, so that side has no limit', async () => {
    competitionSeason.scoringOpensAt = new Date(opens);

    await service.updateForm('f-1', { source: 's', model } as never, {
      allowSubmissions: true,
      scoringOpensAt: null,
      scoringClosesAt: ''
    } as never);

    expect(competitionSeason.scoringOpensAt).toBeNull();
    expect(competitionSeason.scoringClosesAt).toBeNull();
  });

  it('refuses a window that closes before it opens, or a moment that is not a date', async () => {
    await expect(
      service.updateForm('f-1', { source: 's', model } as never, { scoringOpensAt: closes, scoringClosesAt: opens } as never)
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.updateForm('f-1', { source: 's', model } as never, { scoringOpensAt: 'next Saturday' } as never)
    ).rejects.toThrow(BadRequestException);
    expect(competitionSeason.save).not.toHaveBeenCalled();
  });

  it('saves both moments when the season is created', async () => {
    await service.createFormForActiveSeason({ source: 's', model } as never, {
      allowSubmissions: true,
      scoringOpensAt: opens,
      scoringClosesAt: closes
    } as never);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ scoringOpensAt: new Date(opens), scoringClosesAt: new Date(closes) })
    );
  });
});
