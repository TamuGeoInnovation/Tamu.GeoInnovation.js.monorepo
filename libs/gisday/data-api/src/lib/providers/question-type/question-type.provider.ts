import { Injectable } from '@nestjs/common';
import { QuestionType, QuestionTypeRepo } from '../../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class QuestionTypeProvider extends BaseProvider<QuestionType> {
  constructor(private readonly questionTypeRepo: QuestionTypeRepo) {
    super(questionTypeRepo);
  }
}
