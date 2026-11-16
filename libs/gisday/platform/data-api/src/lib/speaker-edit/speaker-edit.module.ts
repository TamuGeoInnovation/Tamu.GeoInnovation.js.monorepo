import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Event, Season, SeasonDay, Speaker, SpeakerEdit, SpeakerEditLink, Submission, University, SessionDetailsSend } from '../entities/all.entity';
import { SpeakerModule } from '../speaker/speaker.module';
import { ContactService } from '../contact/contact.service';
import { SeasonService } from '../season/season.service';
import { SpeakerEditController } from './speaker-edit.controller';
import { SpeakerEditService } from './speaker-edit.service';
import { SessionDetailsEmailController } from './session-details-email.controller';
import { SessionDetailsEmailService } from './session-details-email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpeakerEditLink,
      SpeakerEdit,
      SessionDetailsSend,
      Speaker,
      Season,
      SeasonDay,
      University,
      Submission,
      Event
    ]),
    SpeakerModule
  ],
  // The session details email (#3092) sits beside the profile email: both email speakers, behind the same permission.
  controllers: [SpeakerEditController, SessionDetailsEmailController],
  providers: [SpeakerEditService, SessionDetailsEmailService, ContactService, SeasonService]
})
export class SpeakerEditModule {}
