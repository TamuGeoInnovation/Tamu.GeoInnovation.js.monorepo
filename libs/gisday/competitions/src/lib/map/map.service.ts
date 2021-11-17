import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '../entities/all.entities';

import { BaseService } from '../_base/base.service';

@Injectable()
export class MapService extends BaseService<SubmissionLocation> {
  constructor(
    @InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(SubmissionLocation) private locationRepo: Repository<SubmissionLocation>,
    @InjectRepository(SubmissionMedia) private mediaRepo: Repository<SubmissionMedia>
  ) {
    super(locationRepo);
  }

  public async getLocations(geoJson: boolean = false) {
    if (geoJson) {
      const response = await this.locationRepo.createQueryBuilder('locations').orderBy('locations.created', 'ASC').getMany();

      if (response) {
        const geoJsonPoints = response.map((location) => {
          return {
            type: 'Feature',
            properties: {
              accuracy: location.accuracy
            },
            geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            }
          };
        });

        return {
          type: 'FeatureCollection',
          features: geoJsonPoints
        };
      }
    } else {
      return this.locationRepo.find();
    }
  }
}
