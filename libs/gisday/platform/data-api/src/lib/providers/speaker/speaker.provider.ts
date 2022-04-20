import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Request } from 'express';
import * as deepmerge from 'deepmerge';

import {
  Speaker,
  SpeakerInfo,
  SpeakerRepo,
  SpeakerInfoRepo,
  UniversityRepo,
  EntityRelationsLUT
} from '../../entities/all.entity';
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
    const speaker = await this.speakerRepo.findOne({
      where: {
        guid: guid
      },
      relations: ['speakerInfo']
    });
    // speaker.speakerInfo.base64representation = speaker.speakerInfo.blob.toString('base64');
    return speaker;
  }

  public async getPresenters() {
    const speakers = await this.speakerRepo.getPresenters();
    speakers.forEach((speaker) => {
      // if (speaker.speakerInfo.blob) {
      //   speaker.speakerInfo.base64representation = speaker.speakerInfo.blob.toString('base64');
      // }
    });
    return speakers;
  }

  // public async getSpeakerPhoto(guid: string) {
  //   const speakerInfo = await this.speakerInfoRepo.findOne({
  //     where: {
  //       guid: guid
  //     }
  //   });
  //   if (speakerInfo) {
  //     return speakerInfo.blob.toString('base64');
  //   } else {
  //     throw new Error('Could not find speakerInfo with provided guid');
  //   }
  // }

  // public async updateWithInfo(incoming: DeepPartial<Speaker>, file?) {
  //   const existing = await this.speakerRepo.findOne({
  //     where: {
  //       guid: incoming.guid
  //     },
  //     relations: EntityRelationsLUT.getRelation('speaker')
  //   });

  //   if (file != null || file != undefined) {
  //     existing.speakerInfo.blob = file.buffer;
  //   }

  //   const incomingKeys = Object.keys(existing);
  //   incomingKeys.forEach((key) => {
  //     // if key exists in existing, set existings value to whatever incomings is
  //     if (existing[key]) {
  //       existing[key] = incoming[key] ? incoming[key] : null;
  //     } else if (existing.speakerInfo[key]) {
  //       existing.speakerInfo[key] = incoming[key] ? incoming[key] : null;
  //     }
  //   });

  //   // const speakerKeys = Object.keys(existing);
  //   // speakerKeys.forEach((key) => {
  //   //   // if key exists in incoming, set existings value to whatever incomings is
  //   //   if (incoming[key]) {
  //   //     existing[key] = incoming[key] ? incoming[key] : null;
  //   //   }
  //   // });

  //   // const infoKeys = Object.keys(existing.speakerInfo);
  //   // infoKeys.forEach((key) => {
  //   //   if (incoming[key] && key !== 'guid') {
  //   //     existing.speakerInfo[key] = incoming[key] ? incoming[key] : null;
  //   //   }
  //   // });

  //   existing.updated = new Date(Date.now());

  //   existing.save();
  // }

  public async update(incoming: DeepPartial<Speaker>, file?) {
    try {
      const info = this.speakerInfoRepo.create(incoming.speakerInfo);

      const existingSpeaker = await this.speakerRepo.findOne({
        where: {
          guid: incoming.guid
        }
      });

      incoming.speakerInfo = info;

      const updatedSpeaker = this.speakerRepo.create(incoming);

      if (updatedSpeaker) {
        return updatedSpeaker.save();
      }
    } catch (error) {
      throw new Error('Could not update speaker');
    }
  }

  public async insertWithInfo(_speaker: DeepPartial<Speaker>, file?) {
    const speakerInfoEnt = this.speakerInfoRepo.create(_speaker);

    if (file != null || file != undefined) {
      speakerInfoEnt.blob = file.buffer;
    }

    _speaker.speakerInfo = speakerInfoEnt;
    // speakerInfoEnt.save();
    const speakerEnt = this.speakerRepo.create(_speaker);

    // const speaker = await this.speakerRepo.save(speakerEnt);

    if (speakerEnt) {
      const university = await this.uniRepo.findOne({
        where: {
          guid: _speaker.speakerInfo.university ? _speaker.speakerInfo.university : ''
        }
      });
      // const _photo: DeepPartial<SpeakerInfo> = {
      //   ..._speaker.speakerInfo,
      //   university: university,
      //   blob: file.buffer
      // };
      // const photo = await this.speakerInfoRepo.create(_photo);
      if (university) {
        speakerInfoEnt.university = university;
      }
      // const speakerInfo = await this.speakerInfoRepo.save(photo);
      // speakerEnt.speakerInfo = speakerInfo;
      // speakerInfoEnt.save();
      return speakerEnt.save();
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
