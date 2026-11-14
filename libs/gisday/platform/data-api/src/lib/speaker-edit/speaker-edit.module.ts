import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Season, SeasonDay, Speaker, SpeakerEdit, SpeakerEditLink } from '../entities/all.entity';
import { SpeakerModule } from '../speaker/speaker.module';
import { ContactService } from '../contact/contact.service';
import { SeasonService } from '../season/season.service';
import { SpeakerEditController } from './speaker-edit.controller';
import { SpeakerEditService } from './speaker-edit.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpeakerEditLink, SpeakerEdit, Speaker, Season, SeasonDay]), SpeakerModule],
  controllers: [SpeakerEditController],
  providers: [SpeakerEditService, ContactService, SeasonService]
})
export class SpeakerEditModule {}
