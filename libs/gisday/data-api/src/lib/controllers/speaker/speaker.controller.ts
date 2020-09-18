import { Controller } from '@nestjs/common';

import { Speaker } from '../../entities/all.entity';
import { SpeakerProvider } from '../../providers/speaker/speaker.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('speaker')
export class SpeakerController extends BaseController<Speaker> {
  constructor(private readonly speakerProvider: SpeakerProvider) {
    super(speakerProvider);
  }
}
