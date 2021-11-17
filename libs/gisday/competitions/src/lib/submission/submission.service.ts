import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeepPartial, Repository } from 'typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '../entities/all.entities';

import { BaseService } from '../_base/base.service';

@Injectable()
export class SubmissionService extends BaseService<CompetitionSubmission> {
  constructor(
    @InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(SubmissionLocation) private locationRepo: Repository<SubmissionLocation>,
    @InjectRepository(SubmissionMedia) private mediaRepo: Repository<SubmissionMedia>
  ) {
    super(submissionRepo);
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
            : -1,
        longitude:
          entity.location.longitude !== undefined && entity.location.longitude !== null
            ? parseFloat(entity.location.longitude.toFixed(5))
            : -1,
        accuracy:
          entity.location.accuracy !== undefined && entity.location.accuracy !== null
            ? parseFloat(entity.location.accuracy.toFixed(2))
            : -1,
        altitude:
          entity.location.altitude !== undefined && entity.location.altitude !== null
            ? parseFloat(entity.location.altitude.toFixed(2))
            : -1,
        altitudeAccuracy:
          entity.location.altitudeAccuracy !== undefined && entity.location.altitudeAccuracy !== null
            ? parseFloat(entity.location.altitudeAccuracy.toFixed(2))
            : -1,
        heading:
          entity.location.heading !== undefined && entity.location.heading !== null
            ? parseFloat(entity.location.heading.toFixed(2))
            : -1,
        speed:
          entity.location.speed !== undefined && entity.location.speed !== null
            ? parseFloat(entity.location.speed.toFixed(3))
            : -1
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
}
