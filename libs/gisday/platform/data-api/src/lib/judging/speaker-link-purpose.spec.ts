import { ExecutionContext, NotFoundException } from '@nestjs/common';

import { SpeakerEditLink } from '../entities/all.entity';
import { SpeakerEditLinkGuard } from '../speaker-edit/speaker-edit-link.guard';
import { SpeakerEditService, hashOf } from '../speaker-edit/speaker-edit.service';
import { JudgeLinkGuard } from './judge-link.guard';

/**
 * #3183: a judge's link is a speaker's link with a purpose of its own, made and checked by the one link mechanism. Each
 * opens only its own page: a judging link is refused wherever a profile link works (the profile page, a session's
 * slides), and a profile link is refused on the judging page, each as a link that does not work.
 */
describe('Speaker links have a purpose (#3183)', () => {
  const PROFILE = 'p'.repeat(43);
  const JUDGING = 'j'.repeat(43);
  const OLD = 'o'.repeat(43);
  const EXPIRED = 'e'.repeat(43);
  const later = new Date(Date.now() + 60 * 60 * 1000);

  let rows: Array<Partial<SpeakerEditLink>>;
  let service: SpeakerEditService;

  const linkRepo = {
    create: (x) => x,
    save: jest.fn(async (x) => rows.push(x)),
    findOne: jest.fn(async ({ where }) => rows.find((r) => r.tokenHash === where.tokenHash) ?? null),
    count: jest.fn(async () => 0)
  };

  /** A request through a guard, as Nest hands it one, with `token` in the path. */
  function through(guard: { canActivate: (c: ExecutionContext) => Promise<boolean> }, token: string) {
    const request: Record<string, unknown> = { params: { token } };
    const context = { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;

    return guard.canActivate(context).then(() => request);
  }

  beforeEach(() => {
    rows = [
      // Made-up speakers.
      { tokenHash: hashOf(PROFILE), purpose: 'profile', expires: later, speaker: { guid: 'sp-av' } as never },
      { tokenHash: hashOf(JUDGING), purpose: 'judging', expires: later, speaker: { guid: 'sp-av' } as never },
      // A link made before purposes were kept: a profile link, as the column's default made it when it was added.
      { tokenHash: hashOf(OLD), purpose: 'profile', expires: later, speaker: { guid: 'sp-bl' } as never },
      {
        tokenHash: hashOf(EXPIRED),
        purpose: 'judging',
        expires: new Date(Date.now() - 1000),
        speaker: { guid: 'sp-av' } as never
      }
    ];
    service = new SpeakerEditService(
      linkRepo as never,
      { findOne: jest.fn(async () => null), find: jest.fn(async () => []) } as never,
      { findOne: jest.fn(async () => ({ guid: 'sp-av', firstName: 'Avery', lastName: 'Example' })) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );
  });

  it('opens the profile routes with a profile link, and not with a judging link', async () => {
    const guard = new SpeakerEditLinkGuard(service);

    expect(((await through(guard, PROFILE)).speakerEditLink as SpeakerEditLink).purpose).toBe('profile');
    expect((await through(guard, OLD)).speakerEditLink).toBeDefined();
    await expect(through(guard, JUDGING)).rejects.toThrow(
      new NotFoundException('This link has expired or is not valid. Ask for a new one.')
    );
  });

  it("refuses a judging link on the speaker's own profile page", async () => {
    await expect(service.forLink(JUDGING)).rejects.toThrow(NotFoundException);
    await expect(service.forLink(PROFILE)).resolves.toEqual(expect.objectContaining({ firstName: 'Avery' }));
  });

  it('opens the judging routes with a judging link, and not with a profile link or an old one', async () => {
    const guard = new JudgeLinkGuard(service);

    expect(((await through(guard, JUDGING)).judgingLink as SpeakerEditLink).purpose).toBe('judging');
    await expect(through(guard, PROFILE)).rejects.toThrow(NotFoundException);
    await expect(through(guard, OLD)).rejects.toThrow(NotFoundException);
    await expect(through(guard, EXPIRED)).rejects.toThrow(NotFoundException);
  });

  it('makes a judging link to the judging page, kept with its purpose, and a profile link to the presenter page', async () => {
    const judging = await service.newLink({ guid: 'sp-av', email: 'avery@example.org' }, 'example.org', 'judging');
    const profile = await service.newLink({ guid: 'sp-av', email: 'avery@example.org' }, 'example.org');

    expect(judging.url).toMatch(/\/judging\/[A-Za-z0-9_-]{43}$/);
    expect(profile.url).toMatch(/\/presenters\/edit\/[A-Za-z0-9_-]{43}$/);
    expect(rows.slice(-2).map((r) => r.purpose)).toEqual(['judging', 'profile']);

    const token = judging.url.split('/').pop();

    await expect(service.linkFor(token, 'judging')).resolves.toBeDefined();
    await expect(service.linkFor(token)).rejects.toThrow(NotFoundException);
  });
});
