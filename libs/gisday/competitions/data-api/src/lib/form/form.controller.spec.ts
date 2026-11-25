import { BadRequestException } from '@nestjs/common';

import { FormController } from './form.controller';
import { FormService } from './form.service';

/**
 * #3495: Express 5 leaves the body undefined when nothing is sent. Saving a form without one is refused as a bad request,
 * not a 500 from reading the form of nothing.
 */
describe('FormController, a request with no body', () => {
  let controller: FormController;

  beforeEach(() => {
    const competitionSeason = { guid: 'cs-2026', form: { guid: 'f-1' }, save: vi.fn() };

    const service = new FormService(
      { create: vi.fn((values) => values) } as never,
      {
        findOne: vi.fn(({ where }) => Promise.resolve(where.form ? competitionSeason : null)),
        create: vi.fn()
      } as never,
      { findOne: vi.fn(() => Promise.resolve({ guid: 's-2026', active: true })) } as never
    );

    controller = new FormController(service);
  });

  it('PATCH competitions/forms/:guid answers 400', async () => {
    await expect(controller.updateSeasonForm(undefined, { guid: 'f-1' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('POST competitions/forms/active answers 400', async () => {
    await expect(controller.insertFormForActiveSeason(undefined)).rejects.toBeInstanceOf(BadRequestException);
  });
});
