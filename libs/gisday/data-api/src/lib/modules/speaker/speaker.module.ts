import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpeakerRepo, SpeakerPhotoRepo } from '../../entities/all.entity';
import { SpeakerController } from '../../controllers/speaker/speaker.controller';
import { SpeakerProvider } from '../../providers/speaker/speaker.provider';

@Module({
  imports: [TypeOrmModule.forFeature([SpeakerRepo, SpeakerPhotoRepo])],
  controllers: [SpeakerController],
  providers: [SpeakerProvider],
  exports: []
})
export class SpeakerModule {}
