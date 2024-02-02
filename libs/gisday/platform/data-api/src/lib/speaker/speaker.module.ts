import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Speaker, University, Event, Asset, Season, SeasonDay, Organization } from '../entities/all.entity';
import { SpeakerController } from './speaker.controller';
import { SpeakerProvider } from './speaker.provider';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [TypeOrmModule.forFeature([Speaker, University, Event, Asset, Season, SeasonDay, Organization])],
  controllers: [SpeakerController],
  providers: [SpeakerProvider, AssetsService, SeasonService],
  exports: []
})
export class SpeakerModule {}
