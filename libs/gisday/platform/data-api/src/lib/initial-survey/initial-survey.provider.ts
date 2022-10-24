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

  public async insertQuestion(questionTypeGuid: string, _question: Partial<InitialSurveyQuestion>) {
    const questionType = await this.questionTypeRepo.findOne({
      where: {
        guid: questionTypeGuid
      }
    });

    if (questionType) {
      _question.questionType = questionType;
      const question = this.initialSurveyQuestionRepo.create(_question);

      return this.initialSurveyQuestionRepo.save(question);
    }
  }

  // TODO: Does this still work? -Aaron (1/5/2021)
  public async insertInitialSurveyResponse(questionGuids: string[], questionGuidsObj: unknown, accountGuid: string) {
    questionGuids.forEach(async (guid) => {
      const question = await this.initialSurveyQuestionRepo.findOne({
        where: {
          guid: guid
        }
      });

      if (questionGuidsObj[guid] !== '' || questionGuidsObj[guid] !== undefined || questionGuidsObj[guid] !== null) {
        const _response: Partial<InitialSurveyResponse> = {
          accountGuid: accountGuid,
          responseValue: questionGuidsObj[guid],
          question: question
        };

        const response = await this.initialSurveyRepo.create(_response);

        return response.save();
      }
    });
  }
}
