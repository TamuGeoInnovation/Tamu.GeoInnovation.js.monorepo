import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  InitialSurveyResponse,
  InitialSurveyQuestion,
  InitialSurveyQuestionRepo,
  InitialSurveyRepo,
  QuestionTypeRepo
} from '../../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class InitialSurveyProvider extends BaseProvider<InitialSurveyResponse> {
  constructor(
    public readonly initialSurveyRepo: InitialSurveyRepo,
    public readonly initialSurveyQuestionRepo: InitialSurveyQuestionRepo,
    public readonly questionTypeRepo: QuestionTypeRepo
  ) {
    super(initialSurveyRepo);
  }

  public async insertQuestion(req: Request) {
    const questionType = await this.questionTypeRepo.findOne({
      where: {
        guid: req.body.questionTypeGuid
      }
    });
    if (questionType) {
      const _question: Partial<InitialSurveyQuestion> = req.body;
      _question.questionType = questionType;
      const question = this.initialSurveyQuestionRepo.create(_question);
      return this.initialSurveyQuestionRepo.save(question);
    }
  }

  public async insertInitialSurveyResponse(req: Request) {
    const questionGuids: string[] = Object.keys(req.body);
    questionGuids.map(async (guid) => {
      const question = await this.initialSurveyQuestionRepo.findOne({
        where: {
          guid: guid
        }
      });
      if (req.body[guid] !== '' || req.body[guid] !== undefined || req.body[guid] !== null) {
        const _response: Partial<InitialSurveyResponse> = {
          accountGuid: req.user.sub,
          responseValue: req.body[guid],
          question: question
        };
        const response = await this.initialSurveyRepo.create(_response);
        return response.save();
      }
    });
  }
}
