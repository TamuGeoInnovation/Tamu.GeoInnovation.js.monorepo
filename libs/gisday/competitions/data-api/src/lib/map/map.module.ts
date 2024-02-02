import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason, CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '../entities/all.entities';
import { MapController } from './map.controller';
import { MapService } from './map.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompetitionSubmission, SubmissionLocation, SubmissionMedia, Season, CompetitionSeason])
  ],
  controllers: [MapController],
  providers: [MapService],
  exports: [MapService]
})
export class MapModule {}
