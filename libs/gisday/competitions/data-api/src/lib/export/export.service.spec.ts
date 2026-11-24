import { NotFoundException, StreamableFile } from '@nestjs/common';
import JSZip from 'jszip';

import { ExportService } from './export.service';

/** The bytes a streamed file sends, read by its events: JSZip's node stream is not async-iterable. */
function bytesOf(file: StreamableFile): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Array<Buffer> = [];
    const stream = file.getStream();

    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

const repo = (answers: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(answers).map(([method, value]) => [method, jest.fn(async () => value)]));

/**
 * #545: the VGI export built in the request and streamed, as a session's slides and the competition files are (#3185),
 * so it needs no queue: the cluster has no Redis for #650's, and a job there would never run.
 */
describe('ExportService.zipForSeason() (#545)', () => {
  const season = { guid: 'season-2026', year: 2026 };
  const competitionSeason = { guid: 'comp-2026' };
  const submissions = [
    {
      guid: 'sub-1',
      userGuid: 'auth0|made-up-1',
      created: new Date('2026-11-17T15:00:00Z'),
      value: JSON.stringify({ category: 'Monument', name: 'A made-up plaque' }),
      location: { latitude: 30.61, longitude: -96.34, accuracy: 8, altitude: 100 },
      validationStatus: { status: 'verified' }
    },
    {
      guid: 'sub-2',
      userGuid: 'auth0|made-up-2',
      created: new Date('2026-11-18T16:00:00Z'),
      value: { category: 'Sign' },
      location: null,
      validationStatus: null
    }
  ];
  const medias: Record<string, Array<unknown>> = {
    'sub-1': [
      { guid: 'm-1', mimeType: 'image/jpeg', blob: Buffer.from('jpeg one') },
      { guid: 'm-2', mimeType: 'image/png', blob: Buffer.from('png two') }
    ],
    'sub-2': []
  };

  function service(over: { season?: unknown; competitionSeason?: unknown } = {}) {
    const seasons = repo({ findOne: 'season' in over ? over.season : season });
    const competitionSeasons = repo({ findOne: 'competitionSeason' in over ? over.competitionSeason : competitionSeason });
    const submissionRepo = repo({ find: submissions });
    const mediaRepo = {
      find: jest.fn(async ({ where }) => medias[where.submission.guid] ?? [])
    };

    return {
      seasons,
      submissionRepo,
      service: new ExportService(
        undefined,
        competitionSeasons as never,
        seasons as never,
        submissionRepo as never,
        mediaRepo as never
      )
    };
  }

  it("streams one zip of the season's submissions: a CSV, and each one's photos in its own folder", async () => {
    const { service: s, submissionRepo } = service();
    const file = await s.zipForSeason();
    const zip = await JSZip.loadAsync(await bytesOf(file));

    expect(file.getHeaders().type).toBe('application/zip');
    expect(file.getHeaders().disposition).toContain('gisday-2026-vgi-submissions.zip');
    expect(
      Object.keys(zip.files)
        .filter((name) => !zip.files[name].dir)
        .sort()
    ).toEqual(['medias/sub-1/images/m-1.jpg', 'medias/sub-1/images/m-2.png', 'submissions.csv']);
    expect(await zip.file('medias/sub-1/images/m-1.jpg').async('string')).toBe('jpeg one');
    expect(submissionRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { season: { guid: 'comp-2026' } } }));
  });

  it('writes the CSV as the queued export did: a row each, with its location, status, photos and answers', async () => {
    const zip = await JSZip.loadAsync(await bytesOf(await service().service.zipForSeason()));
    const [header, first, second] = (await zip.file('submissions.csv').async('string')).trim().split(/\r?\n/);

    expect(header.split(',')).toEqual(
      expect.arrayContaining([
        'submission_guid',
        'latitude',
        'validation_status',
        'image_count',
        'image_paths',
        'category',
        'name'
      ])
    );
    expect(first).toContain('sub-1');
    expect(first).toContain('verified');
    expect(first).toContain('medias/sub-1/images/m-1.jpg;medias/sub-1/images/m-2.png');
    expect(first).toContain('A made-up plaque');
    expect(second).toContain('unverified');
  });

  it('exports the active season unless asked for another', async () => {
    const { service: s, seasons } = service();

    await s.zipForSeason();
    expect(seasons.findOne).toHaveBeenCalledWith({ where: { active: true } });

    await s.zipForSeason('season-2025');
    expect(seasons.findOne).toHaveBeenCalledWith({ where: { guid: 'season-2025' } });
  });

  it('says so when the season has no VGI competition or no submissions, rather than sending an empty zip', async () => {
    await expect(service({ competitionSeason: null }).service.zipForSeason()).rejects.toBeInstanceOf(NotFoundException);
    await expect(service({ season: null }).service.zipForSeason()).rejects.toBeInstanceOf(NotFoundException);

    const none = service();
    (none.submissionRepo.find as jest.Mock).mockResolvedValue([]);
    await expect(none.service.zipForSeason()).rejects.toBeInstanceOf(NotFoundException);
  });
});
