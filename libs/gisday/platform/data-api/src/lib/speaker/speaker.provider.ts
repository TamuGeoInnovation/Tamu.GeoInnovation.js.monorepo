import { Injectable, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeepPartial, Repository } from 'typeorm';
import { Request } from 'express';
import { distinct, filter, from, mergeMap, toArray } from 'rxjs';

import { Speaker, SpeakerImage, University, EntityRelationsLUT, Event } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Speaker) private speakerRepo: Repository<Speaker>,
    @InjectRepository(SpeakerImage) public speakerImageRepo: Repository<SpeakerImage>,
    @InjectRepository(University) public uniRepo: Repository<University>
  ) {
    super(speakerRepo);
  }

  public async getPresenter(guid: string) {
    return from(
      this.speakerRepo.findOne({
        where: {
          guid: guid
        },
        relations: ['image']
      })
    );
  }

  public async getPresenters() {
    const speakers = from(
      this.eventRepo.find({
        where: {
          season: '2022'
        },
        relations: ['speakers', 'speakers.university']
      })
    ).pipe(
      mergeMap((events) => events),
      filter((event) => event.speakers != null),
      mergeMap((event) => event.speakers),
      distinct(({ guid }) => guid),
      filter((speaker) => speaker.isActive),
      toArray()
    );

    return speakers;
  }

  public async getSpeakerPhoto(guid: string) {
    const speakerInfo = await this.speakerImageRepo.findOne({
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

  public async updateWithInfo(guid: string, incoming: DeepPartial<Speaker>, file?) {
    delete incoming.guid;

    const existing = await this.speakerRepo.findOne({
      where: {
        guid: guid
      },
      relations: EntityRelationsLUT.getRelation('speaker')
    });

    if (existing) {
      if (file !== null && file !== undefined) {
        const img = this.speakerImageRepo.create({
          blob: file.buffer
        });

        existing.image = img;
      }

      return this.speakerRepo.save({
        ...existing,
        ...incoming
      });
    } else {
      throw new NotFoundException();
    }
  }

  public async insertWithInfo(speaker: DeepPartial<Speaker>, file?) {
    const speakerInfoEnt = this.speakerImageRepo.create(speaker);

    if (file != null || file != undefined) {
      speakerInfoEnt.blob = file.buffer;
    }

    speaker.image = speakerInfoEnt;

    const speakerEnt = this.speakerRepo.create(speaker);

    if (speakerEnt) {
      const university = await this.uniRepo.findOne({
        where: {
          guid: speaker.university ? speaker.university : ''
        }
      });

      if (university) {
        speaker.university = university;
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
      const _photo: Partial<SpeakerImage> = {
        ...req.body,
        speaker: speaker,
        blob: file.buffer
      };

      const photo = await this.speakerImageRepo.create(_photo);
      const speakerInfo = await this.speakerImageRepo.save(photo);
      speaker.image = speakerInfo;

      return speaker.save();
    } else {
      throw new UnprocessableEntityException(null, `Speaker could not be found`);
    }
  }
}
