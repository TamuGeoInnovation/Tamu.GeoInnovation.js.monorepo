import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason, CompetitionSubmission } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';

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

  public async getLocationsForActiveSeason(format: ResponseFormat) {
    const activeSeason = await this.seasonRepo.findOne({ where: { active: true } });

    if (!activeSeason) {
      throw new NotFoundException('No active season found.');
    }

    const competitionSeason = await this.compSeasonRepo.findOne({ where: { season: activeSeason } });

    if (!competitionSeason) {
      throw new NotFoundException('No competition season found.');
    }

    return this.getLocationsForSeasonId(competitionSeason.guid, format);
  }
}

export type ResponseFormat = 'json' | 'geojson';
