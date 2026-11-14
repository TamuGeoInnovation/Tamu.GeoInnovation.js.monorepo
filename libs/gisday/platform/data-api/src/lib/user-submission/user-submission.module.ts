import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSubmissionController } from './user-submission.controller';
import { UserSubmissionProvider } from './user-submission.provider';
import { SubmissionType, Submission, Season, SeasonDay, University, Organization, Asset } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { ContactService } from '../contact/contact.service';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { AssetsService } from '../assets/assets.service';
import { SubmissionFilesService } from './submission-files.service';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, SubmissionType, Season, SeasonDay, University, Organization, Asset])],
  controllers: [UserSubmissionController],
  providers: [
    UserSubmissionProvider,
    SeasonService,
    ContactService,
    DashboardProfilesService,
    AssetsService,
    SubmissionFilesService
  ],
  exports: [UserSubmissionProvider]
})
export class UserSubmissionModule {}
