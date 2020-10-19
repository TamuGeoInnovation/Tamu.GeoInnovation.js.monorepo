import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as deepmerge from 'deepmerge';

import { Speaker, SpeakerInfo, SpeakerRepo, SpeakerInfoRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
import { DeepPartial } from 'typeorm';
@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  constructor(private readonly speakerRepo: SpeakerRepo, public readonly speakerInfoRepo: SpeakerInfoRepo) {
    super(speakerRepo);
  }

  public async getPresenter(guid: string) {
    return this.speakerRepo.getPresenter(guid);
  }

  public async getPresenters() {
    return this.speakerRepo.getPresenters();
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

    // if (entity) {
    //   const merged = deepmerge(entity as Partial<SpeakerInfo>, req.body);
    //   return this.speakerInfoRepo.save(merged);
    // } else {
    //   throw new Error('Make sure you use the SpeakerInfo guid');
    // }
  }

  public async insertWithInfo(req: Request, file) {
    const _speaker: DeepPartial<Speaker> = req.body;
    const speakerEnt = this.speakerRepo.create(_speaker);
    const speaker = await this.speakerRepo.save(speakerEnt);
    // const speaker = await this.speakerRepo.findOne({
    //   where: {
    //     guid: speakerGuid
    //   }
    // });
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
