import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubmissionTypeController } from './submission-type.controller';
import { SubmissionTypeProvider } from './submission-type.provider';
import { SubmissionType } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubmissionType])],
  controllers: [SubmissionTypeController],
  providers: [SubmissionTypeProvider]
})
export class SubmissionTypeModule {}
