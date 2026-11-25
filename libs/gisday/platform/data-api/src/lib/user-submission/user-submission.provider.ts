import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { isOwnerOrPermitted } from '@tamu-gisc/common/nest/auth';
import {
  fillReviewEmail,
  gisdaySite,
  GisdaySite,
  reminderEmailKind,
  ReminderSkipReason,
  reminderSkipReason,
  REVIEW_EMAIL_KINDS,
  ReviewEmailKind,
  reviewEmailKind,
  reviewEmailKindLabel,
  reviewEmailKindSubject,
  ReviewEmailSession,
  reviewEmailSubject,
  reviewEmailTemplate,
  reviewEmailValues,
  reviewEmailDesign,
  seasonDaysOf,
  siteEmailHtml,
  EmailDesign
} from '@tamu-gisc/gisday/common';
import {
  closedAt,
  closedMessage,
  isDeadlineCompetition,
  notRunningMessage,
  runsCompetition
} from '@tamu-gisc/gisday/common';

import {
  Event as GisdayEvent,
  SubmissionType,
  Submission,
  Season,
  PRESENTATION_SUBMISSION_TYPE
} from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { EmailSender, siteSender } from '../contact/email-sender.service';
import { EMAIL_LANES, inParallel } from '../_base/in-parallel';
import { SeasonService } from '../season/season.service';
import { ContactService } from '../contact/contact.service';
import { PosterDto } from './dto/poster.dto';
import { SubmissionWithSubmitter, submitterOf } from './dto/submission-submitter.dto';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { AssetsService } from '../assets/assets.service';
import { rethrowHttp } from '../_base/rethrow-http';

/** A submission's id, as the database makes them. */
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** What approving or rejecting several submissions did (#2958): the titles reviewed, and each that failed, with why. */
export interface ReviewManyResult {
  reviewed: Array<string>;
  failed: Array<{ title: string; reason: string }>;
}

/**
 * The email a review would send, before it is sent (#2981): one group per kind of email in the selection, each with the
 * text it starts from and an example filled in for its first submission.
 */
export interface ReviewEmailPreview {
  groups: Array<{
    kind: ReviewEmailKind;
    label: string;
    count: number;
    subject: string;
    template: string;
    /** What the window needs to show the whole email as it will arrive, in Texas A&M's design (#3114). */
    design?: EmailDesign;
    example: { title: string; to: string; cc: string; values: Record<string, string> };
  }>;
  /** Those that get no email, with why: a final reminder's that already have a file or were not accepted (#3017). */
  skipped?: Array<SkippedSubmission>;
}

/** A submission that gets no email, by title, with why (#3017). */
export interface SkippedSubmission {
  title: string;
  reason: ReminderSkipReason;
}

/**
 * What sending the final reminder to several submissions did (#3017): the titles emailed, those skipped because they
 * already have a file or were not accepted, and each that failed, with why.
 */
export interface RemindManyResult {
  sent: Array<string>;
  skipped: Array<SkippedSubmission>;
  failed: Array<{ title: string; reason: string }>;
}

/** The longest email text a reviewer may send (#2981). */
const MAX_TEMPLATE = 20000;

/** The edited texts a review was given, by kind, after checking each is text of a sensible size (#2981). */
function checkedTemplates(templates: unknown): Partial<Record<ReviewEmailKind, string>> | undefined {
  if (templates === undefined || templates === null) {
    return undefined;
  }

  if (typeof templates !== 'object' || Array.isArray(templates)) {
    throw new BadRequestException('The email texts must be given by kind.');
  }

  const checked: Partial<Record<ReviewEmailKind, string>> = {};

  for (const kind of REVIEW_EMAIL_KINDS) {
    const text = (templates as Record<string, unknown>)[kind];

    if (text === undefined) {
      continue;
    }

    if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEMPLATE) {
      throw new BadRequestException(`The ${kind} email must be text, up to ${MAX_TEMPLATE} characters.`);
    }

    checked[kind] = text;
  }

  return checked;
}

/** How soon the same review decision again is taken as a repeated request and sends no second email (#3067). */
export const REPEAT_REVIEW_MINUTES = 10;

@Injectable()
export class UserSubmissionProvider extends BaseProvider<Submission> {
  constructor(
    @InjectRepository(Submission) public userSubmissionRepo: Repository<Submission>,
    @InjectRepository(SubmissionType) public submissionTypeRepo: Repository<SubmissionType>,
    @InjectRepository(GisdayEvent) private readonly events: Repository<GisdayEvent>,
    private readonly seasonService: SeasonService,
    private readonly contactService: ContactService,
    private readonly profiles: DashboardProfilesService,
    private readonly assets: AssetsService
  ) {
    super(userSubmissionRepo);
  }

  /**
   * Every submission of a season, each with who submitted it (#2799), for the admin list.
   */
  public async getSubmissionsForSeason(seasonGuid: string): Promise<Array<SubmissionWithSubmitter>> {
    const existingSeason = await this.seasonService.findOne({
      where: {
        guid: seasonGuid
      }
    });

    if (!existingSeason) {
      return [];
    }

    try {
      const submissions = await this.userSubmissionRepo.find({
        where: {
          season: { guid: existingSeason.guid }
        },
        // The list shows how many files each has (#2933).
        relations: { files: true }
      });

      return await this.withSubmitters(submissions);
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not retrieve user submissions.'));
    }
  }

  /**
   * Adds each submission's submitter from their Auth0 profile, read for every account at once and kept for a few
   * minutes, as the dashboards read them (#2925): a request per account, in turn, was most of the page's load time. An
   * account that cannot be read (deleted, or Auth0 management is not configured, as locally) leaves `submitter` null
   * rather than failing the list.
   */
  private async withSubmitters(submissions: Array<Submission>): Promise<Array<SubmissionWithSubmitter>> {
    const profiles = await this.profiles.profilesOf([...new Set(submissions.map((s) => s.accountGuid).filter(Boolean))]);

    return submissions.map((s) => {
      const profile = profiles.get(s.accountGuid);

      return Object.assign(s, { submitter: profile ? submitterOf(profile) : null });
    });
  }

  public async getSubmissionsForActiveSeason() {
    const season = await this.seasonService.findOneActive();

    return this.getSubmissionsForSeason(season.guid);
  }

  /**
   * The accepted posters of a season (the active one when none is named), for the public gallery (#2496).
   * Only a title, the authors' names, the poster's link and the year leave here: a submission also holds
   * its authors' emails and student ids, the owner's account and the reviewer's message.
   */
  public async getPosters(seasonGuid?: string): Promise<PosterDto[]> {
    let season: Pick<Season, 'guid' | 'year'> | null;

    try {
      season = seasonGuid
        ? await this.seasonService.findOne({ where: { guid: seasonGuid } })
        : await this.seasonService.findOneActive();
    } catch (err) {
      // A site with no active season yet has no posters; anything else is a real failure.
      if (err instanceof NotFoundException) {
        return [];
      }

      throw err;
    }

    if (!season) {
      return [];
    }

    const posters = await this.userSubmissionRepo.find({
      where: {
        season: { guid: season.guid },
        submissionType: PRESENTATION_SUBMISSION_TYPE.POSTER,
        // `reviewed` is not asked: the 2025 posters are marked accepted without it (#2496).
        acceptance: true
      },
      order: { title: 'ASC' }
    });

    return posters.map((poster) => ({
      title: poster.title,
      // An author with no name is null, as JSON has always given it.
      authors: (poster.participants ?? []).map((participant) => participant.name ?? null),
      link: poster.link,
      year: season.year
    }));
  }

  /**
   * Retrieves all submissions for the active season for a given user.
   */
  public async getUserPresentationsForActiveSeason(userGuid: string) {
    // With no active season, `findOneActive` answers 404 itself.
    const season = await this.seasonService.findOneActive();

    try {
      return this.userSubmissionRepo.find({
        where: {
          accountGuid: userGuid,
          season: { guid: season.guid }
        }
      });
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not retrieve user submissions.'));
    }
  }

  /**
   * Retrieves a single presentation for a given user.
   */
  public async getUserPresentation(submissionGuid: string, userGuid: string, requestorPermissions: Array<string> = []) {
    const presentation = await this.userSubmissionRepo.findOne({
      where: {
        guid: submissionGuid
      },
      // Its season says when its competition closes, which the page shows (#2934).
      relations: { season: true }
    });

    if (!presentation) {
      throw new NotFoundException('Presentation not found');
    }

    const requestor = { sub: userGuid, permissions: requestorPermissions };

    if (!isOwnerOrPermitted(requestor, presentation.accountGuid, 'read:competitions')) {
      throw new UnauthorizedException();
    }

    return presentation;
  }

  public async insertUserSubmission(accountGuid: string, submission: Partial<Submission> | undefined) {
    if (!submission || !accountGuid) {
      throw new InternalServerErrorException('Missing required parameters.');
    }

    // The deadline is that of the season it will be saved to: the one the body names, or the active one (#2934). So is
    // whether that season runs the competition at all (#2948).
    const season = await this._seasonFor(submission.season);

    refuseIfNotRunning(season, submission.submissionType);
    refuseIfClosed(season, submission.submissionType);

    const userSubmission = this.userSubmissionRepo.create({ ...submission, accountGuid });

    try {
      return this.userSubmissionRepo.save(userSubmission);
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not insert user submission.'));
    }
  }

  public async updateUserSubmission(
    submissionGuid: string,
    userGuid: string,
    submission: Partial<Submission>,
    requestorPermissions: Array<string> = [],
    /** The site the reviewer is on, which the review email names and links to (#2957). */
    host?: string
  ) {
    const { updated, sendReviewEmail } = await this._update(
      submissionGuid,
      userGuid,
      submission,
      requestorPermissions,
      host
    );

    // The decision stands whether or not the email goes: a reviewer's decision must not be lost to the mail server.
    sendReviewEmail?.().catch((err) => {
      Logger.error(`Error sending email to user: ${err.message}`, 'UserSubmissionProvider');
    });

    return updated;
  }

  /**
   * Approves or rejects each of the named submissions, as `updateUserSubmission` reviews one from Submit Review (#2958):
   * the decision recorded and the submitter emailed from the reviewer's site, one after another. A submission that
   * cannot be reviewed does not stop the rest; the result names it, by title, with why, as it does one that was reviewed
   * but whose email could not be sent.
   */
  public async reviewUserSubmissions(
    submissionGuids: Array<string> | undefined,
    userGuid: string,
    // As the request sent it, until checked here.
    review: {
      acceptance?: boolean;
      message?: string;
      templates?: Partial<Record<ReviewEmailKind, string>>;
      /** Who the emails are from, as the reviewer chose and the controller checked (#3100); the site without it. */
      sender?: EmailSender;
    },
    requestorPermissions: Array<string> = [],
    host?: string
  ): Promise<ReviewManyResult> {
    // The single review lets an owner through to edit their own; a review of many is a reviewer's alone.
    checkReviewerAndGuids(submissionGuids, requestorPermissions);

    if (typeof review.acceptance !== 'boolean') {
      throw new BadRequestException('Say whether the submissions are accepted.');
    }

    // The text the reviewer saw and approved (#2981); a kind not given keeps its own.
    const templates = checkedTemplates(review.templates);
    const result: ReviewManyResult = { reviewed: [], failed: [] };

    // Several at a time (#3067): one by one, a long send waited long enough to be repeated (#3065).
    const parts = await inParallel([...new Set(submissionGuids)], EMAIL_LANES, async (guid) => {
      const part: typeof result = { reviewed: [], failed: [] };

      let reviewed: Awaited<ReturnType<UserSubmissionProvider['_update']>>;

      try {
        // A new body each time: the review writes into the object it is given.
        reviewed = await this._update(
          guid,
          userGuid,
          { acceptance: review.acceptance, message: review.message } as Partial<Submission>,
          requestorPermissions,
          host,
          templates,
          review.sender
        );
      } catch (err) {
        Logger.error(`Could not review submission ${guid}: ${err.message}`, 'UserSubmissionProvider');
        part.failed.push({
          title: guid,
          reason: err instanceof NotFoundException ? 'it no longer exists' : 'the decision could not be saved'
        });
        return part;
      }

      const title = reviewed.submission.title || guid;

      part.reviewed.push(title);

      try {
        await reviewed.sendReviewEmail?.();
      } catch (err) {
        Logger.error(`Error sending email to user: ${err.message}`, 'UserSubmissionProvider');
        part.failed.push({ title, reason: 'reviewed, but the email could not be sent' });
      }

      return part;
    });

    result.reviewed.push(...parts.flatMap((p) => p.reviewed));
    result.failed.push(...parts.flatMap((p) => p.failed));

    return result;
  }

  /**
   * The email approving or rejecting the named submissions would send, for the reviewer to read and edit first (#2981).
   * Nothing is recorded or sent. Each kind of email in the selection is one group, in the order poster, presentation,
   * rejection, with the text it starts from and an example filled in for its first submission, as `reviewEmail` sends it.
   */
  public async previewReview(
    submissionGuids: Array<string> | undefined,
    // As the request sent it, until checked here.
    review: { acceptance?: boolean; message?: string },
    requestorPermissions: Array<string> = [],
    host?: string
  ): Promise<ReviewEmailPreview> {
    checkReviewerAndGuids(submissionGuids, requestorPermissions);

    const { acceptance } = review;

    if (typeof acceptance !== 'boolean') {
      throw new BadRequestException('Say whether the submissions are accepted.');
    }

    const { groups } = await this._preview(
      submissionGuids,
      (submission) => ({ kind: reviewEmailKind(acceptance, submission.submissionType) }),
      host,
      review.message
    );

    return { groups };
  }

  /**
   * The final reminder the named submissions would get (#3017), for the reviewer to read and edit first, as the review's
   * email is: one group per competition, with the text it starts from and an example for its first submission. A
   * submission that already has a file, or was not accepted, gets none, and is named in `skipped` with why. Nothing is
   * sent.
   */
  public async previewReminders(
    submissionGuids: Array<string> | undefined,
    requestorPermissions: Array<string> = [],
    host?: string
  ): Promise<ReviewEmailPreview> {
    checkReviewerAndGuids(submissionGuids, requestorPermissions);

    return this._preview(submissionGuids, reminderOf, host);
  }

  /**
   * Sends the final reminder to each of the named accepted submissions that has no file yet (#3017), to the same people and with
   * the same placeholders as the review's email, in the text the reviewer approved. Nothing about the submission is
   * recorded. One that cannot be emailed does not stop the rest; the result names it, with why.
   */
  public async remindUserSubmissions(
    submissionGuids: Array<string> | undefined,
    reminder: { templates?: Partial<Record<ReviewEmailKind, string>>; sender?: EmailSender },
    requestorPermissions: Array<string> = [],
    host?: string
  ): Promise<RemindManyResult> {
    checkReviewerAndGuids(submissionGuids, requestorPermissions);

    const templates = checkedTemplates(reminder.templates);
    // Who it is from (#3100), taken here: `reminder` names each submission's own below.
    const sender = reminder.sender;
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const result: RemindManyResult = { sent: [], skipped: [], failed: [] };

    // Several at a time (#3067): one by one, a long send waited long enough to be repeated (#3065).
    const parts = await inParallel([...new Set(submissionGuids)], EMAIL_LANES, async (guid) => {
      const part: typeof result = { sent: [], skipped: [], failed: [] };

      const submission = await this.userSubmissionRepo.findOne({
        where: { guid },
        relations: { season: { days: true }, files: true }
      });

      if (!submission) {
        part.failed.push({ title: guid, reason: 'it no longer exists' });
        return part;
      }

      const title = submission.title || guid;
      const reminder = reminderOf(submission);

      if ('skip' in reminder) {
        part.skipped.push({ title, reason: reminder.skip });
        return part;
      }

      const { kind } = reminder;

      try {
        const recipients = await this._recipientsOf(submission);
        const sessions = await this._sessionsOf(submission.season).catch(() => []);

        await this._sendEmail(submission, kind, site, templates?.[kind], recipients, sessions, sender);
        part.sent.push(title);
      } catch (err) {
        Logger.error(`Error sending a final reminder: ${err.message}`, 'UserSubmissionProvider');
        part.failed.push({ title, reason: 'the email could not be sent' });
      }

      return part;
    });

    result.sent.push(...parts.flatMap((p) => p.sent));
    result.skipped.push(...parts.flatMap((p) => p.skipped));
    result.failed.push(...parts.flatMap((p) => p.failed));

    return result;
  }

  /**
   * The email each of the named submissions would get, grouped by kind in `REVIEW_EMAIL_KINDS`'s order, with the text it
   * starts from and an example filled in for the first of each kind (#2981). `kindOf` says a submission's kind, or why it
   * gets none, and it is then named in `skipped` (#3017).
   */
  private async _preview(
    submissionGuids: Array<string>,
    kindOf: (submission: Submission) => { kind: ReviewEmailKind } | { skip: ReminderSkipReason },
    host?: string,
    message?: string
  ): Promise<ReviewEmailPreview> {
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const groups = new Map<ReviewEmailKind, ReviewEmailPreview['groups'][number]>();
    const skipped: Array<SkippedSubmission> = [];

    for (const guid of [...new Set(submissionGuids)]) {
      const submission = await this.userSubmissionRepo.findOne({
        where: { guid },
        relations: { season: { days: true }, files: true }
      });

      if (!submission) {
        continue;
      }

      const chosen = kindOf(submission);

      if ('skip' in chosen) {
        skipped.push({ title: submission.title || guid, reason: chosen.skip });
        continue;
      }

      const { kind } = chosen;

      const group = groups.get(kind);

      if (group) {
        group.count++;
        continue;
      }

      const { to, cc } = await this._recipientsOf(submission);

      groups.set(kind, {
        kind,
        label: reviewEmailKindLabel(kind),
        count: 1,
        subject: reviewEmailKindSubject(kind, site.name),
        template: reviewEmailTemplate(kind),
        // What the window needs to show the whole email as it will arrive (#3114).
        design: reviewEmailDesign(site.name, seasonDaysOf(submission.season)),
        example: {
          title: submission.title ?? '',
          to,
          cc: cc.join(', '),
          values: reviewEmailValues(
            { ...submission, message: message ?? submission.message },
            site,
            await this._sessionsOf(submission.season)
          )
        }
      });
    }

    return {
      groups: REVIEW_EMAIL_KINDS.flatMap((kind) => {
        const group = groups.get(kind);

        return group ? [group] : [];
      }),
      skipped
    };
  }

  /**
   * Sends one submission its email of `kind` (#2957, #3017): from the site, to its people, in `template` (the text the
   * reviewer approved) or the kind's own, with its placeholders filled in.
   */
  private _sendEmail(
    submission: Submission,
    kind: ReviewEmailKind,
    site: GisdaySite,
    template: string | undefined,
    recipients: { to: string; cc: Array<string> },
    sessions: Array<ReviewEmailSession>,
    /** Who it is from, as the reviewer chose (#3100); the site without it. */
    sender?: EmailSender
  ) {
    const text = fillReviewEmail(template ?? reviewEmailTemplate(kind), reviewEmailValues(submission, site, sessions));
    const subject = reviewEmailKindSubject(kind, site.name);
    const from = sender ?? siteSender(site.name);

    return this.contactService.sendMessage(
      {
        to: recipients.to,
        cc: recipients.cc.join(','),
        subject,
        text,
        // The Markdown as HTML (#3044), in Texas A&M's design on its site (#3114), beside the plain text.
        html: siteEmailHtml(text, {
          site,
          subject,
          from: from.from,
          design: reviewEmailDesign(site.name, seasonDaysOf(submission.season))
        }),
        ...from
      },
      true
    );
  }

  /**
   * Writes a submission's changes, and says how to send its review email when the change was a review. The single review
   * sends it without waiting; a review of many waits, to report any that did not go.
   */
  private async _update(
    submissionGuid: string,
    userGuid: string,
    submission: Partial<Submission>,
    requestorPermissions: Array<string>,
    host?: string,
    /** The texts the reviewer approved, by kind (#2981). */
    templates?: Partial<Record<ReviewEmailKind, string>>,
    /** Who its email is from, as the reviewer chose (#3100); the site without it. */
    sender?: EmailSender
  ) {
    const existingSubmission = await this.userSubmissionRepo.findOne({
      where: {
        guid: submissionGuid
      },
      relations: { season: true }
    });

    if (!existingSubmission) {
      throw new NotFoundException('Submission not found.');
    }

    const requestor = { sub: userGuid, permissions: requestorPermissions };

    if (!isOwnerOrPermitted(requestor, existingSubmission.accountGuid, 'update:competitions')) {
      throw new UnauthorizedException();
    }

    // An entrant's edits close with their competition (#2934), as does an edit that would move the submission into one
    // that has closed. Reviewers are not held to it: they review once submissions have closed.
    if (requestorPermissions.indexOf('update:competitions') === -1) {
      refuseIfClosed(existingSubmission.season, existingSubmission.submissionType);
      refuseIfClosed(existingSubmission.season, submission.submissionType);

      // A submission to a competition since turned off stays as it is and may be edited, but none may be moved into one
      // (#2948).
      if (submission.submissionType !== undefined && submission.submissionType !== existingSubmission.submissionType) {
        refuseIfNotRunning(existingSubmission.season, submission.submissionType);
      }

      // Nor may an entrant move it to another season, whose deadline would then be the one that counts.
      delete submission.season;
    }

    // The row is written from `submission` -- the caller's request body -- so anything that must
    // not be caller-settable has to be removed from *that* object. The guid is dropped in every
    // case: the row to update is already identified by `submissionGuid`, and letting the body
    // carry one would let a caller retarget the write.
    delete submission.guid;

    let shouldEmail = false;

    // Only a reviewer may touch the review fields. This previously stripped them from
    // `existingSubmission`, which is never written, and only inside this branch -- so an entrant
    // without the permission skipped it entirely and could approve their own submission by
    // including `acceptance` in the PATCH body.
    if (requestorPermissions.indexOf('update:competitions') > -1) {
      if (submission.acceptance !== undefined) {
        // The same decision again within minutes is a repeated request, not a new review, so it emails no one twice
        // (#3067): on 15 November 2026 a bulk send reached the API twice, 30 seconds apart (#3065).
        const repeat =
          existingSubmission.reviewed === true &&
          existingSubmission.acceptance === submission.acceptance &&
          Date.now() - new Date(existingSubmission.updated).getTime() < REPEAT_REVIEW_MINUTES * 60 * 1000;

        existingSubmission.reviewed = true;
        existingSubmission.acceptance = submission.acceptance;
        existingSubmission.message = submission.message ?? null;
        submission.reviewed = true;
        shouldEmail = !repeat;
      }
    } else {
      delete submission.acceptance;
      delete submission.message;
      delete submission.reviewed;
    }

    try {
      const updated = await this.userSubmissionRepo.update(submissionGuid, submission);
      // Who it goes to and the season's sessions are read here, before the review returns, so the send itself is all a
      // single review leaves to finish after answering. A sessions lookup that fails leaves the email without its links.
      const recipients = shouldEmail ? await this._recipientsOf(existingSubmission) : null;
      const sessions = shouldEmail ? await this._sessionsOf(existingSubmission.season).catch(() => []) : [];
      const kind = reviewEmailKind(existingSubmission.acceptance, existingSubmission.submissionType);
      // Recipients are read only when it emails.
      const sendReviewEmail = recipients
        ? async () =>
            this._sendEmail(
              existingSubmission,
              kind,
              gisdaySite(process.env.GISDAY_SITE, host),
              templates?.[kind],
              recipients,
              sessions,
              sender
            )
        : null;

      return { updated, submission: existingSubmission, sendReviewEmail };
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not update user submission.'));
    }
  }

  /**
   * Deletes each of the named submissions, with their files, as `deleteUserSubmission` deletes one (#2992). Only a
   * reviewer may delete several; every id must be a submission's.
   */
  public async deleteUserSubmissions(
    submissionGuids: Array<string>,
    accountGuid: string,
    requestorPermissions: Array<string> = []
  ) {
    if (!requestorPermissions.includes('delete:competitions')) {
      throw new ForbiddenException();
    }

    const guids = [...new Set(submissionGuids.map((guid) => `${guid}`.trim()).filter(Boolean))];

    if (guids.length === 0 || guids.some((guid) => !GUID.test(guid))) {
      throw new BadRequestException('Name each submission by its id.');
    }

    for (const guid of guids) {
      await this.deleteUserSubmission(guid, accountGuid, requestorPermissions);
    }

    return { deleted: guids.length };
  }

  public async deleteUserSubmission(submissionGuid: string, accountGuid: string, requestorPermissions: Array<string> = []) {
    const submission = await this.userSubmissionRepo.findOne({
      where: {
        guid: submissionGuid
      },
      relations: { files: true }
    });

    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    const requestor = { sub: accountGuid, permissions: requestorPermissions };

    if (!isOwnerOrPermitted(requestor, submission.accountGuid, 'delete:competitions')) {
      throw new UnauthorizedException();
    }

    try {
      // Its file rows go with it (ON DELETE CASCADE); the files themselves are removed once that has committed (#2933).
      const deleted = await this.userSubmissionRepo.delete(submissionGuid);

      await this.assets.deleteAssetFiles(submission.files ?? []);

      return deleted;
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not delete user submission.'));
    }
  }

  /**
   * The sessions of a submission's season, with their day and place, for the email's links to the finalist's own session
   * and the awards session (#2985). None when it has no season.
   */
  private async _sessionsOf(season: Partial<Season> | null | undefined): Promise<Array<GisdayEvent>> {
    if (!season?.guid) {
      return [];
    }

    return this.events.find({ where: { season: { guid: season.guid } }, relations: { day: true, location: true } });
  }

  /**
   * Who a review email goes to (#2990): the submitter's own account address, from Auth0, and the other people on the
   * submission copied, each once. The typed first address is used only when the account has none. Typed, the
   * submitter's address had been a test address or one no directory knew, and the email went there.
   */
  private async _recipientsOf(
    submission: Pick<Submission, 'accountGuid' | 'participants'>
  ): Promise<{ to: string; cc: Array<string> }> {
    const typed = (submission.participants ?? []).map((p) => `${p.email ?? ''}`.trim()).filter(Boolean);
    let account = '';

    try {
      const profiles = submission.accountGuid ? await this.profiles.profilesOf([submission.accountGuid]) : null;

      // Auth0's profile type does not declare `email`, though every account carries one.
      account = `${(profiles?.get(submission.accountGuid) as { email?: string } | null)?.email ?? ''}`.trim();
    } catch (err) {
      // The email still goes, to what was typed, if Auth0 cannot be read.
      Logger.warn(`Could not read the submitter's account for a review email: ${err.message}`, 'UserSubmissionProvider');
    }

    // The first row is the submitter: with their account's address known, what they typed for themselves is not copied.
    const to = account || typed[0] || '';
    const others = account ? (submission.participants ?? []).slice(1).map((p) => `${p.email ?? ''}`.trim()) : typed.slice(1);
    // Each address once, as first typed, ignoring case; and never the address it goes to.
    const cc: Array<string> = [];

    for (const email of others.filter(Boolean)) {
      if (email.toLowerCase() !== to.toLowerCase() && !cc.some((kept) => kept.toLowerCase() === email.toLowerCase())) {
        cc.push(email);
      }
    }

    return { to, cc };
  }

  /**
   * The season a new submission is saved to: the one the body names, by its guid or as an object with one, or the
   * active one when it names none.
   */
  private async _seasonFor(named: Partial<Season> | string | null | undefined): Promise<Partial<Season> | null> {
    const guid = typeof named === 'string' ? named : named?.guid;

    if (guid) {
      return this.seasonService.findOne({ where: { guid } });
    }

    // A site with no active season has no deadline to hold it to.
    try {
      return await this.seasonService.findOneActive();
    } catch (err) {
      if (err instanceof NotFoundException) {
        return null;
      }

      throw err;
    }
  }
}

/** Refuses a submission to a research competition the season does not run (#2948). */
function refuseIfNotRunning(season: Partial<Season> | null | undefined, submissionType: unknown): void {
  if (isDeadlineCompetition(submissionType) && !runsCompetition(season, submissionType)) {
    throw new BadRequestException(notRunningMessage(submissionType));
  }
}

/** A submission's final reminder (#3017), or why it gets none: not accepted, or a file already. */
function reminderOf(submission: Submission): { kind: ReviewEmailKind } | { skip: ReminderSkipReason } {
  const skip = reminderSkipReason(submission);

  return skip ? { skip } : { kind: reminderEmailKind(submission.submissionType) };
}

/** Refuses an action on several submissions to anyone but a reviewer, or one not naming each submission by its id. */
function checkReviewerAndGuids(
  submissionGuids: unknown,
  requestorPermissions: Array<string>
): asserts submissionGuids is Array<string> {
  if (!requestorPermissions.includes('update:competitions')) {
    throw new ForbiddenException();
  }

  if (!Array.isArray(submissionGuids) || submissionGuids.length === 0) {
    throw new BadRequestException('No submissions were named.');
  }

  if (submissionGuids.some((guid) => typeof guid !== 'string' || !GUID.test(guid))) {
    throw new BadRequestException('Name each submission by its id.');
  }
}

/** Refuses a request to a competition whose submissions have closed (#2934, #2962). */
function refuseIfClosed(season: Partial<Season> | null | undefined, submissionType: unknown): void {
  const at = closedAt(season, submissionType, 'submissions');

  if (at && isDeadlineCompetition(submissionType)) {
    throw new ForbiddenException(closedMessage(submissionType, 'submissions', at));
  }
}

/** The review email's subject, naming the site and the decision (#2957). */
export function reviewSubject(submission: Pick<Submission, 'acceptance'>, site: Pick<GisdaySite, 'name'>): string {
  return reviewEmailSubject(submission.acceptance, site.name);
}

/**
 * The email a submitter gets when their submission is reviewed (#2957): a poster finalist's (#2980), a presenter's or a
 * rejection, on the site the reviewer is on. `template` is the text the reviewer approved (#2981); without it, the kind's
 * own. Its placeholders are filled in for this submission.
 */
export function reviewEmail(
  submission: Pick<Submission, 'title' | 'message' | 'acceptance' | 'submissionType' | 'participants'> & {
    season?: Partial<Season> | null;
    classificationType?: string | null;
  },
  site: Pick<GisdaySite, 'name' | 'address'>,
  template?: string,
  /** The season's sessions, for the finalist's own and the awards session (#2985). */
  sessions?: Array<ReviewEmailSession>
): string {
  const text = template ?? reviewEmailTemplate(reviewEmailKind(submission.acceptance, submission.submissionType));

  return fillReviewEmail(text, reviewEmailValues(submission, site, sessions));
}
