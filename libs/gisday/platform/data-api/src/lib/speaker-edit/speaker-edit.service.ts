import { createHash, randomBytes } from 'crypto';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';

import { gisdaySite } from '@tamu-gisc/gisday/common';

import { Speaker, SpeakerEdit, SpeakerEditLink } from '../entities/all.entity';
import { SpeakerProvider } from '../speaker/speaker.provider';
import { ContactService } from '../contact/contact.service';
import { SeasonService } from '../season/season.service';

/** How long an edit link works. Long enough for a speaker to come back to it; short enough that an old email is dead. */
export const SPEAKER_EDIT_LINK_DAYS = 7;

/** The most a speaker may send in one field. A bio is a few paragraphs; this stops a page of junk. */
export const SPEAKER_EDIT_LIMITS = Object.freeze({ description: 4000, affiliation: 200, socialMedia: 255 });

/** A speaker asking for their own link gets at most one in this many minutes, so the form cannot be used to flood an inbox. */
const REQUEST_COOLDOWN_MINUTES = 10;

export interface SpeakerEditFields {
  description?: string;
  affiliation?: string;
  socialMedia?: string;
}

export interface SendResult {
  sent: Array<string>;
  skipped: Array<{ name: string; reason: string }>;
}

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
    private readonly speakerProvider: SpeakerProvider,
    private readonly contact: ContactService,
    private readonly seasons: SeasonService
  ) {}

  /** Emails each named speaker their own link (an admin's action). `host` is the address the admin is on. */
  public async sendLinks(speakerGuids: Array<string>, host?: string): Promise<SendResult> {
    const result: SendResult = { sent: [], skipped: [] };

    if (!Array.isArray(speakerGuids) || speakerGuids.length === 0) {
      throw new BadRequestException('No speakers were named.');
    }

    const speakers = await this.speakers.find({ where: { guid: In(speakerGuids) } });

    for (const speaker of speakers) {
      const name = fullName(speaker);

      if (!looksLikeEmail(speaker.email)) {
        result.skipped.push({ name, reason: 'no email address on their record' });
        continue;
      }

      try {
        await this.emailLink(speaker, host);
        result.sent.push(name);
      } catch (err) {
        Logger.error(`Could not email an edit link to speaker ${speaker.guid}: ${err.message}`, 'SpeakerEditService');
        result.skipped.push({ name, reason: 'the email could not be sent' });
      }
    }

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

    const candidates = await this.speakers.find({ where: { season: { guid: season.guid } } });
    const speaker = candidates.find((s) => s.email?.trim().toLowerCase() === email.trim().toLowerCase());

    if (!speaker) {
      return;
    }

    const since = new Date(Date.now() - REQUEST_COOLDOWN_MINUTES * 60 * 1000);
    const recent = await this.links.count({ where: { speaker: { guid: speaker.guid }, created: MoreThan(since) } });

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
    const speaker = await this.speakers.findOne({ where: { guid: link.speaker.guid }, relations: { images: true } });
    const pending = await this.edits.findOne({ where: { speaker: { guid: speaker.guid }, status: 'pending' } });

    return {
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      current: { description: speaker.description, affiliation: speaker.affiliation, socialMedia: speaker.socialMedia },
      photo: speaker.images?.[0]?.path ?? null,
      pending: pending
        ? {
            description: pending.description,
            affiliation: pending.affiliation,
            socialMedia: pending.socialMedia,
            photo: Boolean(pending.photoPath),
            sent: pending.created
          }
        : null,
      expires: link.expires,
      limits: SPEAKER_EDIT_LIMITS
    };
  }

  /** Records what a speaker proposes, replacing anything they proposed before. */
  public async propose(token: string, fields: SpeakerEditFields, photo?: Express.Multer.File) {
    const link = await this.linkFor(token);
    const clean = cleanFields(fields);

    if (photo?.buffer) {
      this.speakerProvider.refuseUnsafePhoto(photo);
    }

    const previous = await this.edits.find({ where: { speaker: { guid: link.speaker.guid }, status: 'pending' } });
    const edit = this.edits.create({
      speaker: { guid: link.speaker.guid } as Speaker,
      ...clean,
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
      relations: { speaker: { images: true } },
      order: { created: 'ASC' }
    });

    return edits.map((e) => ({
      guid: e.guid,
      sent: e.created,
      speaker: { guid: e.speaker.guid, firstName: e.speaker.firstName, lastName: e.speaker.lastName },
      current: {
        description: e.speaker.description,
        affiliation: e.speaker.affiliation,
        socialMedia: e.speaker.socialMedia
      },
      proposed: { description: e.description, affiliation: e.affiliation, socialMedia: e.socialMedia },
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

  public async approve(editGuid: string, adminGuid: string) {
    const edit = await this.pendingEdit(editGuid);
    const buffer = edit.photoPath ? await readFile(join(appData(), edit.photoPath)) : null;
    // The speaker provider prefixes the speaker's guid; the name here only carries the type, which the photo's own bytes say.
    const photo = buffer ? { buffer, originalname: isPng(buffer) ? 'photo.png' : 'photo.jpg' } : undefined;

    await this.speakerProvider.applySelfEdit(
      edit.speaker.guid,
      { description: edit.description, affiliation: edit.affiliation, socialMedia: edit.socialMedia },
      photo
    );

    await this.close(edit, 'approved', adminGuid);

    return { approved: true };
  }

  public async reject(editGuid: string, adminGuid: string) {
    await this.close(await this.pendingEdit(editGuid), 'rejected', adminGuid);

    return { rejected: true };
  }

  private async close(edit: SpeakerEdit, status: 'approved' | 'rejected', adminGuid: string) {
    if (edit.photoPath) {
      await removeFile(edit.photoPath);
    }

    await this.edits.update(edit.guid, { status, reviewedAt: new Date(), reviewedBy: adminGuid ?? null, photoPath: null });
  }

  private async pendingEdit(guid: string): Promise<SpeakerEdit> {
    const edit = await this.edits.findOne({ where: { guid, status: 'pending' }, relations: { speaker: true } });

    if (!edit) {
      throw new NotFoundException('That edit is not waiting for review.');
    }

    return edit;
  }

  /** The link a token belongs to, if it is one and still works. Every failure reads the same. */
  private async linkFor(token: string): Promise<SpeakerEditLink> {
    const link =
      typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token)
        ? await this.links.findOne({ where: { tokenHash: hashOf(token) }, relations: { speaker: true } })
        : null;

    if (!link || new Date(link.expires).getTime() <= Date.now()) {
      throw new NotFoundException('This link has expired or is not valid. Ask for a new one.');
    }

    return link;
  }

  private async emailLink(speaker: Speaker, host?: string) {
    const token = randomBytes(32).toString('base64url');
    const expires = new Date(Date.now() + SPEAKER_EDIT_LINK_DAYS * 24 * 60 * 60 * 1000);
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const url = `${site.address}/presenters/edit/${token}`;

    await this.links.save(
      this.links.create({
        speaker: { guid: speaker.guid } as Speaker,
        tokenHash: hashOf(token),
        expires,
        sentTo: speaker.email
      })
    );

    await this.contact.sendMessage(
      {
        to: speaker.email.trim(),
        from: process.env.MAILROOM_FROM,
        replyTo: process.env.MAILROOM_TO,
        subject: `Update your ${site.name} presenter profile`,
        text: linkEmail(speaker, site.name, url, expires)
      },
      true
    );
  }
}

/** The email a speaker receives. */
export function linkEmail(speaker: Pick<Speaker, 'firstName'>, siteName: string, url: string, expires: Date): string {
  const until = expires.toLocaleDateString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return `Howdy${speaker.firstName ? ` ${speaker.firstName.trim()}` : ''},

You can update your presenter profile on ${siteName} - your bio, photo, affiliation and link - here:

${url}

This link is yours alone and works until ${until}. The ${siteName} team reviews each change before it appears on the site.

If you did not expect this email, you can ignore it.`;
}

export function hashOf(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Only the three text fields, trimmed, each within its limit; anything else sent is dropped. */
export function cleanFields(fields: SpeakerEditFields = {}): SpeakerEditFields {
  const clean: SpeakerEditFields = {};

  for (const key of ['description', 'affiliation', 'socialMedia'] as const) {
    const value = fields?.[key];

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

  // One link, as the admin form's "Social Media Link" holds, and only a web address: never javascript: or the like.
  if (clean.socialMedia && !/^https?:\/\/[^\s<>"']+$/i.test(clean.socialMedia)) {
    throw new BadRequestException('The link must be one web address starting with http:// or https://.');
  }

  return clean;
}

function fullName(s: Pick<Speaker, 'firstName' | 'lastName'>): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.replace(/\s+/g, ' ').trim();
}

function looksLikeEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** A PNG starts with these eight bytes; anything else accepted is stored as a JPEG. */
function isPng(buffer: Buffer): boolean {
  return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}

function appData(): string {
  return `${process.env.APP_DATA}`;
}

async function removeFile(path: string) {
  await unlink(join(appData(), path)).catch(() => undefined);
}
