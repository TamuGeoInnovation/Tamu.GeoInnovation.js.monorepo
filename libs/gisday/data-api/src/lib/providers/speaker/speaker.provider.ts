import { Injectable } from '@nestjs/common';

import { Speaker, SpeakerPhoto, SpeakerRepo, SpeakerPhotoRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  constructor(private readonly speakerRepo: SpeakerRepo, public readonly speakerPhotoRepo: SpeakerPhotoRepo) {
    super(speakerRepo);
  }

  async insertPhoto(speakerGuid: string, file: any) {
    const _photo: Partial<SpeakerPhoto> = {
      speakerGuid: speakerGuid,
      blob: file.buffer
    };
    const photo = await this.speakerPhotoRepo.create(_photo);
    debugger;
    return this.speakerPhotoRepo.insert(photo);
  }
}
