import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, getRepository, Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';
import {
  CompetitionSeason,
  CompetitionSubmission,
  CompetitionSubmissionValidationStatus,
  SubmissionMedia
} from '../entities/all.entities';
import {
  GetUserSubmissionsDto,
  GetAdminSubmissionsDto,
  ValidateSubmissionDto,
  SubmissionReviewDto,
  SubmissionMediaDto
} from '../dtos/dtos';
import { VALIDATION_STATUS } from '../enums/competitions.enums';

@Injectable()
export class SubmissionService extends BaseService<CompetitionSubmission> {
  constructor(
    @InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(SubmissionMedia) private mediaRepo: Repository<SubmissionMedia>,
    @InjectRepository(CompetitionSeason) private compSeasonRepo: Repository<CompetitionSeason>,
    @InjectRepository(Season) private seasonRepo: Repository<Season>
  ) {
    super(submissionRepo);
  }

  public async getSubmissionByGuid(guid: string) {
    return this.submissionRepo.findOne({
      where: {
        guid: guid
      },
      relations: ['validationStatus']
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
        accuracy: 0,
        altitude: 0.0,
        altitudeAccuracy: 0.0,
        heading: 0.0,
        speed: 0.0
      };

      const withTrunc = { ...entity, location: truncated };

      const sub = await this.submissionRepo.create(withTrunc).save();

      if (blobs) {
        await Promise.all(
          blobs.map((b) => {
            b.submission = sub;
            return this.mediaRepo.create(b).save();
          })
        );

        Logger.log(`Created submission with media attachments.`, 'SubmissionService');
      }

      return sub;
    } else {
      throw new BadRequestException('Incomplete submission.');
    }
  }

  public createSubmissionMedia(entity: DeepPartial<SubmissionMedia>) {
    return this.mediaRepo.create(entity);
  }

  public async validateSubmission(dto: ValidateSubmissionDto) {
    const submission = await this.submissionRepo.findOne({
      where: {
        guid: dto.guid
      },
      relations: ['validationStatus']
    });

    if (submission) {
      if (submission.validationStatus) {
        submission.validationStatus.status = dto.status;
        submission.validationStatus.verifiedBy = dto.userGuid;

        return submission.save();
      } else {
        const validationStatus = getRepository(CompetitionSubmissionValidationStatus).create({
          status: dto.status,
          verifiedBy: dto.userGuid
        });

        try {
          submission.validationStatus = validationStatus;
          await submission.save();

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
      relations: ['form']
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
      relations: ['location', 'validationStatus', 'blobs']
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
      relations: ['form']
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
      relations: ['location', 'validationStatus', 'blobs']
    });

    return this.mapSubmissionsToReviewDto(submissions, compSeason);
  }

  public async getSubmissionImages(submissionGuid: string): Promise<SubmissionMediaDto[]> {
    const submission = await this.submissionRepo.findOne({
      where: { guid: submissionGuid },
      relations: ['blobs']
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
        fieldName: blob.fieldName
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
      let pointValue = 1;

      if (discriminatorQuestion && submission.value) {
        const submissionValue = submission.value;
        const discriminatorAttribute = discriminatorQuestion.attribute;
        const submittedValue = submissionValue[discriminatorAttribute];

        // Find matching option to get title-cased value and points
        if (submittedValue !== undefined && discriminatorQuestion.options) {
          const matchingOption = discriminatorQuestion.options.find((opt) => opt.value === submittedValue);
          if (matchingOption) {
            questionValue = this.toTitleCase(matchingOption.name);
            pointValue = matchingOption.points || 1;
          }
        }
      }

      return {
        guid: submission.guid,
        created: submission.created,
        questionValue,
        pointValue,
        validationStatus: submission.validationStatus?.status || VALIDATION_STATUS.unverified,
        location: {
          latitude: submission.location?.latitude || 0,
          longitude: submission.location?.longitude || 0
        },
        imageGuids: submission.blobs?.map((blob) => blob.guid) || []
      };
    });
  }

  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}
