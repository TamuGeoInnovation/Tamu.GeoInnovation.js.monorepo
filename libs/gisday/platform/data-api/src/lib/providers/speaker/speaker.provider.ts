import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { DeepPartial } from 'typeorm';
import { Request } from 'express';
import { distinct, filter, from, switchMap, toArray } from 'rxjs';

import {
  Speaker,
  SpeakerInfo,
  SpeakerRepo,
  SpeakerInfoRepo,
  UniversityRepo,
  EntityRelationsLUT,
  EventRepo
} from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  constructor(
    private readonly eventRepo: EventRepo,
    private readonly speakerRepo: SpeakerRepo,
    public readonly speakerInfoRepo: SpeakerInfoRepo,
    public readonly uniRepo: UniversityRepo
  ) {
    super(speakerRepo);
  }

  public async getPresenter(guid: string) {
    return from(
      this.speakerRepo.findOne({
        where: {
          guid: guid
        },
        relations: ['speakerInfo']
      })
    );
  }

  public async getPresenters() {
    const speakers = from(
      this.eventRepo.find({
        // select: ['guid', 'speakers'],
        where: {
          season: '2022'
        },
        relations: ['speakers', 'speakers.speakerInfo', 'speakers.speakerInfo.university']
      })
    ).pipe(
      switchMap((events) => events),
      filter((event) => event.speakers != null),
      switchMap((event) => event.speakers),
      distinct(({ guid }) => guid),
      filter((speaker) => speaker.isActive),
      toArray()
    );

    // const speakers = await this.speakerRepo.find({
    //   where: {
    //     isActive: true
    //   },
    //   relations: ['speakerInfo']
    // });

    // speakers.forEach((speaker) => {
    //   if (speaker.speakerInfo.blob) {
    //     speaker.speakerInfo.base64representation = speaker.speakerInfo.blob.data.toString();
    //   }
    // });

    return speakers;
  }

  public async getSpeakerPhoto(guid: string) {
    const speakerInfo = await this.speakerInfoRepo.findOne({
      where: {
        guid: guid
      }
    });

    if (speakerInfo) {
      return speakerInfo.blob.data.toString();
    } else {
      throw new UnprocessableEntityException(null, 'Could not find speakerInfo with provided guid');
    }
  }

  public async updateWithInfo(incoming: DeepPartial<Speaker>, file?) {
    const existing = await this.speakerRepo.findOne({
      where: {
        guid: incoming.guid
      },
      relations: EntityRelationsLUT.getRelation('speaker')
    });

    if (file !== null || file !== undefined) {
      existing.speakerInfo.blob = file.buffer;
    }

    const incomingKeys = Object.keys(existing);
    incomingKeys.forEach((key) => {
      // if key exists in existing, set existings value to whatever incomings is
      if (existing[key]) {
        existing[key] = incoming[key] ? incoming[key] : null;
      } else if (existing.speakerInfo[key]) {
        existing.speakerInfo[key] = incoming[key] ? incoming[key] : null;
      }
    });

    existing.updated = new Date(Date.now());

    existing.save();
  }

  public async insertWithInfo(_speaker: DeepPartial<Speaker>, file?) {
    const speakerInfoEnt = this.speakerInfoRepo.create(_speaker);

    if (file != null || file != undefined) {
      speakerInfoEnt.blob = file.buffer;
    }

    _speaker.speakerInfo = speakerInfoEnt;

    const speakerEnt = this.speakerRepo.create(_speaker);

    if (speakerEnt) {
      const university = await this.uniRepo.findOne({
        where: {
          guid: _speaker.speakerInfo.university ? _speaker.speakerInfo.university : ''
        }
      });

      if (university) {
        speakerInfoEnt.university = university;
      }

      return speakerEnt.save();
    } else {
      throw new UnprocessableEntityException(null, 'Could not create speaker');
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
      throw new UnprocessableEntityException(null, `Speaker could not be found`);
    }
  }
}
