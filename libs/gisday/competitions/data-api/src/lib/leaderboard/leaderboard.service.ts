import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { ManagementService } from '@tamu-gisc/common/nest/auth';
import { distanceInMetres } from '@tamu-gisc/common/utils/geometry';
import { hasNameWords, namesMatch } from '@tamu-gisc/common/utils/string';

import {
  CompetitionSeason,
  CompetitionSubmission,
  ICompetitionSeasonFormOption,
  SubmissionLocation,
  SubmissionMedia
} from '../entities/all.entities';
import { BaseService } from '../_base/base.service';
import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';
import { activeCompetitionSeason } from '../season/active-season';

/**
 * Points for a submission of something nobody had submitted before in the season (#1781).
 */
export const NEW_FIND_POINTS = 2;

/**
 * Points for a submission of something already submitted, by anyone, the submitter included.
 */
export const ALREADY_SUBMITTED_POINTS = 1;

/**
 * A submission this close to an earlier new find with the same type is taken to be of the same thing.
 * It allows for phone GPS error; two different things closer than this are scored as one. A type can set
 * its own distance in the form (`sameThingMetres`), as plaques do (#2162).
 */
export const SAME_THING_DISTANCE_METRES = 15;

/**
 * Words a memorial plaque, or someone typing its name, puts around the name ("In loving memory of", "Dr.",
 * "Class of"), which say nothing about whose name it is. Names are compared without them, and a name made
 * only of them is no name (#2162).
 */
export const MEMORIAL_NAME_WORDING: ReadonlySet<string> = new Set([
  'in',
  'loving',
  'memory',
  'of',
  'the',
  'and',
  'to',
  'dedicated',
  'honor',
  'honour',
  'memorial',
  'class',
  'dr',
  'mr',
  'mrs',
  'ms'
]);

interface LeaderboardCache {
  data: Array<{ identity: string; guid: string; points: number }>;
  timestamp: number;
}

/**
 * How long a participant's name on the board is kept before Auth0 is asked again (#3168). Every view of the board names
 * every participant, and an email rarely changes during a competition.
 */
const IDENTITY_TTL = 60 * 60 * 1000;

/**
 * An email as the leaderboard shows it (#3168): the first few letters, then `****@` and the domain, so
 * `jsmith2026@tamu.edu` reads `jsm****@tamu.edu`. At most three letters, and fewer for a short name, so at least two stay
 * hidden; always four asterisks, so the length is not given away either. Anything that is not an email shows as `****`.
 */
export function maskEmail(email: string | null | undefined): string {
  const at = email?.lastIndexOf('@') ?? -1;

  if (!email || at < 1) {
    return '****';
  }

  const local = email.slice(0, at);
  const shown = Math.min(3, Math.max(1, local.length - 2));

  return `${local.slice(0, shown)}****${email.slice(at)}`;
}

@Injectable()
export class LeaderboardService extends BaseService<CompetitionSubmission> {
  private leaderboardCache: Map<string, LeaderboardCache> = new Map();
  private readonly CACHE_TTL = 60000; // 60 seconds in milliseconds
  // Each participant's masked email, by user guid, until when it is kept (#3168). A lookup that failed is kept as
  // `undefined` for as long as the board itself is, so an account Auth0 cannot find is not asked for on every view.
  private identityCache: Map<string, { identity: string | undefined; expires: number }> = new Map();

  constructor(
    @InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(SubmissionLocation) private locationRepo: Repository<SubmissionLocation>,
    @InjectRepository(SubmissionMedia) private mediaRepo: Repository<SubmissionMedia>,
    @InjectRepository(CompetitionSeason) private compSeasonRepo: Repository<CompetitionSeason>,
    @InjectRepository(Season) private seasonRepo: Repository<Season>,
    private readonly ms: ManagementService
  ) {
    super(submissionRepo);
  }

  /**
   * The active season's leaderboard, each participant named by their masked email (`maskEmail`). Everyone sees the same
   * board, admins included, so it can be shown to a room or shared without giving anyone's email away (#3168).
   */
  public async getLeaderBoardItemsForActiveSeason() {
    const competitionSeason = await activeCompetitionSeason(this.seasonRepo, this.compSeasonRepo, {
      form: true,
      season: true
    });

    // Check cache
    const cacheKey = competitionSeason.guid;
    const cached = this.leaderboardCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return this.resolveIdentities(cached.data);
    }

    // Calculate leaderboard with point system
    const leaderboardData = await this.calculateLeaderboard(competitionSeason);

    // Cache the results
    this.leaderboardCache.set(cacheKey, {
      data: leaderboardData,
      timestamp: now
    });

    return this.resolveIdentities(leaderboardData);
  }

  /**
   * The leaderboard of the competition season with this guid, scored as the active one is.
   */
  public async getLeaderBoardItemsForSeason(competitionSeasonGuid: string) {
    const competitionSeason = await this.compSeasonRepo.findOne({
      where: { guid: competitionSeasonGuid },
      relations: { form: true, season: true }
    });

    if (!competitionSeason) {
      throw new NotFoundException('No competition season found.');
    }

    return this.resolveIdentities(await this.calculateLeaderboard(competitionSeason));
  }

  /**
   * Scores a season's submissions (#1781): the first submission of a thing scores `NEW_FIND_POINTS`,
   * and every later submission of it, by anyone, `ALREADY_SUBMITTED_POINTS`. A later submission is of
   * the same thing when it is within `SAME_THING_DISTANCE_METRES` of an earlier new find and gave the
   * same answer to the form's type question (its discriminator question; with none, distance alone
   * decides). Only new finds are compared with, so a run of submissions a few metres apart does not
   * chain into one thing. Discarded submissions neither score nor count as earlier ones. A submission
   * with no usable location cannot be shown to be new, so it scores `ALREADY_SUBMITTED_POINTS`.
   *
   * The type's answer in the form can change that (#2162): its own distance (`sameThingMetres`); a name
   * question (`nameAttribute`), so that finds within that distance are the same thing only when their
   * names match; and the previous season's answers it continues (`earlier`), so that a thing found then,
   * within `earlier.metres`, is already found now.
   *
   * Whatever the names, a participant's own earlier submission of the same type within the type's distance
   * makes theirs a repeat, so nobody scores twice at one plaque by typing its name differently.
   *
   * Returns every submission of the season, oldest first, with its points, or null for one that does not count
   * (discarded, or outside the scoring window). The leaderboard sums them; the VGI dashboard counts its new finds and
   * repeats from them (#2894), so both score alike.
   */
  public async scoreSubmissions(
    competitionSeason: CompetitionSeason
  ): Promise<Array<{ submission: CompetitionSubmission; points: number | null }>> {
    const typeQuestion = competitionSeason.form?.model.find((q) => q.isDiscriminator === true);
    const typeAttribute = typeQuestion?.attribute;
    const settingsFor = (type: unknown): ICompetitionSeasonFormOption | undefined =>
      typeQuestion?.options?.find((option) => option.value === type);

    // Oldest first, so each submission is compared only with those made before it; the guid orders two
    // made in the same instant, so the same submissions always score the same.
    const submissions = await this.submissionRepo.find({
      where: {
        season: { guid: competitionSeason.guid }
      },
      relations: { validationStatus: true, location: true },
      order: { created: 'ASC', guid: 'ASC' }
    });

    const { finds: earlierFinds } = await previousSeasonFinds(this.compSeasonRepo, this.submissionRepo, competitionSeason);
    const newFinds: Array<{ location: { latitude: number; longitude: number }; type: unknown; name: unknown }> = [];
    const submittedBy = new Map<string, Array<{ location: { latitude: number; longitude: number }; type: unknown }>>();
    const scored = new Map<CompetitionSubmission, number>();

    // Only submissions made inside the season's scoring window count, and the rest are not earlier finds
    // either (#2474).
    const inWindow = (submission: CompetitionSubmission) =>
      isInScoringWindow(submission.created, competitionSeason.scoringOpensAt, competitionSeason.scoringClosesAt);

    for (const submission of submissions.filter(counts).filter(inWindow)) {
      const location = usableLocation(submission.location);
      const type = typeAttribute ? submission.value?.[typeAttribute] : undefined;
      const settings = settingsFor(type);
      const name = settings?.nameAttribute ? submission.value?.[settings.nameAttribute] : undefined;
      const earlier = settings?.earlier;
      let points = ALREADY_SUBMITTED_POINTS;

      const foundBefore =
        location !== undefined &&
        earlier !== undefined &&
        earlierFinds.some(
          (find) =>
            earlier.values.includes(find.type as string) && distanceInMetres(find.location, location) <= earlier.metres
        );

      const foundThisSeason =
        location !== undefined &&
        newFinds.some((find) => find.type === type && isSameThing(find, { location, name }, settings));

      // The participant's own earlier submission of this type nearby, whatever name either gave (#2424).
      const ownRepeat =
        location !== undefined &&
        (submittedBy.get(submission.userGuid) ?? []).some(
          (earlier) => earlier.type === type && isOwnRepeat(earlier, { location }, settings)
        );

      if (location && !foundBefore && !foundThisSeason && !ownRepeat) {
        points = NEW_FIND_POINTS;
        newFinds.push({ location, type, name });
      }

      if (location) {
        submittedBy.set(submission.userGuid, [...(submittedBy.get(submission.userGuid) ?? []), { location, type }]);
      }

      scored.set(submission, points);
    }

    return submissions.map((submission) => ({ submission, points: scored.get(submission) ?? null }));
  }

  /**
   * Each participant of a GIS Day season's competition by account, with their points, in the leaderboard's order, highest
   * first; none when the season has no competition. The Winners page offers them for the trail challenge's places (#3243).
   */
  public async rankedForSeason(seasonGuid: string): Promise<Array<{ account: string; points: number }>> {
    const competitionSeason = await this.compSeasonRepo.findOne({
      where: { season: { guid: seasonGuid } },
      relations: { form: true, season: true }
    });

    if (!competitionSeason) {
      return [];
    }

    return (await this.calculateLeaderboard(competitionSeason)).map(({ guid, points }) => ({ account: guid, points }));
  }

  /** Each participant's points, highest first: their submissions' scores summed (`scoreSubmissions`). */
  private async calculateLeaderboard(
    competitionSeason: CompetitionSeason
  ): Promise<Array<{ identity: string; guid: string; points: number }>> {
    const userPointsMap = new Map<string, number>();

    for (const { submission, points } of await this.scoreSubmissions(competitionSeason)) {
      if (points !== null) {
        userPointsMap.set(submission.userGuid, (userPointsMap.get(submission.userGuid) || 0) + points);
      }
    }

    // Convert map to array and sort by points descending
    const leaderboard = Array.from(userPointsMap.entries())
      .map(([guid, points]) => ({
        identity: guid.substring(guid.length - 4), // Last 4 characters
        guid,
        points
      }))
      .sort((a, b) => b.points - a.points);

    return leaderboard;
  }

  /**
   * Names each participant by their masked email (`maskEmail`), looked up in Auth0 at most once an hour each. A participant
   * Auth0 cannot find keeps the last 4 characters of their user guid, as everyone's identity was before (#3168).
   */
  private async resolveIdentities(
    leaderboardData: Array<{ identity: string; guid: string; points: number }>
  ): Promise<Array<{ identity: string; guid: string; points: number }>> {
    const resolved: Array<{ identity: string; guid: string; points: number }> = [];

    for (const row of leaderboardData) {
      resolved.push({ ...row, identity: (await this.maskedIdentity(row.guid)) ?? row.identity });
    }

    return resolved;
  }

  private async maskedIdentity(guid: string): Promise<string | undefined> {
    const now = Date.now();
    const cached = this.identityCache.get(guid);

    if (cached && now < cached.expires) {
      return cached.identity;
    }

    try {
      const user = await this.ms.getUserMetadata(guid, undefined, true);
      const identity = maskEmail(user.user_info.email);

      this.identityCache.set(guid, { identity, expires: now + IDENTITY_TTL });

      return identity;
    } catch {
      this.identityCache.set(guid, { identity: undefined, expires: now + this.CACHE_TTL });

      return undefined;
    }
  }
}

/**
 * The located, not discarded submissions of the competition season before this one, with their answer
 * to that season's type question and that season's year, when this season's form continues it
 * (`earlier`, #2162); none otherwise. Scoring counts them as already found, and the competition map
 * shows them (#2166).
 */
export async function previousSeasonFinds(
  compSeasonRepo: Repository<CompetitionSeason>,
  submissionRepo: Repository<CompetitionSubmission>,
  competitionSeason: CompetitionSeason
): Promise<{ year?: number; finds: Array<{ location: { latitude: number; longitude: number }; type: unknown }> }> {
  const year = competitionSeason.season?.year;
  const comparesWithEarlier = competitionSeason.form?.model.some((q) => q.options?.some((option) => option.earlier));

  if (!year || !comparesWithEarlier) {
    return { finds: [] };
  }

  const seasons = await compSeasonRepo.find({ relations: { season: true, form: true } });
  const withoutYear = seasons.filter((candidate) => !candidate.season?.year).length;

  if (withoutYear > 0) {
    Logger.warn(
      `${withoutYear} competition season(s) have no season year, so cannot be the one before ${year}.`,
      'LeaderboardService'
    );
  }

  // The latest season before this one, with its year, which a season deleted from GIS Day no longer has; undefined when
  // there is none.
  const previous = seasons
    .flatMap((candidate) => {
      const candidateYear = candidate.season?.year;

      return candidateYear != null && candidateYear < year ? [{ competitionSeason: candidate, year: candidateYear }] : [];
    })
    .sort((a, b) => b.year - a.year)
    .at(0);

  // Without the previous season, every find it had scores as new: say so, so the gap is noticed (#2424 review).
  if (!previous) {
    Logger.warn(
      `Competition season ${competitionSeason.guid} (${year}) continues an earlier season, but no competition season with an earlier year was found. Nothing found then counts as already found.`,
      'LeaderboardService'
    );

    return { finds: [] };
  }

  const typeAttribute = previous.competitionSeason.form?.model.find((q) => q.isDiscriminator === true)?.attribute;

  if (!typeAttribute) {
    Logger.warn(
      `The ${previous.year} competition season's form has no type question, so none of its finds can count as already found in ${year}.`,
      'LeaderboardService'
    );

    return { finds: [] };
  }
  // Oldest first, so the map counts each thing at the place it was first found (#2625); scoring does not
  // depend on the order.
  const submissions = await submissionRepo.find({
    where: { season: { guid: previous.competitionSeason.guid } },
    relations: { validationStatus: true, location: true },
    order: { created: 'ASC', guid: 'ASC' }
  });

  return {
    year: previous.year,
    finds: submissions.filter(counts).flatMap((submission) => {
      const location = usableLocation(submission.location);

      return location ? [{ location, type: typeAttribute ? submission.value?.[typeAttribute] : undefined }] : [];
    })
  };
}

/**
 * Whether a later find of a type is of the same thing as an earlier find of that type: within the
 * type's `sameThingMetres` (`SAME_THING_DISTANCE_METRES` without it) and, when the type has a name
 * question and both finds have a name, with matching names (#2162).
 */
export function isSameThing(
  earlier: { location: { latitude: number; longitude: number }; name?: unknown },
  later: { location: { latitude: number; longitude: number }; name?: unknown },
  settings?: ICompetitionSeasonFormOption
): boolean {
  return (
    distanceInMetres(earlier.location, later.location) <= (settings?.sameThingMetres ?? SAME_THING_DISTANCE_METRES) &&
    (!settings?.nameAttribute ||
      !hasName(earlier.name) ||
      !hasName(later.name) ||
      namesMatch(earlier.name as string, later.name as string, MEMORIAL_NAME_WORDING))
  );
}

/**
 * Whether a participant's later submission of a type repeats their own earlier one of that type: within the
 * type's `sameThingMetres`, whatever names either gave, as Dan decided on 26 October (#2424). Scoring gives it
 * `ALREADY_SUBMITTED_POINTS`, and the automatic review leaves it for a person (#2164).
 */
export function isOwnRepeat(
  earlier: { location: { latitude: number; longitude: number } },
  later: { location: { latitude: number; longitude: number } },
  settings?: ICompetitionSeasonFormOption
): boolean {
  return distanceInMetres(earlier.location, later.location) <= (settings?.sameThingMetres ?? SAME_THING_DISTANCE_METRES);
}

/**
 * Whether a submission made at `created` counts for a season whose scoring window is `opensAt` to
 * `closesAt` (#2474): at or after the opening, and before the closing. An empty side has no limit. The
 * database returns the moments as text or as dates.
 */
export function isInScoringWindow(
  created: Date | string,
  opensAt?: Date | string | null,
  closesAt?: Date | string | null
): boolean {
  const made = new Date(created).getTime();

  return (!opensAt || made >= new Date(opensAt).getTime()) && (!closesAt || made < new Date(closesAt).getTime());
}

/**
 * Whether a submission counts towards scoring: anything not discarded.
 */
export function counts(submission: Pick<CompetitionSubmission, 'validationStatus'>): boolean {
  return (
    !submission.validationStatus ||
    submission.validationStatus.status === COMPETITION_VALIDATION_STATUS.unverified ||
    submission.validationStatus.status === COMPETITION_VALIDATION_STATUS.verified
  );
}

/**
 * Whether a typed name is a name: it has words left once a plaque's wording is set aside, as
 * `namesMatch` compares them (#2424). Scoring and the automatic review's name check both use it.
 */
export function hasName(name: unknown): boolean {
  return hasNameWords(name, MEMORIAL_NAME_WORDING);
}

/**
 * A submission's latitude and longitude as numbers, or `undefined` when it has none. The database
 * returns decimals as text, and a submission sent with no location was saved at 0, 0.
 */
export function usableLocation(
  location: Pick<SubmissionLocation, 'latitude' | 'longitude'> | undefined | null
): { latitude: number; longitude: number } | undefined {
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
    return undefined;
  }

  return { latitude, longitude };
}
