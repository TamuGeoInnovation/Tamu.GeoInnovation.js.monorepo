import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '../entities/all.entities';

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

  public async getLeaderBoardForActiveSeason() {
    const subs = await this.submissionRepo
      .createQueryBuilder('submissions')
      .leftJoin('submissions.season', 'season')
      .select('RIGHT(submissions.userGuid, 4)', 'identity')
      .addSelect('submissions.userGuid', 'guid')
      .addSelect('COUNT(submissions.userGuid)', 'points')
      .groupBy('submissions.userGuid')
      .orderBy('points', 'DESC')
      .where('season.active = :seasonActivity')
      .setParameter('seasonActivity', true)
      .getRawMany();

    return subs;
  }

  public async getLeaderBoardItemsForSeason(season?: string) {
    const subs = await this.submissionRepo
      .createQueryBuilder('submissions')
      .leftJoin('submissions.season', 'season')
      .select('RIGHT(submissions.userGuid, 4)', 'identity')
      .addSelect('submissions.userGuid', 'guid')
      .addSelect('COUNT(submissions.userGuid)', 'points')
      .groupBy('submissions.userGuid')
      .orderBy('points', 'DESC')
      .where('season.year = :season')
      .setParameter('season', season)
      .getRawMany();

    return subs;
  }
}
