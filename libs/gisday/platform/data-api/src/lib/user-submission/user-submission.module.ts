import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSubmissionController } from './user-submission.controller';
import { UserSubmissionProvider } from './user-submission.provider';
import { SubmissionType, Submission, Season, SeasonDay } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { ContactService } from '../contact/contact.service';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, SubmissionType, Season, SeasonDay])],
  controllers: [UserSubmissionController],
  providers: [UserSubmissionProvider, SeasonService, ContactService],
  exports: [UserSubmissionProvider]
})
export class UserSubmissionModule {}
