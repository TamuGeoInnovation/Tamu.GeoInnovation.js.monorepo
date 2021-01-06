import { Controller, Get, Post, Req } from '@nestjs/common';

import { Request } from 'express';

import { InitialSurveyQuestion, InitialSurveyResponse } from '../../entities/all.entity';
import { BaseController } from '../_base/base.controller';
import { InitialSurveyProvider } from '../../providers/initial-survey/initial-survey.provider';

@Controller('initial-survey')
export class InitialSurveyController extends BaseController<InitialSurveyResponse> {
  constructor(private readonly initialSurveyProvider: InitialSurveyProvider) {
    super(initialSurveyProvider);
  }

  @Get()
  public async userTookSurvey(@Req() req: Request) {
    if (req.user) {
      const tookSurvey = await this.initialSurveyProvider.initialSurveyRepo.count({
        where: {
          accountGuid: req.user.sub
        }
      });
      if (tookSurvey) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  @Get('/questions/all')
  public async getQuestionsAll() {
    return this.initialSurveyProvider.initialSurveyQuestionRepo.find();
  }

  @Post('/questions')
  public async insertQuestion(@Req() req: Request) {
    const questionTypeGuid = req.body.questionTypeGuid;
    const _question: Partial<InitialSurveyQuestion> = {
      ...req.body
    };
    return this.initialSurveyProvider.insertQuestion(questionTypeGuid, _question);
  }

  @Post()
  public async insertInitialSurveyResponse(@Req() req: Request) {
    const questionGuids = Object.keys(req.body);
    const questionGuidsObj = req.body;

    return this.initialSurveyProvider.insertInitialSurveyResponse(questionGuids, questionGuidsObj, req.user.sub);
  }
}
