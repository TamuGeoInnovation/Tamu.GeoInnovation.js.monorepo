import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { QuestionType } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class QuestionTypeProvider extends BaseProvider<QuestionType> {
  constructor(@InjectRepository(QuestionType) private questionTypeRepo: Repository<QuestionType>) {
    super(questionTypeRepo);
  }
}
