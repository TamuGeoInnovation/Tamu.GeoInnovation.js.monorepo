import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '@tamu-gisc/gisday/common';

import { BaseService } from '../_base/base.service';

@Injectable()
export class LeaderboardService extends BaseService<CompetitionSubmission> {
  constructor(
    @InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(SubmissionLocation) private locationRepo: Repository<SubmissionLocation>,
    @InjectRepository(SubmissionMedia) private mediaRepo: Repository<SubmissionMedia>
  ) {
    super(submissionRepo);
  }

  public getAllLeaderboardItems() {
    return this.submissionRepo.query(
      'SELECT RIGHT(userGuid, 4) as [identity], userGuid as guid, COUNT(userGuid) as points FROM submissions GROUP BY userGuid ORDER BY points DESC'
    );
  }
}
