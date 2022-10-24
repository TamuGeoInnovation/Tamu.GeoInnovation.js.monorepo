import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuestionTypeController } from './question-type.controller';
import { QuestionType } from '../entities/all.entity';
import { QuestionTypeProvider } from './question-type.provider';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionType])],
  controllers: [QuestionTypeController],
  providers: [QuestionTypeProvider],
  exports: []
})
export class QuestionTypeModule {}
