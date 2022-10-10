import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpeakerRepo, SpeakerInfoRepo, UniversityRepo, EventRepo } from '../../entities/all.entity';
import { SpeakerController } from '../../controllers/speaker/speaker.controller';
import { SpeakerProvider } from '../../providers/speaker/speaker.provider';

@Module({
  imports: [TypeOrmModule.forFeature([EventRepo, SpeakerRepo, SpeakerInfoRepo, UniversityRepo])],
  controllers: [SpeakerController],
  providers: [SpeakerProvider],
  exports: []
})
export class SpeakerModule {}
