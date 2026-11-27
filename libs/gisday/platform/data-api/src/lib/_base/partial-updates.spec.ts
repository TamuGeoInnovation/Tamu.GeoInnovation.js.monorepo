import { Repository } from 'typeorm';

import { SUBMISSION_DEADLINE_FIELDS } from '@tamu-gisc/gisday/common';

import { Assessment, Event, Place, Rubric, Season, Speaker, Submission } from '../entities/all.entity';
import { PlaceService } from '../place/place.service';
import { SeasonService } from '../season/season.service';
import { EventProvider } from '../event/event.provider';
import { UpdateEventDto } from '../event/dto/update-event.dto';
import { SpeakerProvider } from '../speaker/speaker.provider';
import { RubricService } from '../judging/rubric.service';
import { JudgingService } from '../judging/judging.service';

/**
 * #3862. An update changes only what it is sent (found by home's g238, the API side of #3827).
 *
 * The shared base update merges the body over the stored record, so a field left out keeps its value. These routes did
 * their own update and wiped what was left out. Each test stores a record with every field set, updates one field, and
 * reads back what was written: every other field must be as it was. None loses data from the site today, whose pages send
 * the whole record, but the first caller that sends part of one would.
 */

/** A repository stand-in: `findOne` answers `stored`, and writes are recorded and answered with what they were given. */
function repo<T>(stored?: unknown, found: Array<unknown> = []) {
  return {
    findOne: vi.fn(async () => stored),
    find: vi.fn(async () => found),
    create: vi.fn((x: unknown) => x),
    save: vi.fn(async (x: unknown) => x),
    update: vi.fn(async () => ({ affected: 1 })),
    delete: vi.fn(async () => ({ affected: 0 }))
  } as unknown as Repository<T> &
    Record<'findOne' | 'find' | 'create' | 'save' | 'update' | 'delete', ReturnType<typeof vi.fn>>;
}

const unused = {} as never;

describe('Partial updates keep what they are not sent (#3862)', () => {
  it('places: an update without its links and visibility keeps them', async () => {
    const stored = {
      guid: 'p-1',
      name: 'A made-up campus',
      links: [{ guid: 'l-1', label: 'Its site', url: 'https://example.test' }],
      visibilitySettings: { header: true },
      logos: []
    };
    const places = repo<Place>(stored);
    const service = new PlaceService(places, repo(), unused, unused);

    await service.updatePlace('p-1', { name: 'Renamed' } as Partial<Place>);

    const written = places.save.mock.calls[0][0];
    expect(written).toMatchObject({ name: 'Renamed', visibilitySettings: { header: true } });
    expect(written.links).toEqual(stored.links);
  });

  it('submission deadlines: an update of one deadline keeps the others', async () => {
    const stored = Object.fromEntries(
      SUBMISSION_DEADLINE_FIELDS.map((field) => [
        field,
        new Date(/Files/.test(field) ? '2026-11-05T00:00:00.000Z' : '2026-11-01T00:00:00.000Z')
      ])
    );
    const seasons = repo<Season>({ guid: 's-1', year: 2026, ...stored });
    const service = new SeasonService(seasons, repo());
    const [first] = SUBMISSION_DEADLINE_FIELDS;

    const answered = await service.setSubmissionDeadlines('s-1', { [first]: '2026-11-02T00:00:00.000Z' } as never);

    const written = seasons.update.mock.calls[0][1] as Record<string, unknown>;
    for (const field of SUBMISSION_DEADLINE_FIELDS.filter((f) => f !== first)) {
      expect(written[field] === undefined || (written[field] as Date).getTime() === (stored[field] as Date).getTime()).toBe(
        true
      );
    }
    expect((answered as Record<string, Date>)[SUBMISSION_DEADLINE_FIELDS[1]]).toEqual(stored[SUBMISSION_DEADLINE_FIELDS[1]]);
  });

  it("competition settings: an update of one session keeps the competition's other settings", async () => {
    const notified = new Date('2026-11-13T18:00:00.000Z');
    const row = {
      guid: 'r-poster',
      competitionType: 'poster',
      runs: true,
      sessionGuid: 'e-poster',
      graduateSessionGuid: 'e-graduate',
      awardsSessionGuid: 'e-awards',
      finalistsNotifiedAt: notified
    };
    const manager = {
      find: vi.fn(async (entity: unknown) => (entity === Event ? [{ guid: 'e-awards-2' }] : [row])),
      create: vi.fn((_: unknown, x: unknown) => x),
      save: vi.fn(async (_: unknown, x: unknown) => x)
    };
    const seasons = Object.assign(repo<Season>({ guid: 's-1' }), {
      manager: { transaction: (fn: (m: unknown) => unknown) => fn(manager) }
    });
    const service = new SeasonService(seasons as never, repo());

    await service.setCompetitionSettings('s-1', [{ competitionType: 'poster', awardsSessionGuid: 'e-awards-2' }]);

    expect(manager.save.mock.calls[0][1]).toEqual([{ ...row, awardsSessionGuid: 'e-awards-2' }]);
  });

  it('events: an update without tags and speakers keeps them', async () => {
    const stored = {
      guid: 'e-1',
      name: 'Old title',
      tags: [{ guid: 't-1' }],
      speakers: [{ guid: 's-1' }],
      judges: []
    };
    const events = repo<Event>(stored);
    const save = vi.fn(async () => ({ guid: 'e-1' }));
    events.create.mockReturnValue({ save });
    const provider = new EventProvider(events, repo(), repo(), repo(), repo(), repo(), repo(), repo(), unused);

    await provider.updateEvent('e-1', { name: 'New title' } as unknown as UpdateEventDto);

    const written = events.create.mock.calls[0][0];
    expect(written).toMatchObject({ name: 'New title' });
    expect(written.tags).toEqual(stored.tags);
    expect(written.speakers).toEqual(stored.speakers);
  });

  it('speakers: an update without isOrganizer and isActive keeps them', async () => {
    const stored = { guid: 'sp-1', firstName: 'Ana', lastName: 'Abe', isOrganizer: true, isActive: true };
    const speakers = repo<Speaker>(stored);
    const provider = new SpeakerProvider(speakers, repo(), repo(), repo(), unused, unused);

    await provider.updateWithInfo('sp-1', { firstName: 'Anna' });

    expect(speakers.save.mock.calls[0][0]).toMatchObject({ firstName: 'Anna', isOrganizer: true, isActive: true });
  });

  it('rubrics: an update without its description keeps it', async () => {
    const stored = {
      guid: 'rb-1',
      competitionType: 'poster',
      name: 'Posters',
      description: 'How posters are judged',
      criteria: []
    };
    const rubrics = repo<Rubric>(stored);
    const rubricRow = repo();
    const criteria = repo();
    Object.assign(rubrics, {
      manager: {
        transaction: (fn: (m: unknown) => unknown) =>
          fn({ getRepository: (e: unknown) => (e === Rubric ? rubricRow : criteria) })
      }
    });
    const service = new RubricService(rubrics, repo());

    await service.update('rb-1', {
      name: 'Posters, renamed',
      criteria: [
        {
          name: 'Clarity',
          maxPoints: 4,
          levels: [
            { label: 'Excellent', description: 'Made up' },
            { label: 'Good', description: 'Made up' },
            { label: 'Fair', description: 'Made up' },
            { label: 'Poor', description: 'Made up' }
          ]
        }
      ]
    } as never);

    expect(rubricRow.update.mock.calls[0][1]).toEqual({ name: 'Posters, renamed', description: 'How posters are judged' });
  });

  it("judging: a judge's scores sent again without a comment keep their comment", async () => {
    const submissions = repo<Submission>({
      guid: 'sub-1',
      acceptance: true,
      classificationType: 'graduate',
      submissionType: 'poster',
      season: { guid: 's-1' }
    });
    const events = repo<Event>(undefined, [
      { guid: 'e-1', judgedCompetition: 'graduate-poster', judgingClosed: false, season: { guid: 's-1' } }
    ]);
    const assessments = repo<Assessment>({
      guid: 'a-1',
      created: new Date('2026-11-20T00:00:00.000Z'),
      comment: 'A made-up comment'
    });
    const rubrics = {
      rubricFor: vi.fn(async () => ({
        guid: 'rb-1',
        criteria: [{ guid: 'c-1', name: 'Clarity', maxPoints: 4, levels: [] }]
      }))
    };
    const service = new JudgingService(events, submissions, assessments, repo(), rubrics as never);

    await service.assess({ speaker: { guid: 'j-1' } } as never, 'sub-1', { scores: { 'c-1': 3 } } as never);

    expect(assessments.create.mock.calls[0][0]).toMatchObject({ comment: 'A made-up comment' });
  });
});
