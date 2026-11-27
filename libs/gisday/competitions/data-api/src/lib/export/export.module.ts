import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSubmission, SubmissionMedia, CompetitionSeason } from '../entities/all.entities';

import { ExportController } from './export.controller';
import { ExportService } from './export.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetitionSubmission, SubmissionMedia, CompetitionSeason, Season])],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService]
})
export class ExportModule {}
