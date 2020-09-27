import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubmissionController } from '../../controllers/user-submission/user-submission.controller';
import { UserSubmissionProvider } from '../../providers/user-submission/user-submission.provider';
import { UserSubmission } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSubmission])],
  controllers: [UserSubmissionController],
  providers: [UserSubmissionProvider]
})
export class UserSubmissionModule {}
