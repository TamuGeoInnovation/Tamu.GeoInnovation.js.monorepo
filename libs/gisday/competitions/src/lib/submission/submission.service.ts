import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, getRepository, Repository } from 'typeorm';

import { BaseService } from '../_base/base.service';
import { CompetitionSubmission, CompetitionSubmissionValidationStatus, SubmissionMedia } from '../entities/all.entities';
import { ValidateSubmissionDto } from '../dtos/dtos';

@Injectable()
export class SubmissionService extends BaseService<CompetitionSubmission> {
  constructor(
    @InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(SubmissionMedia) private mediaRepo: Repository<SubmissionMedia>
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
    blobs: Array<DeepPartial<SubmissionMedia>>
  ) {
    if (entity.season && entity.location && entity.userGuid && entity.value && blobs && blobs.length > 0) {
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

      await Promise.all(
        blobs.map((b) => {
          b.submission = sub;
          return this.mediaRepo.create(b).save();
        })
      );

      return sub;
    } else {
      throw new BadRequestException();
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
}
