import {
  BadRequestException,
  ForbiddenException,
  HttpException,
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
  GisdaySite,
  ReviewEmailKind,
  fillReviewEmail,
  gisdaySite,
  reviewEmailKind,
  reviewEmailKindLabel,
  reviewEmailSubject,
  reviewEmailTemplate,
  reviewEmailValues,
  ReviewEmailSession
} from '@tamu-gisc/gisday/common';
import { closedAt, closedMessage, isDeadlineCompetition } from '@tamu-gisc/gisday/common';

import {
  Event as GisdayEvent,
  SubmissionType,
  Submission,
  Season,
  PRESENTATION_SUBMISSION_TYPE
} from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { senderAs } from '../_base/site-of-request';
import { SeasonService } from '../season/season.service';
import { ContactService } from '../contact/contact.service';
import { PosterDto } from './dto/poster.dto';
import { SubmissionWithSubmitter, submitterOf } from './dto/submission-submitter.dto';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { AssetsService } from '../assets/assets.service';

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
    example: { title: string; to: string; cc: string; values: Record<string, string> };
  }>;
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

  for (const kind of ['poster', 'presentation', 'rejection'] as Array<ReviewEmailKind>) {
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
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not retrieve user submissions.');
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
    let season: Partial<Season> | null;

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
      authors: (poster.participants ?? []).map((participant) => participant.name),
      link: poster.link,
      year: season.year
    }));
  }

  /**
   * Retrieves all submissions for the active season for a given user.
   */
  public async getUserPresentationsForActiveSeason(userGuid: string) {
    const season = await this.seasonService.findOneActive();

    if (!season) {
      return [];
    }

    try {
      return this.userSubmissionRepo.find({
        where: {
          accountGuid: userGuid,
          season: { guid: season.guid }
        }
      });
    } catch (err) {
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not retrieve user submissions.');
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

  public async insertUserSubmission(accountGuid: string, submission: Partial<Submission>) {
    if (!submission || !accountGuid) {
      throw new InternalServerErrorException('Missing required parameters.');
    }

    // The deadline is that of the season it will be saved to: the one the body names, or the active one (#2934).
    refuseIfClosed(await this._seasonFor(submission.season), submission.submissionType);

    const userSubmission = this.userSubmissionRepo.create({ ...submission, accountGuid });

    try {
      return this.userSubmissionRepo.save(userSubmission);
    } catch (err) {
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not insert user submission.');
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
    submissionGuids: Array<string>,
    userGuid: string,
    review: { acceptance: boolean; message?: string; templates?: Partial<Record<ReviewEmailKind, string>> },
    requestorPermissions: Array<string> = [],
    host?: string
  ): Promise<ReviewManyResult> {
    // The single review lets an owner through to edit their own; a review of many is a reviewer's alone.
    if (!requestorPermissions.includes('update:competitions')) {
      throw new ForbiddenException();
    }

    if (!Array.isArray(submissionGuids) || submissionGuids.length === 0) {
      throw new BadRequestException('No submissions were named.');
    }

    if (submissionGuids.some((guid) => typeof guid !== 'string' || !GUID.test(guid))) {
      throw new BadRequestException('Name each submission by its id.');
    }

    if (typeof review?.acceptance !== 'boolean') {
      throw new BadRequestException('Say whether the submissions are accepted.');
    }

    // The text the reviewer saw and approved (#2981); a kind not given keeps its own.
    const templates = checkedTemplates(review.templates);
    const result: ReviewManyResult = { reviewed: [], failed: [] };

    for (const guid of [...new Set(submissionGuids)]) {
      let reviewed: Awaited<ReturnType<UserSubmissionProvider['_update']>>;

      try {
        // A new body each time: the review writes into the object it is given.
        reviewed = await this._update(
          guid,
          userGuid,
          { acceptance: review.acceptance, message: review.message } as Partial<Submission>,
          requestorPermissions,
          host,
          templates
        );
      } catch (err) {
        Logger.error(`Could not review submission ${guid}: ${err.message}`, 'UserSubmissionProvider');
        result.failed.push({
          title: guid,
          reason: err instanceof NotFoundException ? 'it no longer exists' : 'the decision could not be saved'
        });
        continue;
      }

      const title = reviewed.submission.title || guid;

      result.reviewed.push(title);

      try {
        await reviewed.sendReviewEmail?.();
      } catch (err) {
        Logger.error(`Error sending email to user: ${err.message}`, 'UserSubmissionProvider');
        result.failed.push({ title, reason: 'reviewed, but the email could not be sent' });
      }
    }

    return result;
  }

  /**
   * The email approving or rejecting the named submissions would send, for the reviewer to read and edit first (#2981).
   * Nothing is recorded or sent. Each kind of email in the selection is one group, in the order poster, presentation,
   * rejection, with the text it starts from and an example filled in for its first submission, as `reviewEmail` sends it.
   */
  public async previewReview(
    submissionGuids: Array<string>,
    review: { acceptance: boolean; message?: string },
    requestorPermissions: Array<string> = [],
    host?: string
  ): Promise<ReviewEmailPreview> {
    if (!requestorPermissions.includes('update:competitions')) {
      throw new ForbiddenException();
    }

    if (!Array.isArray(submissionGuids) || submissionGuids.length === 0) {
      throw new BadRequestException('No submissions were named.');
    }

    if (submissionGuids.some((guid) => typeof guid !== 'string' || !GUID.test(guid))) {
      throw new BadRequestException('Name each submission by its id.');
    }

    if (typeof review?.acceptance !== 'boolean') {
      throw new BadRequestException('Say whether the submissions are accepted.');
    }

    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const groups = new Map<ReviewEmailKind, ReviewEmailPreview['groups'][number]>();

    for (const guid of [...new Set(submissionGuids)]) {
      const submission = await this.userSubmissionRepo.findOne({ where: { guid }, relations: { season: true } });

      if (!submission) {
        continue;
      }

      const kind = reviewEmailKind(review.acceptance, submission.submissionType);
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
        subject: reviewEmailSubject(review.acceptance, site.name),
        template: reviewEmailTemplate(kind),
        example: {
          title: submission.title ?? '',
          to,
          cc: cc.join(', '),
          values: reviewEmailValues(
            { ...submission, message: review.message ?? submission.message },
            site,
            await this._sessionsOf(submission.season)
          )
        }
      });
    }

    const order: Array<ReviewEmailKind> = ['poster', 'presentation', 'rejection'];

    return { groups: order.filter((kind) => groups.has(kind)).map((kind) => groups.get(kind)) };
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
    templates?: Partial<Record<ReviewEmailKind, string>>
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
        existingSubmission.reviewed = true;
        existingSubmission.acceptance = submission.acceptance;
        existingSubmission.message = submission.message;
        submission.reviewed = true;
        shouldEmail = true;
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
      const sendReviewEmail = shouldEmail
        ? async () => {
            const { to, cc } = recipients;
            const site = gisdaySite(process.env.GISDAY_SITE, host);

            // Send email to user
            return this.contactService.sendMessage(
              {
                to,
                cc: cc.join(','),
                subject: reviewSubject(existingSubmission, site),
                from: senderAs(site.name, process.env.MAILROOM_FROM),
                text: reviewEmail(
                  existingSubmission,
                  site,
                  templates?.[reviewEmailKind(existingSubmission.acceptance, existingSubmission.submissionType)],
                  sessions
                ),
                replyTo: process.env.MAILROOM_TO
              },
              true
            );
          }
        : null;

      return { updated, submission: existingSubmission, sendReviewEmail };
    } catch (err) {
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not update user submission.');
    }
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
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not delete user submission.');
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
    const typed = (submission.participants ?? []).map((p) => `${p?.email ?? ''}`.trim()).filter(Boolean);
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
    const others = account
      ? (submission.participants ?? []).slice(1).map((p) => `${p?.email ?? ''}`.trim())
      : typed.slice(1);
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
  private async _seasonFor(named: Partial<Season> | string | undefined): Promise<Partial<Season> | null> {
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
