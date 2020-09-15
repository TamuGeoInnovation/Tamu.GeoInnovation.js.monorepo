import { Module } from '@nestjs/common';
import { SpeakerController } from '../../controllers/speaker/speaker.controller';
import { SpeakerProvider } from '../../providers/speaker/speaker.provider';

@Module({
  imports: [],
  controllers: [SpeakerController],
  providers: [SpeakerProvider],
  exports: []
})
export class SpeakerModule {}
