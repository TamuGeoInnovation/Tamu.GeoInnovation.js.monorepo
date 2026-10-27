import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason, CompetitionSubmission } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';
import { previousSeasonFinds } from '../leaderboard/leaderboard.service';

@Injectable()
export class MapService extends BaseService<CompetitionSubmission> {
  constructor(
    @InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(Season) private seasonRepo: Repository<Season>,
    @InjectRepository(CompetitionSeason) private compSeasonRepo: Repository<CompetitionSeason>
  ) {
    super(submissionRepo);
  }

  public async getLocationsForSeasonId(competitionSeasonGuid?: string, format: ResponseFormat = 'json') {
    const query = this.submissionRepo
      .createQueryBuilder('submissions')
      .leftJoinAndSelect('submissions.location', 'location')
      .leftJoinAndSelect('submissions.validationStatus', 'validationStatus')
      .leftJoin('submissions.season', 'season')
      .where('season.guid = :seasonId')
      .setParameter('seasonId', competitionSeasonGuid)
      .orderBy('submissions.created', 'ASC');

    const submissions = await query.getMany();

    return this._formatSubmissionsCollection(format, submissions);
  }

  public async getLocationsForUserSeason(competitionSeasonGuid: string, userId: string, format: ResponseFormat = 'json') {
    const query = await this.submissionRepo
      .createQueryBuilder('submissions')
      .leftJoinAndSelect('submissions.location', 'location')
      .leftJoinAndSelect('submissions.validationStatus', 'validationStatus')
      .leftJoin('submissions.season', 'season')
      .where('season.guid = :seasonId')
      .andWhere('submissions.userGuid = :userId')
      .setParameters({ seasonId: competitionSeasonGuid, userId })
      .orderBy('submissions.created', 'ASC');

    const submissions = await query.getMany();

    return this._formatSubmissionsCollection(format, submissions);
  }

  public async getLocationsForActiveSeason(format: ResponseFormat) {
    const competitionSeason = await this._getActiveCompetitionSeason();

    return this.getLocationsForSeasonId(competitionSeason.guid, format);
  }

  /**
   * Where things were already found in the previous competition season, as this season's types: the
   * baseline scoring counts as already found (#2162), shown on the map so participants look elsewhere
   * (#2166). Position, type and year only: nothing about who found them or how they were reviewed.
   * Empty when this season's form does not continue an earlier one.
   */
  public async getAlreadyFoundForActiveSeason(format: ResponseFormat = 'json') {
    const competitionSeason = await this._getActiveCompetitionSeason({ form: true, season: true });
    const typeQuestion = competitionSeason.form?.model?.find((q) => q.isDiscriminator === true);
    const { year, finds } = await previousSeasonFinds(this.compSeasonRepo, this.submissionRepo, competitionSeason);

    const points = finds.flatMap((find) => {
      const option = typeQuestion?.options?.find((candidate) => candidate.earlier?.values.includes(find.type as string));

      return option ? [{ ...find.location, type: option.value, typeName: option.name, year }] : [];
    });

    if (format === 'geojson') {
      return {
        type: 'FeatureCollection',
        features: points.map(({ latitude, longitude, ...properties }) => ({
          type: 'Feature',
          properties,
          geometry: { type: 'Point', coordinates: [longitude, latitude] }
        }))
      };
    }

    return points;
  }

  public async getUserLocationsForActiveSeason(userGuid: string, format: ResponseFormat) {
    const competitionSeason = await this._getActiveCompetitionSeason();

    return this.getLocationsForUserSeason(competitionSeason.guid, userGuid, format);
  }

  private async _getActiveCompetitionSeason(relations?: { form?: boolean; season?: boolean }) {
    const activeSeason = await this.seasonRepo.findOne({ where: { active: true } });

    if (!activeSeason) {
      throw new NotFoundException('No active season found.');
    }

    const competitionSeason = await this.compSeasonRepo.findOne({
      where: { season: { guid: activeSeason.guid } },
      relations
    });

    if (!competitionSeason) {
      throw new NotFoundException('No competition season found.');
    }

    return competitionSeason;
  }

  private _formatSubmissionsCollection(format: ResponseFormat, submissions: CompetitionSubmission[]) {
    if (format === 'geojson') {
      if (submissions) {
        const geoJsonPoints = submissions.map((submission) => {
          return {
            type: 'Feature',
            properties: {
              ...submission.validationStatus,
              guid: submission.guid,
              created: submission.created,
              updated: submission.updated
            },
            geometry: {
              type: 'Point',
              coordinates: [submission.location.longitude, submission.location.latitude]
            }
          };
        });

        return {
          type: 'FeatureCollection',
          features: geoJsonPoints
        };
      }
    } else {
      return submissions.map((submission) => submission.location);
    }
  }
}

export type ResponseFormat = 'json' | 'geojson';
