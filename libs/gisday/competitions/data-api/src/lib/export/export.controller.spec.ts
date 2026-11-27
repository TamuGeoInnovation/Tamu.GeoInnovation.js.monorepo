import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import JSZip from 'jszip';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { ExportController } from './export.controller';
import { ExportService } from './export.service';

/**
 * The admin Submissions page's download, `GET /competitions/export/zip` (#545), is what stays when the queued export
 * goes (#3788): a request through Nest's real routing and `PermissionsGuard` gets the season's zip. Only the token check
 * is replaced, and the service's own `zipForSeason` builds the zip from made-up rows, so the route, the guard and the
 * zip are all the real ones.
 */
describe('ExportController GET /competitions/export/zip (#3788)', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;

  const repos = {
    platformSeasonRepo: { findOne: vi.fn(async () => ({ guid: 'season-2026', year: 2026 })) },
    seasonRepo: { findOne: vi.fn(async () => ({ guid: 'comp-2026' })) },
    submissionRepo: {
      find: vi.fn(async () => [
        {
          guid: 'sub-1',
          userGuid: 'auth0|made-up-1',
          created: new Date('2026-11-17T15:00:00Z'),
          value: { category: 'Monument' },
          location: { latitude: 30.61, longitude: -96.34 },
          validationStatus: { status: 'verified' }
        }
      ])
    },
    mediaRepo: { find: vi.fn(async () => [{ guid: 'm-1', mimeType: 'image/jpeg', blob: Buffer.from('a made-up photo') }]) }
  };

  beforeEach(async () => {
    permissions = [];

    const module = await Test.createTestingModule({
      controllers: [ExportController],
      // The real zipForSeason, on made-up repositories: independent of whatever else the service is constructed with.
      providers: [{ provide: ExportService, useValue: { zipForSeason: ExportService.prototype.zipForSeason.bind(repos) } }]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'admin-1', permissions };
          return true;
        }
      })
      .compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterEach(async () => {
    await app?.close();
  });

  it("answers an admin who can change competitions with the season's zip", async () => {
    permissions = ['update:competitions'];

    const response = await fetch(`${url}/competitions/export/zip`);
    const zip = await JSZip.loadAsync(Buffer.from(await response.arrayBuffer()));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/zip');
    expect(response.headers.get('content-disposition')).toContain('gisday-2026-vgi-submissions.zip');
    expect(
      Object.keys(zip.files)
        .filter((name) => !zip.files[name].dir)
        .sort()
    ).toEqual(['medias/sub-1/images/m-1.jpg', 'submissions.csv']);
    expect(await zip.file('medias/sub-1/images/m-1.jpg')?.async('string')).toBe('a made-up photo');
  });

  it('refuses an account that cannot change competitions', async () => {
    permissions = ['read:rsvps'];

    expect((await fetch(`${url}/competitions/export/zip`)).status).toBe(403);
  });
});
