import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Request } from 'express';

import { Speaker, SpeakerInfo, SpeakerRepo, SpeakerInfoRepo, UniversityRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  constructor(
    private readonly speakerRepo: SpeakerRepo,
    public readonly speakerInfoRepo: SpeakerInfoRepo,
    public readonly uniRepo: UniversityRepo
  ) {
    super(speakerRepo);
  }

  public async getPresenter(guid: string) {
    const speaker = await this.speakerRepo.getPresenter(guid);
    speaker.speakerInfo.base64representation = speaker.speakerInfo.blob.toString('base64');
    return speaker;
  }

  public async getPresenters() {
    const speakers = await this.speakerRepo.getPresenters();
    speakers.forEach((speaker) => {
      if (speaker.speakerInfo.blob) {
        speaker.speakerInfo.base64representation = speaker.speakerInfo.blob.toString('base64');
      }
    });
    return speakers;
  }

  public async getSpeakerPhoto(guid: string) {
    const speakerInfo = await this.speakerInfoRepo.findOne({
      where: {
        guid: guid
      }
    });
    if (speakerInfo) {
      return speakerInfo.blob.toString('base64');
    }
  }

  public async updateSpeakerInfo(req: Request) {
    const entity = await this.speakerInfoRepo.findOne({
      where: {
        guid: req.body.guid
      }
    });
    if (entity) {
      if (req.body.description) {
        entity.description = req.body.description;
      }
      if (req.body.affiliation) {
        entity.affiliation = req.body.affiliation;
      }
      entity.save();
    }
  }

  public async insertWithInfo(_speaker: DeepPartial<Speaker>, file) {
    const speakerEnt = this.speakerRepo.create(_speaker);
    const speaker = await this.speakerRepo.save(speakerEnt);

    if (speaker) {
      const university = await this.uniRepo.findOne({
        where: {
          guid: _speaker.speakerInfo.university ? _speaker.speakerInfo.university : ''
        }
      });
      const _photo: DeepPartial<SpeakerInfo> = {
        ..._speaker.speakerInfo,
        university: university,
        blob: file.buffer
      };
      const photo = await this.speakerInfoRepo.create(_photo);
      const speakerInfo = await this.speakerInfoRepo.save(photo);
      speaker.speakerInfo = speakerInfo;
      return speaker.save();
    } else {
      throw new Error(`Could not create speaker`);
    }
  }

  public async insertPhoto(speakerGuid: string, req: Request, file) {
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
