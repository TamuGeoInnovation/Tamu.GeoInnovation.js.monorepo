import { createHash, randomBytes } from 'crypto';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

import { BadRequestException, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';

import {
  EmailRecipient,
  PROFILE_EDIT_LINK_PREVIEW,
  PROFILE_EMAIL_COPY_EACH,
  PROFILE_EMAIL_KIND,
  fillProfileEmail,
  gisdaySite,
  participantEmails,
  profileEmailProblem,
  profileEmailSubject,
  profileEmailTemplate,
  profileEmailValues,
  profileEmailDesign,
  seasonDaysOf,
  siteEmailHtml,
  EmailDesign
} from '@tamu-gisc/gisday/common';

import { senderAs } from '../_base/site-of-request';
import { EmailSender, siteSender } from '../contact/email-sender.service';
import { EMAIL_LANES, inParallel } from '../_base/in-parallel';

import { Speaker, SpeakerEdit, SpeakerEditLink, SpeakerLinkPurpose, Submission, University } from '../entities/all.entity';
import { refuseUnsafeImage } from '../assets/image-upload';
import { SpeakerProvider } from '../speaker/speaker.provider';
import { ContactService } from '../contact/contact.service';
import { SeasonService } from '../season/season.service';
import { EmailSendLog } from './email-send-log';
import { firstOf } from './repeat-guard';

/** How long an edit link works. Long enough for a speaker to come back to it; short enough that an old email is dead. */
/** How long after a speaker is emailed their link an admin's send skips them, so a repeated request emails no one twice (#3065). */
export const REPEAT_SEND_MINUTES = 10;

export const SPEAKER_EDIT_LINK_DAYS = 7;

/** The most a speaker may send in one field. A bio is a few paragraphs; this stops a page of junk. */
export const SPEAKER_EDIT_LIMITS = Object.freeze({
  description: 4000,
  affiliation: 200,
  socialMedia: 255,
  graduationYear: 50
});

/** A speaker asking for their own link gets at most one in this many minutes, so the form cannot be used to flood an inbox. */
const REQUEST_COOLDOWN_MINUTES = 10;

export interface SpeakerEditFields {
  description?: string;
  affiliation?: string;
  socialMedia?: string;
  graduationYear?: string;
  /** A university's guid, from the season's list (#2953). */
  university?: string;
}

export interface SendResult {
  sent: Array<string>;
  skipped: Array<{ name: string; reason: string }>;
}

/** The profile email as an admin approved it (#3023): its subject and text, with their placeholders. */
export interface ProfileEmail {
  subject: string;
  template: string;
}

/**
 * The profile email before it is sent (#3023), in the shape the review emails' window reads: one group, with the text it
 * starts from and an example for the first speaker, whose link is a stand-in.
 */
export interface ProfileEmailPreview {
  groups: Array<{
    kind: string;
    label: string;
    count: number;
    subject: string;
    template: string;
    /** What the window needs to show the whole email as it will arrive, in Texas A&M's design (#3114). */
    design?: EmailDesign;
    example: { title: string; to: string; cc: string; values: Record<string, string> };
  }>;
  /** The people on the named submissions with no speaker record, who will not be emailed (#3046). */
  notEmailed?: Array<{ name: string; submission: string }>;
  /** The speakers it can go to, each with an address, for the window's tick boxes (#3104). */
  recipients?: Array<EmailRecipient>;
  /** Why it may only go as a copy each, when it may not go to them together (#3104): the profile email's own links. */
  copyEachReason?: string;
}

/** A speaker as the profile email reads them: with their season's days, for the email's design (#3114). */
const SPEAKER_WITH_DAYS = { season: { days: true } } as const;

/** Sending links for competition submissions' people (#2958): also who has no speaker record, with their submission. */
export interface SendForSubmissionsResult extends SendResult {
  unmatched: Array<{ name: string; submission: string }>;
}

/** A submission's id, as the database makes them. */
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Speakers editing their own presenter profile (#2936), without an account.
 *
 * An admin emails a speaker a personal link, or a speaker asks for one with the address on their record. The link is a
 * random 256-bit token; only its SHA-256 is stored, with the one speaker it belongs to and when it stops working. Every
 * request through it is looked up by the token, never by a speaker id from the browser, so a link reaches one speaker and
 * nothing else. What a speaker sends is a proposal, held until an admin approves it: only the bio, affiliation, social
 * links and a photo, the photo checked as an admin's upload is (PNG, JPEG, GIF or WebP, never SVG, size-limited).
 */
@Injectable()
export class SpeakerEditService {
  constructor(
    @InjectRepository(SpeakerEditLink) private readonly links: Repository<SpeakerEditLink>,
    @InjectRepository(SpeakerEdit) private readonly edits: Repository<SpeakerEdit>,
    @InjectRepository(Speaker) private readonly speakers: Repository<Speaker>,
    @InjectRepository(University) private readonly universities: Repository<University>,
    private readonly speakerProvider: SpeakerProvider,
    private readonly contact: ContactService,
    private readonly seasons: SeasonService,
    @InjectRepository(Submission) private readonly submissions: Repository<Submission>,
    /** The record of what each speaker was sent (#3167). */
    @Optional() private readonly sendLog?: EmailSendLog
  ) {}

  /**
   * Emails each person of the named competition submissions their own link (#2958), from Research Competitions. A
   * participant is matched to a speaker record of their submission's season by email, ignoring case and surrounding
   * spaces, and each speaker found is sent one link, as `sendLinks` sends them. Anyone with no speaker record is
   * returned by name, with their submission's title, so the admin can add them.
   */
  public async sendLinksForSubmissions(
    submissionGuids: Array<string> | undefined,
    host?: string,
    /** The subject and text the admin approved (#3023); without it, the email as it has always been. */
    email?: ProfileEmail,
    /** Who it is from, as the admin chose and the controller checked (#3100); the site without it. */
    sender?: EmailSender,
    /** The speakers ticked in the window (#3104), of those matched; every one matched without it. */
    speakers?: Array<string>
  ): Promise<SendForSubmissionsResult> {
    checkEmail(email);

    const chosen = chosenSpeakers(speakers);
    const found = await this.speakersOfSubmissions(submissionGuids);
    const { unmatched } = found;
    const matched = chosen ? found.matched.filter((guid) => chosen.includes(guid)) : found.matched;
    const sent = matched.length ? await this.sendLinks(matched, host, email, sender) : { sent: [], skipped: [] };

    return { ...sent, unmatched };
  }

  /** The profile email the people of the named submissions would get, for the admin to read and edit first (#3023). */
  public async previewLinksForSubmissions(submissionGuids: Array<string>, host?: string): Promise<ProfileEmailPreview> {
    const { matched, unmatched } = await this.speakersOfSubmissions(submissionGuids);
    const preview = matched.length ? await this.previewLinks(matched, host) : { groups: [] };

    // Who will get nothing, known before sending (#3046), so a missing presenter can be added first.
    return { ...preview, notEmailed: unmatched };
  }

  /**
   * The profile email the named speakers would get, for the admin to read and edit first (#3023): today's subject and
   * text, and an example for the first with an address, its link a stand-in. No link is made and nothing is sent.
   */
  public async previewLinks(speakerGuids: Array<string>, host?: string): Promise<ProfileEmailPreview> {
    if (!Array.isArray(speakerGuids) || speakerGuids.length === 0) {
      throw new BadRequestException('No speakers were named.');
    }

    const speakers = (await this.speakers.find({ where: { guid: In(speakerGuids) }, relations: SPEAKER_WITH_DAYS })).filter(
      hasEmail
    );

    if (speakers.length === 0) {
      return { groups: [] };
    }

    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const [first] = speakers;

    return {
      groups: [
        {
          kind: PROFILE_EMAIL_KIND,
          label: 'Presenter profile emails',
          count: speakers.length,
          subject: profileEmailSubject(),
          template: profileEmailTemplate(),
          // What the window needs to show the whole email as it will arrive (#3114).
          design: profileEmailDesign(site.name, seasonDaysOf(first.season)),
          example: {
            title: fullName(first),
            to: first.email.trim(),
            cc: '',
            values: profileEmailValues(first, site, PROFILE_EDIT_LINK_PREVIEW, linkExpiry())
          }
        }
      ],
      // Each to tick (#3104), and a copy each only: one email to several would give each the others' edit links. Each
      // with when they were sent it before (#3167).
      recipients: this.sendLog
        ? await this.sendLog.withSends(speakers.map(recipientOf), PROFILE_EMAIL_KIND, null)
        : speakers.map(recipientOf),
      copyEachReason: PROFILE_EMAIL_COPY_EACH
    };
  }

  /**
   * The speakers of the named submissions' people (#2958): each participant matched to a speaker record of their
   * submission's season by email, ignoring case and surrounding spaces, each speaker once; and anyone with none, by
   * name, with their submission's title.
   */
  private async speakersOfSubmissions(
    submissionGuids: Array<string> | undefined
  ): Promise<{ matched: Array<string>; unmatched: SendForSubmissionsResult['unmatched'] }> {
    if (!Array.isArray(submissionGuids) || submissionGuids.length === 0) {
      throw new BadRequestException('No submissions were named.');
    }

    if (submissionGuids.some((guid) => typeof guid !== 'string' || !GUID.test(guid))) {
      throw new BadRequestException('Name each submission by its id.');
    }

    const submissions = await this.submissions.find({ where: { guid: In(submissionGuids) }, relations: { season: true } });
    const seasons = [...new Set(submissions.map((s) => s.season?.guid).filter(Boolean))];
    const speakers = seasons.length
      ? await this.speakers.find({ where: { season: { guid: In(seasons) } }, relations: { season: true } })
      : [];
    const matched = new Set<string>();
    const unmatched: SendForSubmissionsResult['unmatched'] = [];

    for (const submission of submissions) {
      for (const participant of submission.participants ?? []) {
        if (!participant) {
          continue;
        }

        // Each address in the box, as the finalists' speaker records were made from them (#3043): co-authors typed into
        // one box, and NetIDs.
        const emails = participantEmails(participant.email);
        const named = participant.name?.trim() || participant.email?.trim() || 'A participant with no name';

        if (emails.length === 0) {
          unmatched.push({ name: named, submission: submission.title ?? '' });
          continue;
        }

        for (const email of emails) {
          const speaker = speakers.find((s) => s.season?.guid === submission.season?.guid && emailKey(s.email) === email);

          if (speaker) {
            matched.add(speaker.guid);
          } else {
            // An entry with several addresses is named with the one not found, so the admin knows which (#3043).
            unmatched.push({
              name: emails.length === 1 ? named : `${named} (${email})`,
              submission: submission.title ?? ''
            });
          }
        }
      }
    }

    return { matched: [...matched], unmatched };
  }

  /**
   * Emails each named speaker their own link (an admin's action). `host` is the address the admin is on; `email` the
   * subject and text the admin approved (#3023), checked before any link is made; `sender` who it is from, as the admin
   * chose and the controller checked (#3100), or the site.
   */
  public async sendLinks(
    speakerGuids: Array<string> | undefined,
    host?: string,
    email?: ProfileEmail,
    sender?: EmailSender
  ): Promise<SendResult> {
    checkEmail(email);

    const result: SendResult = { sent: [], skipped: [] };

    if (!Array.isArray(speakerGuids) || speakerGuids.length === 0) {
      throw new BadRequestException('No speakers were named.');
    }

    const speakers = await this.speakers.find({ where: { guid: In(speakerGuids) }, relations: SPEAKER_WITH_DAYS });

    // Several at a time (#3067): one by one, 48 emails took long enough for the request to be repeated (#3065).
    const parts = await inParallel(speakers, EMAIL_LANES, async (speaker) => {
      const part: SendResult = { sent: [], skipped: [] };

      const name = fullName(speaker);

      if (!hasEmail(speaker)) {
        part.skipped.push({ name, reason: 'no email address on their record' });
        return part;
      }

      // Never the same email twice in a row (#3065): on 15 November 2026 one send reached the API twice, 30 seconds
      // apart, and all 48 finalists got it twice. The link is the claim, as the session emails' claims are (#3326):
      // recorded before its email goes, in the table every copy of the API shares, and it stands only if it is the
      // speaker's earliest profile link of the last `REPEAT_SEND_MINUTES`. Counting recent links first let two sends
      // racing both pass, in one copy or in two. Only profile links: a judging link sent a minute ago (#3183) is another
      // email.
      const link = await this.saveLink(speaker, host, 'profile');
      const since = new Date(Date.now() - REPEAT_SEND_MINUTES * 60 * 1000);
      const recent = await this.links.find({
        where: { speaker: { guid: speaker.guid }, created: MoreThan(since), purpose: 'profile' }
      });

      if (firstOf([...recent, link.row]).guid !== link.row.guid) {
        await this.links.delete(link.row.guid);
        part.skipped.push({ name, reason: `already emailed a link in the last ${REPEAT_SEND_MINUTES} minutes` });
        return part;
      }

      try {
        await this.emailLink(speaker, host, email, sender, link);
        part.sent.push(name);
      } catch (err) {
        // Not sent, so not a repeat, and a link nobody was given: the admin may try again at once.
        await this.links.delete(link.row.guid);
        Logger.error(`Could not email an edit link to speaker ${speaker.guid}: ${err.message}`, 'SpeakerEditService');
        part.skipped.push({ name, reason: 'the email could not be sent' });
      }

      return part;
    });

    result.sent.push(...parts.flatMap((p) => p.sent));
    result.skipped.push(...parts.flatMap((p) => p.skipped));

    return result;
  }

  /**
   * A speaker asking for their own link with their email address. The answer is the same whether or not the address is a
   * speaker's, so the form cannot be used to learn who is speaking.
   */
  public async requestLink(email: string, host?: string): Promise<void> {
    if (!looksLikeEmail(email)) {
      return;
    }

    const season = await this.seasons.findOneActive().catch(() => null);

    if (!season) {
      return;
    }

    const candidates = await this.speakers.find({ where: { season: { guid: season.guid } }, relations: SPEAKER_WITH_DAYS });
    const speaker = candidates.filter(hasEmail).find((s) => s.email.trim().toLowerCase() === email.trim().toLowerCase());

    if (!speaker) {
      return;
    }

    const since = new Date(Date.now() - REQUEST_COOLDOWN_MINUTES * 60 * 1000);
    const recent = await this.links.count({
      where: { speaker: { guid: speaker.guid }, created: MoreThan(since), purpose: 'profile' }
    });

    if (recent > 0) {
      return;
    }

    await this.emailLink(speaker, host).catch((err) =>
      Logger.error(`Could not email a requested edit link to speaker ${speaker.guid}: ${err.message}`, 'SpeakerEditService')
    );
  }

  /** What the edit page shows: the speaker's profile as it is, and what they have already proposed. */
  public async forLink(token: string) {
    const link = await this.linkFor(token);
    const speaker = await this.speakers.findOne({
      where: { guid: link.speaker.guid },
      relations: { images: true, university: true, organization: true }
    });

    // Deleted since the link was read (deleting a speaker deletes their links too).
    if (!speaker) {
      throw new NotFoundException('This link has expired or is not valid. Ask for a new one.');
    }

    const pending = await this.edits.findOne({
      where: { speaker: { guid: speaker.guid }, status: 'pending' },
      relations: { university: true }
    });

    return {
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      current: profileOf(speaker),
      organization: speaker.organization?.name ?? null,
      photo: speaker.images?.[0]?.path ?? null,
      pending: pending
        ? {
            ...profileOf(pending),
            photo: Boolean(pending.photoPath),
            sent: pending.created
          }
        : null,
      expires: link.expires,
      limits: SPEAKER_EDIT_LIMITS
    };
  }

  /** Records what a speaker proposes, replacing anything they proposed before. */
  public async propose(
    token: string,
    fields: Partial<Record<keyof SpeakerEditFields, unknown>> | undefined,
    photo?: Express.Multer.File
  ) {
    const link = await this.linkFor(token);
    const clean = cleanFields(fields);

    // The same check as an admin's upload, before anything is kept: a JPEG or PNG by its content (#2937).
    if (photo) {
      refuseUnsafeImage(photo, 'The photo');
    }

    const previous = await this.edits.find({ where: { speaker: { guid: link.speaker.guid }, status: 'pending' } });
    const { university, ...text } = clean;
    const chosen = university ? await this.universities.findOne({ where: { guid: university } }) : null;

    if (university && !chosen) {
      throw new BadRequestException('That university is not in the list.');
    }

    const edit = this.edits.create({
      speaker: { guid: link.speaker.guid } as Speaker,
      ...text,
      university: chosen ? ({ guid: chosen.guid } as University) : null,
      status: 'pending',
      photoPath: null
    });

    edit.guid = crypto.randomUUID();

    if (photo?.buffer) {
      const folder = 'speaker-edits';
      edit.photoPath = `${folder}/${edit.guid}`;
      await mkdir(join(appData(), folder), { recursive: true });
      await writeFile(join(appData(), edit.photoPath), photo.buffer);
    }

    // A photo proposed before and now replaced stays only if this edit carries none, so a speaker can change their bio
    // without sending their photo again.
    const carried = !edit.photoPath ? (previous.find((p) => p.photoPath)?.photoPath ?? null) : null;

    edit.photoPath = edit.photoPath ?? carried;

    await this.edits.save(edit);

    for (const old of previous) {
      if (old.photoPath && old.photoPath !== edit.photoPath) {
        await removeFile(old.photoPath);
      }
    }

    if (previous.length) {
      await this.edits.delete(previous.map((p) => p.guid));
    }

    return { received: true };
  }

  /** Every pending edit, oldest first, with the speaker as they are now, for the admins to compare. */
  public async pending() {
    const edits = await this.edits.find({
      where: { status: 'pending' },
      relations: { speaker: { images: true, university: true }, university: true },
      order: { created: 'ASC' }
    });

    return edits.map((e) => ({
      guid: e.guid,
      sent: e.created,
      speaker: { guid: e.speaker.guid, firstName: e.speaker.firstName, lastName: e.speaker.lastName },
      current: profileOf(e.speaker),
      proposed: profileOf(e),
      photo: Boolean(e.photoPath),
      currentPhoto: e.speaker.images?.[0]?.path ?? null
    }));
  }

  /** A pending edit's proposed photo, for the admins to see before approving it. */
  public async photo(editGuid: string): Promise<Buffer> {
    const edit = await this.edits.findOne({ where: { guid: editGuid } });

    if (!edit?.photoPath) {
      throw new NotFoundException('No photo was proposed.');
    }

    return readFile(join(appData(), edit.photoPath));
  }

  public async approve(editGuid: string, adminGuid: string | undefined) {
    const edit = await this.pendingEdit(editGuid);
    const buffer = edit.photoPath ? await readFile(join(appData(), edit.photoPath)) : null;
    // The speaker provider prefixes the speaker's guid, and its upload check names the file for its content (#2937).
    // Named for this edit, so a new photo never takes the old one's address (#3091): uploads are served as immutable.
    const photo = buffer ? { buffer, originalname: `photo-${edit.guid}` } : undefined;

    await this.speakerProvider.applySelfEdit(
      edit.speaker.guid,
      {
        description: edit.description,
        affiliation: edit.affiliation,
        socialMedia: edit.socialMedia,
        graduationYear: edit.graduationYear,
        university: edit.university ?? null
      },
      photo
    );

    await this.close(edit, 'approved', adminGuid);

    return { approved: true };
  }

  public async reject(editGuid: string, adminGuid: string | undefined) {
    await this.close(await this.pendingEdit(editGuid), 'rejected', adminGuid);

    return { rejected: true };
  }

  private async close(edit: SpeakerEdit, status: 'approved' | 'rejected', adminGuid: string | undefined) {
    if (edit.photoPath) {
      await removeFile(edit.photoPath);
    }

    await this.edits.update(edit.guid, { status, reviewedAt: new Date(), reviewedBy: adminGuid ?? null, photoPath: null });
  }

  private async pendingEdit(guid: string): Promise<SpeakerEdit> {
    const edit = await this.edits.findOne({
      where: { guid, status: 'pending' },
      relations: { speaker: true, university: true }
    });

    if (!edit) {
      throw new NotFoundException('That edit is not waiting for review.');
    }

    return edit;
  }

  /**
   * The link a token belongs to, if it is one, still works, and opens `purpose`. Every failure reads the same. The one
   * check of a speaker's link: the profile edit uses it, and so does `SpeakerEditLinkGuard`, before a session's slides are
   * touched (#3093), each for a `profile` link; a judge's routes ask for a `judging` link (#3183). So a judging link never
   * opens a profile, nor a profile link the judging page.
   */
  public async linkFor(token: string, purpose: SpeakerLinkPurpose = 'profile'): Promise<SpeakerEditLink> {
    const link =
      typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token)
        ? await this.links.findOne({ where: { tokenHash: hashOf(token) }, relations: { speaker: true } })
        : null;

    // A link from before purposes were kept is a profile link: the column's default made it one (AddJudging).
    if (!link || link.purpose !== purpose || new Date(link.expires).getTime() <= Date.now()) {
      throw new NotFoundException('This link has expired or is not valid. Ask for a new one.');
    }

    return link;
  }

  /**
   * A new link of the speaker's own, on the site `host` names, for an email to carry: to their presenter page (#2936),
   * whether the profile email or the Ask for slides email sends it (#3113), or with `purpose` `judging`, to the
   * competition they judge (#3183). Only its hash is stored; the link itself is in the email alone.
   */
  public async newLink(
    speaker: Pick<Speaker, 'guid' | 'email'>,
    host?: string,
    purpose: SpeakerLinkPurpose = 'profile'
  ): Promise<{ url: string; expires: Date }> {
    const { url, expires } = await this.saveLink(speaker, host, purpose);

    return { url, expires };
  }

  /**
   * `newLink`, with the row it saved. Its id and time are set here, as a claim's are, so every copy of the API orders
   * two links made at once the same way (#3326).
   */
  private async saveLink(
    speaker: Pick<Speaker, 'guid' | 'email'>,
    host: string | undefined,
    purpose: SpeakerLinkPurpose
  ): Promise<{ row: SpeakerEditLink; url: string; expires: Date }> {
    const token = randomBytes(32).toString('base64url');
    const expires = linkExpiry();
    const site = gisdaySite(process.env.GISDAY_SITE, host);

    const row = await this.links.save(
      this.links.create({
        guid: crypto.randomUUID(),
        created: new Date(Date.now()),
        speaker: { guid: speaker.guid } as Speaker,
        tokenHash: hashOf(token),
        expires,
        sentTo: speaker.email,
        purpose
      })
    );

    return { row, url: `${site.address}${purpose === 'judging' ? '/judging/' : '/presenters/edit/'}${token}`, expires };
  }

  /** Emails the speaker their profile link: `link` if it was already made, as `sendLinks` makes it, or a new one. */
  private async emailLink(
    speaker: Speaker & { email: string },
    host?: string,
    email?: ProfileEmail,
    sender?: EmailSender,
    link?: { url: string; expires: Date }
  ) {
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const { url, expires } = link ?? (await this.newLink(speaker, host));

    // The text the admin approved (#3023), or the email as it has always been; either way this speaker's own link.
    const { subject, text } = fillProfileEmail(
      email ?? { subject: profileEmailSubject(), template: profileEmailTemplate() },
      profileEmailValues(speaker, site, url, expires)
    );

    // As the admin chose (#3100), or from the site, as a speaker asking for their own link is.
    const from = sender ?? siteSender(site.name);

    await this.contact.sendMessage(
      {
        to: speaker.email.trim(),
        ...from,
        subject,
        text,
        // The Markdown as HTML (#3044), in Texas A&M's design on its site (#3114), beside the plain text.
        html: siteEmailHtml(text, {
          site,
          subject,
          from: from.from,
          design: profileEmailDesign(site.name, seasonDaysOf(speaker.season))
        })
      },
      true
    );

    // Recorded once it has gone (#3167), whoever sent it: an admin, or the speaker asking for their own link.
    await this.sendLog?.record([speaker], PROFILE_EMAIL_KIND, null, from.from);
  }
}

/** When a link made now stops working: what a preview says of the link each speaker will get (#3113). */
export function linkExpiry(): Date {
  return new Date(Date.now() + SPEAKER_EDIT_LINK_DAYS * 24 * 60 * 60 * 1000);
}

/** Refuses an edited profile email that cannot be sent (#3023): no subject, no text, or no `{edit link}`. */
function checkEmail(email: ProfileEmail | undefined): void {
  const problem = email === undefined ? null : profileEmailProblem(email);

  if (problem) {
    throw new BadRequestException(problem);
  }
}

/** The email a speaker receives, as it is sent unedited. */
export function linkEmail(speaker: Pick<Speaker, 'firstName'>, siteName: string, url: string, expires: Date): string {
  return fillProfileEmail(
    { subject: profileEmailSubject(), template: profileEmailTemplate() },
    profileEmailValues(speaker, { name: siteName, address: '' }, url, expires)
  ).text;
}

// Where it lived first; kept so its importers need not change.
export { senderAs };

export function hashOf(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Only the three text fields, trimmed, each within its limit; anything else sent is dropped. `fields` is what the form
 * sent, so each may be anything, null included, until it is checked here.
 */
export function cleanFields(fields: Partial<Record<keyof SpeakerEditFields, unknown>> = {}): SpeakerEditFields {
  const clean: SpeakerEditFields = {};

  for (const key of ['description', 'affiliation', 'socialMedia', 'graduationYear'] as const) {
    const value = fields[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException(`${key} must be text.`);
    }

    const trimmed = value.trim();

    if (trimmed.length > SPEAKER_EDIT_LIMITS[key]) {
      throw new BadRequestException(`${key} is ${trimmed.length} characters; the most is ${SPEAKER_EDIT_LIMITS[key]}.`);
    }

    clean[key] = trimmed;
  }

  // A university is one of the season's, by guid; the service checks it exists (#2953).
  if (fields.university !== undefined && fields.university !== null && fields.university !== '') {
    if (typeof fields.university !== 'string' || !/^[0-9a-f-]{36}$/i.test(fields.university)) {
      throw new BadRequestException('Choose a university from the list.');
    }

    clean.university = fields.university;
  }

  // One link, as the admin form's "Social Media Link" holds, and only a web address: never javascript: or the like.
  if (clean.socialMedia && !/^https?:\/\/[^\s<>"']+$/i.test(clean.socialMedia)) {
    throw new BadRequestException('The link must be one web address starting with http:// or https://.');
  }

  return clean;
}

/** The fields a speaker can change, as the edit page and the review show them, from a speaker or a proposed edit. */
function profileOf(p: {
  description: string | null;
  affiliation: string | null;
  socialMedia: string | null;
  graduationYear: string | null;
  university?: { guid: string; name?: string } | null;
}) {
  return {
    description: p.description ?? null,
    affiliation: p.affiliation ?? null,
    socialMedia: p.socialMedia ?? null,
    graduationYear: p.graduationYear ?? null,
    university: p.university ? { guid: p.university.guid, name: p.university.name ?? null } : null
  };
}

/** A speaker's name as the results and previews give it. */
export function fullName(s: Pick<Speaker, 'firstName' | 'lastName'>): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.replace(/\s+/g, ' ').trim();
}

/** A speaker with an address as a speaker email's preview lists them, for the window's tick boxes (#3104). */
export function recipientOf(s: Pick<Speaker, 'guid' | 'firstName' | 'lastName'> & { email: string }): EmailRecipient {
  return { guid: s.guid, name: fullName(s), firstName: s.firstName?.trim() ?? '', email: s.email.trim() };
}

/**
 * The speakers ticked in the window, as a send names them (#3104), or undefined when it names none: everyone, as before.
 * A list of no one, or anything but ids, is refused, so a send can never quietly go to everyone instead.
 */
export function chosenSpeakers(speakers: unknown): Array<string> | undefined {
  if (speakers === undefined || speakers === null) {
    return undefined;
  }

  if (!Array.isArray(speakers) || speakers.some((s) => typeof s !== 'string')) {
    throw new BadRequestException('Name the speakers chosen by their ids.');
  }

  if (speakers.length === 0) {
    throw new BadRequestException('No speakers were chosen.');
  }

  return speakers;
}

/**
 * Whether a record's email address could be sent to: something, one "@", then a domain with a dot that has something on
 * each side, and no spaces. Checked piece by piece rather than with one pattern, which backtracked on a long run of "!."
 * (CodeQL js/polynomial-redos, #3776).
 */
export function looksLikeEmail(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const address = value.trim();
  const at = address.indexOf('@');
  const domain = address.slice(at + 1);

  return at > 0 && !/[\s@]/.test(address.slice(0, at)) && !/[\s@]/.test(domain) && domain.slice(1, -1).includes('.');
}

/** Whether a speaker has an address to email, as `looksLikeEmail` checks it, typed on the speaker. */
export function hasEmail<S extends { email: string | null }>(s: S): s is S & { email: string } {
  return looksLikeEmail(s.email);
}

function appData(): string {
  return `${process.env.APP_DATA}`;
}

async function removeFile(path: string) {
  await unlink(join(appData(), path)).catch(() => undefined);
}

/** An email address as two records are matched by it: trimmed and lower case, or null for none. */
function emailKey(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
}
