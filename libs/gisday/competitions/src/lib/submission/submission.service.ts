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

  public getAllByCreated() {
    return this.submissionRepo.createQueryBuilder('submissions').orderBy('created', 'ASC').getMany();
  }

  public async createCompetitionSubmission(
    entity: DeepPartial<CompetitionSubmission>,
    blobs: Array<DeepPartial<SubmissionMedia>>
  ) {
    if (entity.season && entity.location && entity.userGuid && entity.value && blobs && blobs.length > 0) {
      const sub = await this.submissionRepo.create(entity).save();

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
