import { Injectable } from '@nestjs/common';

import { Speaker, SpeakerRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  constructor(private readonly speakerRepo: SpeakerRepo) {
    super(speakerRepo);
  }
}
