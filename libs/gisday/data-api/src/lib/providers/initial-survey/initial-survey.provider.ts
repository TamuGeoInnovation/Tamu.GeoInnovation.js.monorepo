import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  InitialSurvey,
  InitialSurveyQuestion,
  InitialSurveyQuestionRepo,
  InitialSurveyRepo
} from '../../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class InitialSurveyProvider extends BaseProvider<InitialSurvey> {
  constructor(
    public readonly initialSurveyRepo: InitialSurveyRepo,
    public readonly initialSurveyQuestionRepo: InitialSurveyQuestionRepo
  ) {
    super(initialSurveyRepo);
  }

  async insertQuestion(req: Request) {
    const _question: Partial<InitialSurveyQuestion> = req.body;
    const question = this.initialSurveyQuestionRepo.create(_question);
    return question.save();
  }
}
