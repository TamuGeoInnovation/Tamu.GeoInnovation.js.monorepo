import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { SeasonDayController } from './season-day.controller';
import { SeasonDayService } from './season-day.service';

/**
 * `POST season-days` and `PATCH season-days/:guid` only ever answered 501, and the maintainer decided they go (#3793
 * question 3, #3796); the tag `parked/season-day-writes` keeps them. Through Nest's real routing, with the guards
 * passed, so a route that still exists answers rather than being refused at the door.
 */
describe('SeasonDayController (#3796)', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [SeasonDayController],
      providers: [
        {
          provide: SeasonDayService,
          useValue: {
            find: async () => [{ guid: 'd-1' }],
            findOne: async (guid: string) => ({ guid }),
            getDayEvents: async () => [{ guid: 'e-1' }]
          }
        }
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('has no POST route', async () => {
    const response = await fetch(`${url}/season-days`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}'
    });

    expect(response.status).toBe(404);
  });

  it('has no PATCH route', async () => {
    const response = await fetch(`${url}/season-days/d-1`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: '{}'
    });

    expect(response.status).toBe(404);
  });

  it('still reads the days, one day and its events', async () => {
    expect(await (await fetch(`${url}/season-days`)).json()).toEqual([{ guid: 'd-1' }]);
    expect(await (await fetch(`${url}/season-days/d-1`)).json()).toEqual({ guid: 'd-1' });
    expect(await (await fetch(`${url}/season-days/d-1/events`)).json()).toEqual([{ guid: 'e-1' }]);
  });

  // DELETE only answered 501 too, and goes with them (#3793 question 7A, #3896).
  it('has no DELETE route', async () => {
    expect((await fetch(`${url}/season-days/d-1`, { method: 'DELETE' })).status).toBe(404);
  });
});
