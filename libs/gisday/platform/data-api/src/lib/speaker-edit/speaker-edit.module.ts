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
  SessionDetailsSend,
  SpeakerEmailSend,
  Submission,
  University
} from '../entities/all.entity';
import { SpeakerModule } from '../speaker/speaker.module';
import { ContactService } from '../contact/contact.service';
import { EmailSenderService } from '../contact/email-sender.service';
import { SeasonService } from '../season/season.service';
import { SpeakerEditController } from './speaker-edit.controller';
import { SpeakerEditService } from './speaker-edit.service';
import { SessionDetailsEmailController } from './session-details-email.controller';
import { SessionDetailsEmailService } from './session-details-email.service';
import { SlidesRequestEmailController } from './slides-request-email.controller';
import { SlidesRequestEmailService } from './slides-request-email.service';
import { SessionFilesController } from './session-files.controller';
import { SessionFilesService } from './session-files.service';
import { SpeakerEditLinkGuard } from './speaker-edit-link.guard';
import { EmailSendLog } from './email-send-log';
import { AssetsService } from '../assets/assets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpeakerEditLink,
      SpeakerEmailSend,
      SessionDetailsSend,
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
  // A session's slides (#3093) are reached through the same edit link, which the Ask for slides email (#3113) sends.
  controllers: [SpeakerEditController, SessionDetailsEmailController, SlidesRequestEmailController, SessionFilesController],
  providers: [
    SpeakerEditService,
    SessionDetailsEmailService,
    SlidesRequestEmailService,
    ContactService,
    EmailSenderService,
    SeasonService,
    SessionFilesService,
    SpeakerEditLinkGuard,
    AssetsService,
    // What each speaker was sent (#3167), written by every send above and read by their previews.
    EmailSendLog
  ],
  // For judging (#3183): its links are speakers' links, and its email is one more speaker email.
  exports: [SpeakerEditService, EmailSendLog, ContactService, EmailSenderService]
})
export class SpeakerEditModule {}
