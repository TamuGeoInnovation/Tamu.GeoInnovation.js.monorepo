import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InitialSurveyResponse, InitialSurveyQuestion, QuestionType } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class InitialSurveyProvider extends BaseProvider<InitialSurveyResponse> {
  constructor(
    @InjectRepository(InitialSurveyResponse) public initialSurveyRepo: Repository<InitialSurveyResponse>,
    @InjectRepository(InitialSurveyQuestion) public initialSurveyQuestionRepo: Repository<InitialSurveyQuestion>,
    @InjectRepository(QuestionType) public questionTypeRepo: Repository<QuestionType>
  ) {
    super(initialSurveyRepo);
  }

  public async insertQuestion(questionTypeGuid: string, questionParams: Partial<InitialSurveyQuestion>) {
    const questionType = await this.questionTypeRepo.findOne({
      where: {
        guid: questionTypeGuid
      }
    });

    if (questionType) {
      questionParams.questionType = questionType;
      const question = this.initialSurveyQuestionRepo.create(questionParams);

      return this.initialSurveyQuestionRepo.save(question);
    }
  }
}
