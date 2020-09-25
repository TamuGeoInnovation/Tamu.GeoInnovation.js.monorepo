import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Speaker, SpeakerInfo, SpeakerRepo, SpeakerInfoRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  constructor(private readonly speakerRepo: SpeakerRepo, public readonly speakerInfoRepo: SpeakerInfoRepo) {
    super(speakerRepo);
  }

  async getPresenters() {
    return this.speakerRepo.getPresenters();
  }

  async insertPhoto(speakerGuid: string, req: Request, file: any) {
    const speaker = await this.speakerRepo.findOne({
      where: {
        guid: speakerGuid
      }
    });
    if (speaker) {
      const _photo: Partial<SpeakerInfo> = {
        ...req.body,
        speaker: speaker,
        blob: file.buffer
      };
      const photo = await this.speakerInfoRepo.create(_photo);
      const speakerInfo = await this.speakerInfoRepo.save(photo);
      speaker.speakerInfo = speakerInfo;
      return speaker.save();
    } else {
      throw new Error(`Speaker ${speakerGuid} not found`);
    }
  }
}
