import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Assessment, Event, Rubric, RubricCriterion, Season, Speaker, Submission } from '../entities/all.entity';
import { SpeakerEditModule } from '../speaker-edit/speaker-edit.module';
import { JudgeLinkGuard } from './judge-link.guard';
import { JudgingController, JudgingEmailController, RubricController } from './judging.controller';
import { JudgingEmailService } from './judging-email.service';
import { JudgingService } from './judging.service';
import { RubricService } from './rubric.service';

/**
 * Judging the research competitions (#3183): the rubrics, the judges' link pages, the Ask to judge email and the results.
 * Its links are speakers' links with a purpose of their own, made and checked by the speaker links' service.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Rubric, RubricCriterion, Assessment, Event, Submission, Speaker, Season]),
    SpeakerEditModule
  ],
  controllers: [RubricController, JudgingController, JudgingEmailController],
  providers: [RubricService, JudgingService, JudgingEmailService, JudgeLinkGuard]
})
export class JudgingModule {}
