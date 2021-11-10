import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '@tamu-gisc/gisday/common';

import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetitionSubmission, SubmissionLocation, SubmissionMedia])],
  controllers: [SubmissionController],
  providers: [SubmissionService]
})
export class SubmissionModule {}
