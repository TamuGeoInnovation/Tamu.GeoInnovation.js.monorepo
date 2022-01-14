import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSubmissionController } from '../../controllers/user-submission/user-submission.controller';
import { UserSubmissionProvider } from '../../providers/user-submission/user-submission.provider';
import { SubmissionTypeRepo, UserSubmissionRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubmissionTypeRepo, UserSubmissionRepo])],
  controllers: [UserSubmissionController],
  providers: [UserSubmissionProvider],
  exports: [UserSubmissionProvider]
})
export class UserSubmissionModule {}
