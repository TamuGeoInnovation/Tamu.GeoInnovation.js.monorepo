import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post, Request } from '@nestjs/common';

import { InitialSurveyQuestion } from '../entities/all.entity';
import { InitialSurveyProvider } from './initial-survey.provider';

@Controller('initial-surveys')
export class InitialSurveyController {
  constructor(private readonly provider: InitialSurveyProvider) {}

  @Get('/questions/all')
  public async getQuestionsAll() {
    return this.provider.initialSurveyQuestionRepo.find();
  }
  @Get(':guid')
  public async getSurvey(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async userTookSurvey(@Request() req) {
    // TODO: Add middleware for appending userGuid to request
    if (req.user) {
      const tookSurvey = await this.provider.initialSurveyRepo.count({
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

  @Post('/questions')
  public async insertQuestion(@Body() body: Partial<InitialSurveyQuestion>) {
    const questionTypeGuid = body.questionType.guid;

    return this.provider.insertQuestion(questionTypeGuid, body);
  }

  @Post()
  public async insertSurveyResponse() {
    // Should return initial survey response
    return new NotImplementedException();
  }

  @Patch(':guid')
  public async updateEntity() {
    throw new NotImplementedException();
  }

  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
