import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompetitionSubmission } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';

@Injectable()
export class MapService extends BaseService<CompetitionSubmission> {
  constructor(@InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>) {
    super(submissionRepo);
  }

  public async getLocations(geoJson = false) {
    const submissions = await this.submissionRepo
      .createQueryBuilder('submissions')
      .leftJoinAndSelect('submissions.location', 'location')
      .leftJoinAndSelect('submissions.validationStatus', 'validationStatus')
      .orderBy('submissions.created', 'ASC')
      .getMany();

    if (geoJson) {
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
