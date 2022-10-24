import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSubmissionController } from './user-submission.controller';
import { UserSubmissionProvider } from './user-submission.provider';
import { SubmissionType, Submission } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, SubmissionType])],
  controllers: [UserSubmissionController],
  providers: [UserSubmissionProvider],
  exports: [UserSubmissionProvider]
})
export class UserSubmissionModule {}
