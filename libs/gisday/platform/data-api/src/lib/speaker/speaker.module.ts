import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Speaker, SpeakerInfo, University, Event } from '../entities/all.entity';
import { SpeakerController } from './speaker.controller';
import { SpeakerProvider } from './speaker.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Speaker, SpeakerInfo, University, Event])],
  controllers: [SpeakerController],
  providers: [SpeakerProvider],
  exports: []
})
export class SpeakerModule {}
