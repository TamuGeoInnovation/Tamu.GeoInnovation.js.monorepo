import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { BaseService } from '../_base/base.service';
import {
  CompetitionSeason,
  CompetitionSubmission,
  CompetitionSubmissionValidationStatus,
  SubmissionLocation,
  SubmissionMedia
} from '../entities/all.entities';
import {
  GetUserSubmissionsDto,
  GetAdminSubmissionsDto,
  ValidateSubmissionDto,
  SubmissionReviewDto,
  SubmissionMediaDto
} from '../dtos/dtos';
import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';

import { AUTOMATIC_REVIEWER, automaticReviewReasons, COULD_NOT_REVIEW, ReviewedSubmission } from './automatic-review';
import { VgiArcgisPublisher } from '../arcgis/vgi-arcgis-publisher.service';

@Injectable()
export class SubmissionService extends BaseService<CompetitionSubmission> {
  constructor(
    @InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(CompetitionSubmissionValidationStatus)
    private validationStatusRepo: Repository<CompetitionSubmissionValidationStatus>,
    @InjectRepository(SubmissionMedia) private mediaRepo: Repository<SubmissionMedia>,
    @InjectRepository(CompetitionSeason) private compSeasonRepo: Repository<CompetitionSeason>,
    @InjectRepository(Season) private seasonRepo: Repository<Season>,
    private readonly ms: ManagementService,
    private readonly arcgis: VgiArcgisPublisher
  ) {
    super(submissionRepo);
  }

  public async getSubmissionByGuid(guid: string) {
    return this.submissionRepo.findOne({
      where: {
        guid: guid
      },
      relations: { validationStatus: true }
    });
  }

  public async createCompetitionSubmission(
    entity: DeepPartial<CompetitionSubmission>,
    blobs?: Array<DeepPartial<SubmissionMedia>>
  ) {
    if (entity.season && entity.location && entity.userGuid && entity.value) {
      const truncated: DeepPartial<CompetitionSubmission['location']> = {
        latitude:
          entity.location.latitude !== undefined && entity.location.latitude !== null
            ? parseFloat(entity.location.latitude.toFixed(5))
            : 0.0,
        longitude:
          entity.location.longitude !== undefined && entity.location.longitude !== null
            ? parseFloat(entity.location.longitude.toFixed(5))
            : 0.0,
        // What the phone reported, in metres, so reviewers can tell a precise fix from a rough one
        // (#1784). The column holds up to 999.99.
        accuracy: clampAccuracy(entity.location.accuracy),
        altitude: 0.0,
        altitudeAccuracy: 0.0,
        heading: 0.0,
        speed: 0.0
      };

      // The app reviews every new submission (#2164): verified when it passes every check, otherwise left
      // unverified for a person, who can always decide otherwise. Before the save, and never able to stop
      // it: a review that fails leaves the submission unverified, saved (#2428 review).
      const reasons = await this.reviewAutomatically(entity, truncated, blobs?.length ?? 0);

      // INSERT, never save(): save() updates a row whose guid already exists, and the app chooses the
      // guid (#1786). A duplicate fails on the primary key and rolls back its location and photographs.
      const saved = await this.submissionRepo.manager.transaction(async (em) => {
        const validationStatus = await em.save(
          em.create(CompetitionSubmissionValidationStatus, {
            status: reasons.length === 0 ? COMPETITION_VALIDATION_STATUS.verified : COMPETITION_VALIDATION_STATUS.unverified,
            verifiedBy: AUTOMATIC_REVIEWER
          })
        );

        const location = await em.save(em.create(SubmissionLocation, truncated));
        const sub = em.create(CompetitionSubmission, { ...entity, location, validationStatus });

        await em.insert(CompetitionSubmission, sub);

        if (blobs?.length) {
          await em.insert(SubmissionMedia, blobs.map((b) => em.create(SubmissionMedia, { ...b, submission: sub })));
          Logger.log(`Created submission with media attachments.`, 'SubmissionService');
        }

        return sub;
      });

      // Then to the season's ArcGIS Online layer, without waiting: the upload succeeds whatever ArcGIS
      // Online does (#2433).
      this.arcgis?.publishInBackground(saved.guid);

      return saved;
    } else {
      throw new BadRequestException('Incomplete submission.');
    }
  }

  /**
   * Why a new submission needs a person to look at it (`automaticReviewReasons`), compared with the
   * participant's earlier submissions in the season. When the review itself fails, that is the reason, and
   * the error is logged.
   */
  private async reviewAutomatically(
    entity: DeepPartial<CompetitionSubmission>,
    location: DeepPartial<SubmissionLocation>,
    photos: number
  ): Promise<Array<string>> {
    try {
      const earlier = await this.submissionRepo.find({
        where: { userGuid: entity.userGuid, season: { guid: entity.season.guid } },
        relations: { location: true, validationStatus: true }
      });

      return automaticReviewReasons(
        { created: new Date(), value: entity.value as never, location: location as never, photos },
        earlier.map((other) => toReviewed(other)),
        (entity.season as CompetitionSeason).form?.model ?? []
      );
    } catch (err) {
      Logger.error(`Could not review submission ${entity.guid} automatically: ${err?.message ?? err}`, 'SubmissionService');

      return [COULD_NOT_REVIEW];
    }
  }

  /**
   * Publishes every submission of the active competition season to its ArcGIS Online layer, for an admin
   * after an outage or once publishing is switched on (#2433).
   */
  public async publishActiveSeasonToArcgis() {
    const season = await this.seasonRepo.findOne({ where: { active: true } });
    const compSeason = season ? await this.compSeasonRepo.findOne({ where: { season: { guid: season.guid } } }) : null;

    if (!compSeason) {
      throw new NotFoundException('No active competition season.');
    }

    return this.arcgis.publishSeason(compSeason.guid);
  }

  public createSubmissionMedia(entity: DeepPartial<SubmissionMedia>) {
    return this.mediaRepo.create(entity);
  }

  public async validateSubmission(dto: ValidateSubmissionDto) {
    const submission = await this.submissionRepo.findOne({
      where: {
        guid: dto.guid
      },
      relations: { validationStatus: true }
    });

    if (submission) {
      if (submission.validationStatus) {
        submission.validationStatus.status = dto.status;
        submission.validationStatus.verifiedBy = dto.userGuid;

        const saved = await submission.save();

        // The new status reaches the ArcGIS Online layer too (#2433).
        this.arcgis?.publishInBackground(submission.guid);

        return saved;
      } else {
        const validationStatus = this.validationStatusRepo.create({
          status: dto.status,
          verifiedBy: dto.userGuid
        });

        try {
          submission.validationStatus = validationStatus;
          await submission.save();
          this.arcgis?.publishInBackground(submission.guid);

          return submission;
        } catch (err) {
          throw new InternalServerErrorException();
        }
      }
    } else {
      throw new NotFoundException();
    }
  }

  public async getUserSubmissions(dto: GetUserSubmissionsDto): Promise<SubmissionReviewDto[]> {
    // Get the season to fetch
    let season: Season;
    if (dto.seasonGuid) {
      season = await this.seasonRepo.findOne({ where: { guid: dto.seasonGuid } });
    } else {
      season = await this.seasonRepo.findOne({ where: { active: true } });
    }

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    // Get competition season with form
    const compSeason = await this.compSeasonRepo.findOne({
      where: { season: { guid: season.guid } },
      relations: { form: true }
    });

    if (!compSeason) {
      throw new NotFoundException('Competition season not found');
    }

    // Get all user submissions for the season
    const submissions = await this.submissionRepo.find({
      where: {
        userGuid: dto.userGuid,
        season: { guid: compSeason.guid }
      },
      relations: { location: true, validationStatus: true, blobs: true }
    });

    return this.mapSubmissionsToReviewDto(submissions, compSeason);
  }

  public async getAdminSubmissions(dto: GetAdminSubmissionsDto): Promise<SubmissionReviewDto[]> {
    // Get the season to fetch
    let season: Season;
    if (dto.seasonGuid) {
      season = await this.seasonRepo.findOne({ where: { guid: dto.seasonGuid } });
    } else {
      season = await this.seasonRepo.findOne({ where: { active: true } });
    }

    if (!season) {
      // Return empty array instead of throwing error when no season is found
      return [];
    }

    // Get competition season with form
    const compSeason = await this.compSeasonRepo.findOne({
      where: { season: { guid: season.guid } },
      relations: { form: true }
    });

    if (!compSeason) {
      // Return empty array if competition season doesn't exist
      return [];
    }

    // Get all submissions for the season
    const submissions = await this.submissionRepo.find({
      where: {
        season: { guid: compSeason.guid }
      },
      relations: { location: true, validationStatus: true, blobs: true },
      select: {
        guid: true,
        created: true,
        value: true,
        userGuid: true,
        location: {
          latitude: true,
          longitude: true,
          accuracy: true
        },
        validationStatus: {
          status: true,
          verifiedBy: true
        },
        blobs: {
          guid: true,
          sha256: true
        }
      },
      order: {
        created: 'DESC'
      }
    });

    const mapped = this.mapSubmissionsToReviewDto(submissions, compSeason).map((dto, i) =>
      withAutomaticReview(dto, submissions[i], submissions, compSeason)
    );
    return this.resolveIdentities(mapped);
  }

  public async getSubmissionImages(submissionGuid: string): Promise<SubmissionMediaDto[]> {
    const submission = await this.submissionRepo.findOne({
      where: { guid: submissionGuid },
      relations: { blobs: true }
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Map entity to DTO to avoid entity references in frontend
    return (
      submission.blobs?.map((blob) => ({
        guid: blob.guid,
        blob: blob.blob,
        mimeType: blob.mimeType,
        fieldName: blob.fieldName,
        sha256: blob.sha256
      })) || []
    );
  }

  private mapSubmissionsToReviewDto(
    submissions: CompetitionSubmission[],
    compSeason: CompetitionSeason
  ): SubmissionReviewDto[] {
    const discriminatorQuestion = compSeason.form?.model?.find((q) => q.isDiscriminator === true);

    return submissions.map((submission) => {
      let questionValue = '';

      if (discriminatorQuestion && submission.value) {
        const submissionValue = submission.value;
        const discriminatorAttribute = discriminatorQuestion.attribute;
        const submittedValue = submissionValue[discriminatorAttribute];

        // Find matching option to get title-cased value
        if (submittedValue !== undefined && discriminatorQuestion.options) {
          const matchingOption = discriminatorQuestion.options.find((opt) => opt.value === submittedValue);
          if (matchingOption) {
            questionValue = this.toTitleCase(matchingOption.name);
          }
        }
      }

      return {
        guid: submission.guid,
        created: submission.created,
        questionValue,
        validationStatus: submission.validationStatus?.status || COMPETITION_VALIDATION_STATUS.unverified,
        userGuid: submission.userGuid,
        location: {
          latitude: submission.location?.latitude || 0,
          longitude: submission.location?.longitude || 0
        },
        imageGuids: submission.blobs?.map((blob) => blob.guid) || [],
        sha256Hashes: submission.blobs?.map((blob) => blob.sha256).filter(Boolean) || []
      };
    });
  }

  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  private async resolveIdentities(submissions: SubmissionReviewDto[]): Promise<SubmissionReviewDto[]> {
    // Get distinct user GUIDs
    const distinctUserGuids = [...new Set(submissions.map((s) => s.userGuid).filter(Boolean))];

    // Resolve all identities in parallel
    const identityMap = new Map<string, string>();
    await Promise.all(
      distinctUserGuids.map(async (userGuid) => {
        try {
          const user = await this.ms.getUserMetadata(userGuid, undefined, true);
          identityMap.set(userGuid, user.user_info.email);
        } catch (error) {
          // If resolution fails, use last 4 characters of GUID
          identityMap.set(userGuid, userGuid.substring(userGuid.length - 4));
        }
      })
    );

    // Map identities to submissions
    return submissions.map((submission) => ({
      ...submission,
      resolvedIdentity: submission.userGuid
        ? identityMap.get(submission.userGuid) || submission.userGuid.substring(submission.userGuid.length - 4)
        : undefined
    }));
  }
}

/**
 * A saved submission as the automatic review reads it (#2164).
 */
function toReviewed(submission: CompetitionSubmission): ReviewedSubmission {
  return {
    created: new Date(submission.created),
    value: submission.value as never,
    location: submission.location,
    photos: submission.blobs?.length ?? 0,
    discarded: submission.validationStatus?.status === COMPETITION_VALIDATION_STATUS.discarded
  };
}

/**
 * A submission in the admin list with the name typed on it, whether the app verified it, and, while no
 * one has verified or discarded it, why it needs a person to look (#2164). The reasons are worked out
 * again from the season's submissions, so they follow the checks as they are now.
 */
function withAutomaticReview(
  dto: SubmissionReviewDto,
  submission: CompetitionSubmission,
  all: Array<CompetitionSubmission>,
  compSeason: CompetitionSeason
): SubmissionReviewDto {
  const model = compSeason.form?.model ?? [];
  const typeQuestion = model.find((q) => q.isDiscriminator === true);
  const type = typeQuestion ? submission.value?.[typeQuestion.attribute] : undefined;
  const nameAttribute = typeQuestion?.options?.find((option) => option.value === type)?.nameAttribute;
  const name = nameAttribute ? submission.value?.[nameAttribute] : undefined;
  const status = submission.validationStatus?.status ?? COMPETITION_VALIDATION_STATUS.unverified;
  const created = new Date(submission.created).getTime();

  const reviewReasons =
    status === COMPETITION_VALIDATION_STATUS.unverified
      ? automaticReviewReasons(
          toReviewed(submission),
          all
            .filter((other) => other.userGuid === submission.userGuid && new Date(other.created).getTime() < created)
            .map((other) => toReviewed(other)),
          model
        )
      : [];

  return {
    ...dto,
    name: typeof name === 'string' ? name : undefined,
    reviewReasons,
    verifiedAutomatically:
      status === COMPETITION_VALIDATION_STATUS.verified && submission.validationStatus?.verifiedBy === AUTOMATIC_REVIEWER
  };
}

/**
 * A reported location accuracy in metres, rounded to centimetres and kept within its column
 * (decimal 5, 2): 0 when none was reported.
 */
export function clampAccuracy(accuracy: unknown): number {
  const metres = Number(accuracy);

  if (accuracy === null || accuracy === undefined || !Number.isFinite(metres) || metres < 0) {
    return 0;
  }

  return Math.min(Math.round(metres * 100) / 100, 999.99);
}

/**
 * Whether the database refused an INSERT because the key already exists (SQL Server 2627, or 2601 for
 * a unique index).
 */
export function isDuplicateKey(err): boolean {
  const number = err?.driverError?.number ?? err?.number;

  return number === 2627 || number === 2601;
}
