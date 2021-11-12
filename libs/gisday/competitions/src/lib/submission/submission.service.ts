import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeepPartial, Repository } from 'typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '@tamu-gisc/gisday/common';

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
    const sub = await this.submissionRepo.create(entity).save();

    await Promise.all(
      blobs.map((b) => {
        b.submission = sub;
        return this.mediaRepo.create(b).save();
      })
    );

    return sub;
  }

  public createSubmissionMedia(entity: DeepPartial<SubmissionMedia>) {
    return this.mediaRepo.create(entity);
  }
}
