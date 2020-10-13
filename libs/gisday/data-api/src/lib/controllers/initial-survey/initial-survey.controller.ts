import { Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { InitialSurvey } from '../../entities/all.entity';
import { BaseController } from '../_base/base.controller';
import { InitialSurveyProvider } from '../../providers/initial-survey/initial-survey.provider';

@Controller('initial-survey')
export class InitialSurveyController extends BaseController<InitialSurvey> {
  constructor(private readonly initialSurveyProvider: InitialSurveyProvider) {
    super(initialSurveyProvider);
  }

  @Get('/questions/all')
  async getQuestionsAll() {
    return this.initialSurveyProvider.initialSurveyQuestionRepo.find();
  }

  @Post('/questions')
  async insertQuestion(@Req() req: Request) {
    return this.initialSurveyProvider.insertQuestion(req);
  }
}
