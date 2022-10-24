import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InitialSurveyResponse, InitialSurveyQuestion, QuestionType } from '../entities/all.entity';
import { InitialSurveyController } from './initial-survey.controller';
import { InitialSurveyProvider } from './initial-survey.provider';

@Module({
  imports: [TypeOrmModule.forFeature([InitialSurveyResponse, InitialSurveyQuestion, QuestionType])],
  controllers: [InitialSurveyController],
  providers: [InitialSurveyProvider],
  exports: []
})
export class InitialSurveyModule {}
