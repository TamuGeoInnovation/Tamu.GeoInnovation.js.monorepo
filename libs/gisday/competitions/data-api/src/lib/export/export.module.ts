import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompetitionSubmission, SubmissionMedia, CompetitionSeason } from '../entities/all.entities';

import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ExportProcessor } from './export.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'vgi-export' }),
    TypeOrmModule.forFeature([CompetitionSubmission, SubmissionMedia, CompetitionSeason])
  ],
  controllers: [ExportController],
  providers: [ExportService, ExportProcessor],
  exports: [ExportService]
})
export class ExportModule {}
