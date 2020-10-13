import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InitialSurveyController } from '../../controllers/initial-survey/initial-survey.controller';
import { InitialSurveyRepo, InitialSurveyQuestionRepo } from '../../entities/all.entity';
import { InitialSurveyProvider } from '../../providers/initial-survey/initial-survey.provider';

@Module({
  imports: [TypeOrmModule.forFeature([InitialSurveyQuestionRepo, InitialSurveyRepo])],
  controllers: [InitialSurveyController],
  providers: [InitialSurveyProvider],
  exports: []
})
export class InitialSurveyModule {}
