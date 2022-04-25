import { Body, Controller, Get, Post, Request } from '@nestjs/common';

import { InitialSurveyQuestion, InitialSurveyResponse } from '../../entities/all.entity';
import { BaseController } from '../_base/base.controller';
import { InitialSurveyProvider } from '../../providers/initial-survey/initial-survey.provider';

@Controller('initial-survey')
export class InitialSurveyController extends BaseController<InitialSurveyResponse> {
  constructor(private readonly initialSurveyProvider: InitialSurveyProvider) {
    super(initialSurveyProvider);
  }

  @Get()
  public async userTookSurvey(@Request() req) {
    // TODO: Add middleware for appending userGuid to request
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
  public async insertQuestion(@Body() body: Partial<InitialSurveyQuestion>) {
    const questionTypeGuid = body.questionType.guid;

    return this.initialSurveyProvider.insertQuestion(questionTypeGuid, body);
  }

  @Post()
  public async insertInitialSurveyResponse() {
    //  TODO: Add middleware for appending userGuid to request
    // const questionGuids = Object.keys(body);
    // const questionGuidsObj = body;

    // return this.initialSurveyProvider.insertInitialSurveyResponse(questionGuids, questionGuidsObj, req.user.sub);
    return;
  }
}
