import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '@tamu-gisc/gisday/common';

import { MapController } from './map.controller';
import { MapService } from './map.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetitionSubmission, SubmissionLocation, SubmissionMedia])],
  controllers: [MapController],
  providers: [MapService]
})
export class MapModule {}
