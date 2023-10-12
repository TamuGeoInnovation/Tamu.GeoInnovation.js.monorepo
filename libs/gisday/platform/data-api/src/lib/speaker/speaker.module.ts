import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Speaker, University, Event, Asset } from '../entities/all.entity';
import { SpeakerController } from './speaker.controller';
import { SpeakerProvider } from './speaker.provider';
import { AssetsService } from '../assets/assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Speaker, University, Event, Asset])],
  controllers: [SpeakerController],
  providers: [SpeakerProvider, AssetsService],
  exports: []
})
export class SpeakerModule {}
