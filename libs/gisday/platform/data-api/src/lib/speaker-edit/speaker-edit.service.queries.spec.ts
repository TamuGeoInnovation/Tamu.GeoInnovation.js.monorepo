import { DataSource, Repository } from 'typeorm';

import { Event, Organization, Speaker, SpeakerEdit, SpeakerEditLink, Submission, University } from '../entities/all.entity';
import {
  answering,
  loadedSeason,
  queryCheckingDataSource,
  queryCheckingRepository,
  recordWrites
} from '../_base/query-checking-data-source';
import { AssetsService } from '../assets/assets.service';
import { ContactService } from '../contact/contact.service';
import { SeasonService } from '../season/season.service';
import { SpeakerProvider } from '../speaker/speaker.provider';
import { SpeakerEditService } from './speaker-edit.service';

// The service's queries as typeorm builds them, with the real entities. speaker-edit.service.spec.ts mocks the
// repositories, so it cannot see a query typeorm itself refuses, such as a loaded row with a null column passed as a where
// value (#2363). Emails go to a stub; only the queries around them are checked.

/** A speaker as the API loads them: most columns are optional and come back null. */
const loadedSpeaker = () =>
  Object.assign(new Speaker(), {
    guid: 'sp-1',
    firstName: 'Ana',
    lastName: null,
    email: 'ana@example.com',
    description: null,
    affiliation: null,
    socialMedia: null,
    graduationYear: null,
    accountGuid: null,
    badgePrintedAt: null,
    images: [],
    organization: null,
    university: null,
    season: loadedSeason({ days: [] })
  });

/** A link's token: 43 characters of base64url, as `newLink` makes them. */
const TOKEN = 'a'.repeat(43);

const loadedLink = () =>
  Object.assign(new SpeakerEditLink(), {
    guid: 'l-1',
    tokenHash: 'hash',
    expires: new Date(Date.now() + 60 * 60 * 1000),
    sentTo: null,
    purpose: 'profile',
    speaker: loadedSpeaker()
  });

const loadedEdit = () =>
  Object.assign(new SpeakerEdit(), {
    guid: 'ed-1',
    description: 'A bio',
    affiliation: null,
    socialMedia: null,
    graduationYear: null,
    university: null,
    photoPath: null,
    status: 'pending',
    reviewedAt: null,
    reviewedBy: null,
    speaker: loadedSpeaker()
  });

describe('SpeakerEditService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: SpeakerEditService;
  let links: Repository<SpeakerEditLink>;
  let edits: Repository<SpeakerEdit>;
  let speakers: Repository<Speaker>;
  let submissions: Repository<Submission>;

  beforeEach(async () => {
    dataSource = await queryCheckingDataSource();
    // Updates and deletes go through a query runner, which records them instead of sending them.
    recordWrites(dataSource);

    const repo = <T extends object>(entity: new () => T) => queryCheckingRepository(dataSource, entity);
    const seasons = { findOneActive: async () => loadedSeason({ days: [] }) } as unknown as SeasonService;
    const contact = { sendMessage: async () => undefined } as unknown as ContactService;

    links = repo(SpeakerEditLink);
    edits = repo(SpeakerEdit);
    speakers = repo(Speaker);
    submissions = repo(Submission);

    // Approving applies the edit through the speaker provider, on the same repositories.
    const speakerProvider = new SpeakerProvider(
      speakers,
      repo(University),
      repo(Organization),
      repo(Event),
      null as unknown as AssetsService,
      seasons
    );

    service = new SpeakerEditService(
      links,
      edits,
      speakers,
      repo(University),
      speakerProvider,
      contact,
      seasons,
      submissions
    );
  });

  /** A submission as the API loads it, with its season, and one participant who is the speaker above. */
  const loadedSubmission = () =>
    Object.assign(new Submission(), {
      guid: '00000000-0000-4000-8000-000000000001',
      title: 'A poster',
      abstract: null,
      link: null,
      participants: [{ name: 'Ana', email: 'ana@example.com' }],
      season: loadedSeason({ days: [] })
    });

  it("emails the speakers of competition submissions their links, matched by the submission's season", async () => {
    answering(submissions, 'find', [loadedSubmission()]);
    answering(speakers, 'find', [loadedSpeaker()]);

    await expect(service.sendLinksForSubmissions([loadedSubmission().guid])).resolves.toMatchObject({
      sent: ['Ana'],
      unmatched: []
    });
  });

  it('previews the profile email for the speakers of competition submissions', async () => {
    answering(submissions, 'find', [loadedSubmission()]);
    answering(speakers, 'find', [loadedSpeaker()]);

    await expect(service.previewLinksForSubmissions([loadedSubmission().guid])).resolves.toMatchObject({ notEmailed: [] });
  });

  it('previews the profile email for named speakers', async () => {
    answering(speakers, 'find', [loadedSpeaker()]);

    await expect(service.previewLinks(['sp-1'])).resolves.toMatchObject({ groups: [{ count: 1 }] });
  });

  it('emails named speakers their links, skipping any emailed one in the last minutes', async () => {
    answering(speakers, 'find', [loadedSpeaker()]);

    await expect(service.sendLinks(['sp-1'])).resolves.toEqual({ sent: ['Ana'], skipped: [] });
  });

  it('emails a speaker who asks for their own link', async () => {
    answering(speakers, 'find', [loadedSpeaker()]);

    await expect(service.requestLink('ana@example.com')).resolves.toBeUndefined();
  });

  it("shows a link's speaker their profile and what they have proposed", async () => {
    answering(links, 'findOne', loadedLink());
    answering(speakers, 'findOne', loadedSpeaker());
    answering(edits, 'findOne', loadedEdit());

    await expect(service.forLink(TOKEN)).resolves.toMatchObject({ firstName: 'Ana', pending: { description: 'A bio' } });
  });

  it("records a speaker's proposal, replacing the one before", async () => {
    answering(links, 'findOne', loadedLink());
    answering(edits, 'find', [loadedEdit()]);

    await expect(service.propose(TOKEN, { description: 'A new bio' })).resolves.toEqual({ received: true });
  });

  it('lists the pending edits, oldest first', async () => {
    await expect(service.pending()).resolves.toEqual([]);
  });

  it("finds a pending edit's photo, refusing one that has none", async () => {
    answering(edits, 'findOne', loadedEdit());

    await expect(service.photo('ed-1')).rejects.toThrow('No photo was proposed.');
  });

  it('approves an edit, applying it to the speaker', async () => {
    answering(edits, 'findOne', loadedEdit());
    answering(speakers, 'findOne', loadedSpeaker());

    await expect(service.approve('ed-1', 'auth0|admin')).resolves.toEqual({ approved: true });
  });

  it('rejects an edit', async () => {
    answering(edits, 'findOne', loadedEdit());

    await expect(service.reject('ed-1', 'auth0|admin')).resolves.toEqual({ rejected: true });
  });

  it('finds the link a token belongs to', async () => {
    answering(links, 'findOne', loadedLink());

    await expect(service.linkFor(TOKEN)).resolves.toMatchObject({ guid: 'l-1' });
  });
});
