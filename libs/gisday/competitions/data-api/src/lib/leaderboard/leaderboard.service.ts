import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, concatMap, from, map, of, toArray } from 'rxjs';

import { Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { CompetitionSeason, CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';

interface LeaderboardCache {
  data: Array<{ identity: string; guid: string; points: number }>;
  timestamp: number;
}

@Injectable()
export class LeaderboardService extends BaseService<CompetitionSubmission> {
  private leaderboardCache: Map<string, LeaderboardCache> = new Map();
  private readonly CACHE_TTL = 60000; // 60 seconds in milliseconds

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

    const competitionSeason = await this.compSeasonRepo.findOne({
      where: { season: activeSeason },
      relations: ['form']
    });

    if (!competitionSeason) {
      throw new NotFoundException('No competition season found.');
    }

    // Check cache
    const cacheKey = competitionSeason.guid;
    const cached = this.leaderboardCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      // Return cached data
      if (resolveIdentities) {
        return this.resolveIdentities(cached.data);
      }
      return cached.data;
    }

    // Calculate leaderboard with point system
    const leaderboardData = await this.calculateLeaderboard(competitionSeason);

    // Cache the results
    this.leaderboardCache.set(cacheKey, {
      data: leaderboardData,
      timestamp: now
    });

    if (resolveIdentities) {
      return this.resolveIdentities(leaderboardData);
    }

    return leaderboardData;
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

  private async calculateLeaderboard(
    competitionSeason: CompetitionSeason
  ): Promise<Array<{ identity: string; guid: string; points: number }>> {
    // Find the discriminator question
    const discriminatorQuestion = competitionSeason.form?.model?.find((q) => q.isDiscriminator === true);

    // Fetch all submissions for this season
    const submissions = await this.submissionRepo.find({
      where: {
        season: { guid: competitionSeason.guid }
      }
    });

    // Calculate points per user
    const userPointsMap = new Map<string, number>();

    for (const submission of submissions) {
      const userGuid = submission.userGuid;
      let points = 1; // Default points

      if (discriminatorQuestion && submission.value) {
        try {
          // Parse submission value as flat object
          const submissionValue = submission.value;
          const discriminatorAttribute = discriminatorQuestion.attribute;
          const submittedValue = submissionValue[discriminatorAttribute];

          // Find matching option and get points
          if (submittedValue !== undefined && discriminatorQuestion.options) {
            const matchingOption = discriminatorQuestion.options.find((opt) => opt.value === submittedValue);
            points = matchingOption?.points || 1;
          }
        } catch (error) {
          // If parsing fails or no match, default to 1 point
          points = 1;
        }
      }

      // Aggregate points for user
      const currentPoints = userPointsMap.get(userGuid) || 0;
      userPointsMap.set(userGuid, currentPoints + points);
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

  private async resolveIdentities(leaderboardData: Array<{ identity: string; guid: string; points: number }>): Promise<any> {
    const allResolvedUsers = from(leaderboardData).pipe(
      concatMap((sub) => {
        return from(this.ms.getUserMetadata(sub.guid, undefined, true)).pipe(
          map((user) => {
            return { ...sub, identity: user.user_info.email };
          }),
          catchError(() => {
            return of({ ...sub });
          })
        );
      }),
      toArray()
    );

    return allResolvedUsers;
  }
}
