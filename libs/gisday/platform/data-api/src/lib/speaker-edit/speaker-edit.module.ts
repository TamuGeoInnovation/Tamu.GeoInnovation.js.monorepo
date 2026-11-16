import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Asset,
  Event,
  Season,
  SeasonDay,
  Speaker,
  SpeakerEdit,
  SpeakerEditLink,
  Submission,
  University
} from '../entities/all.entity';
import { SpeakerModule } from '../speaker/speaker.module';
import { ContactService } from '../contact/contact.service';
import { SeasonService } from '../season/season.service';
import { SpeakerEditController } from './speaker-edit.controller';
import { SpeakerEditService } from './speaker-edit.service';
import { SessionDetailsEmailController } from './session-details-email.controller';
import { SessionDetailsEmailService } from './session-details-email.service';
import { SessionFilesController } from './session-files.controller';
import { SessionFilesService } from './session-files.service';
import { SpeakerEditLinkGuard } from './speaker-edit-link.guard';
import { AssetsService } from '../assets/assets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpeakerEditLink,
      SpeakerEdit,
      Speaker,
      Season,
      SeasonDay,
      University,
      Submission,
      Event,
      Asset
    ]),
    SpeakerModule
  ],
  // The session details email (#3092) sits beside the profile email: both email speakers, behind the same permission.
  // A session's slides (#3093) are reached through the same edit link.
  controllers: [SpeakerEditController, SessionDetailsEmailController, SessionFilesController],
  providers: [
    SpeakerEditService,
    SessionDetailsEmailService,
    ContactService,
    SeasonService,
    SessionFilesService,
    SpeakerEditLinkGuard,
    AssetsService
  ]
})
export class SpeakerEditModule {}
