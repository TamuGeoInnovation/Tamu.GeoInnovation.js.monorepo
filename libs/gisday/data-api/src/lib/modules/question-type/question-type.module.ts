import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuestionTypeController } from '../../controllers/question-type/question-type.controller';
import { QuestionTypeRepo } from '../../entities/all.entity';
import { QuestionTypeProvider } from '../../providers/question-type/question-type.provider';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionTypeRepo])],
  controllers: [QuestionTypeController],
  providers: [QuestionTypeProvider],
  exports: []
})
export class QuestionTypeModule {}
