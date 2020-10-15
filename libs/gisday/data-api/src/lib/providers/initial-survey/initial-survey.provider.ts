import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  InitialSurvey,
  InitialSurveyQuestion,
  InitialSurveyQuestionRepo,
  InitialSurveyRepo,
  QuestionTypeRepo
} from '../../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class InitialSurveyProvider extends BaseProvider<InitialSurvey> {
  constructor(
    public readonly initialSurveyRepo: InitialSurveyRepo,
    public readonly initialSurveyQuestionRepo: InitialSurveyQuestionRepo,
    public readonly questionTypeRepo: QuestionTypeRepo
  ) {
    super(initialSurveyRepo);
  }

  async insertQuestion(req: Request) {
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
}
