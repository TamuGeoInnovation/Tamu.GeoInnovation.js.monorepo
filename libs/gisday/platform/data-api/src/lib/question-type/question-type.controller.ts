import { Controller } from '@nestjs/common';

import { QuestionType } from '../entities/all.entity';
import { BaseController } from '../_base/base.controller';
import { QuestionTypeProvider } from './question-type.provider';

@Controller('question-type')
export class QuestionTypeController extends BaseController<QuestionType> {
  constructor(private readonly questionTypeProvider: QuestionTypeProvider) {
    super(questionTypeProvider);
  }
}
