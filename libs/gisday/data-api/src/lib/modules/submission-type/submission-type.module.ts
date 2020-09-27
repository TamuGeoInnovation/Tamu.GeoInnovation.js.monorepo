import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionTypeController } from '../../controllers/submission-type/submission-type.controller';
import { SubmissionTypeProvider } from '../../providers/submission-type/submission-type.provider';
import { SubmissionTypeRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubmissionTypeRepo])],
  controllers: [SubmissionTypeController],
  providers: [SubmissionTypeProvider]
})
export class SubmissionTypeModule {}
