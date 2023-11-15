import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { CompetitionSeason, CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';

@Injectable()
export class LeaderboardService extends BaseService<CompetitionSubmission> {
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

  public getAllLeaderboardItems() {
    return this.submissionRepo.query(
      'SELECT RIGHT(userGuid, 4) as [identity], userGuid as guid, COUNT(userGuid) as points FROM submissions GROUP BY userGuid ORDER BY points DESC'
    );
  }

  public async getLeaderBoardItemsForActiveSeason(resolveIdentities?: boolean) {
    const activeSeason = await this.seasonRepo.findOne({ where: { active: true } });

    if (!activeSeason) {
      throw new NotFoundException('No active season found.');
    }

    const competitionSeason = await this.compSeasonRepo.findOne({ where: { season: activeSeason } });

    if (!competitionSeason) {
      throw new NotFoundException('No competition season found.');
    }

    const subs = await this.submissionRepo
      .createQueryBuilder('submissions')
      .leftJoin('submissions.season', 'season')
      .select('RIGHT(submissions.userGuid, 4)', 'identity')
      .addSelect('submissions.userGuid', 'guid')
      .addSelect('COUNT(submissions.userGuid)', 'points')
      .groupBy('submissions.userGuid')
      .orderBy('points', 'DESC')
      .where('season.guid = :season')
      .setParameter('season', competitionSeason.guid)
      .getRawMany();

    if (resolveIdentities) {
      const ids = subs.map((leaders) => leaders.guid);
    }

    return subs;
  }

  public async getLeaderBoardItemsForSeason(seasonGuid?: string) {
    const subs = await this.submissionRepo
      .createQueryBuilder('submissions')
      .leftJoin('submissions.season', 'season')
      .select('RIGHT(submissions.userGuid, 4)', 'identity')
      .addSelect('submissions.userGuid', 'guid')
      .addSelect('COUNT(submissions.userGuid)', 'points')
      .groupBy('submissions.userGuid')
      .orderBy('points', 'DESC')
      .where('season.guid = :season')
      .setParameter('season', seasonGuid)
      .getRawMany();

    return subs;
  }
}

