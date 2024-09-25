import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';

import { Speaker, EntityRelationsLUT, University, Organization, Event } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';

@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  private _resourcePath = `images/speakers/`;

  constructor(
    @InjectRepository(Speaker) private speakerRepo: Repository<Speaker>,
    @InjectRepository(University) private universityRepo: Repository<University>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    private readonly assetService: AssetsService,
    private readonly seasonService: SeasonService
  ) {
    super(speakerRepo);
  }

  public async getSpeakersForSeason(seasonGuid: string) {
    try {
      return this.find({
        where: {
          season: {
            guid: seasonGuid
          }
        },
        relations: EntityRelationsLUT.getRelation('speaker'),
        order: {
          lastName: 'ASC'
        }
      });
    } catch (err) {
      Logger.error(err.message, 'SpeakerProvider');
      throw new InternalServerErrorException('Could not find speakers for season.');
    }
  }

  public async getPresenter(guid: string) {
    return this.speakerRepo.findOne({
      where: {
        guid: guid
      },
      relations: ['organization', 'university', 'images']
    });
  }

  public async getSpeakersForActiveSeason() {
    const season = await this.seasonService.findOneActive();

    if (!season) {
      throw new UnprocessableEntityException('No active season found.');
    }

    return this.getSpeakersForSeason(season.guid);
  }

  public async getSpeakersForActiveSeasonInEvents() {
    const season = await this.seasonService.findOneActive();

    if (!season) {
      return [];
    }

    const eventGuids = season.days
      .map((day) => day.events.map((event) => event.guid))
      .reduce((acc, curr) => {
        return acc.concat(curr);
      });

    const events = await this.eventRepo.find({
      where: {
        guid: In(eventGuids)
      },
      relations: ['speakers', 'speakers.images', 'speakers.organization', 'speakers.university']
    });

    const speakers = events
      .map((event) => event.speakers)
      .reduce((acc, curr) => {
        return acc.concat(curr);
      }, []);

    return speakers.reduce((acc, curr) => {
      const existing = acc.find((speaker) => speaker.guid === curr.guid);

      if (!existing) {
        return acc.concat(curr);
      } else {
        return acc;
      }
    }, []);
  }

  public async getPresenters() {
    return this.speakerRepo.find({
      relations: ['organization', 'university', 'images'],
      order: {
        lastName: 'ASC'
      }
    });
  }

  public async getOrganizationCommittee() {
    return this.speakerRepo.find({
      where: {
        isOrganizer: true
      },
      relations: ['organization', 'university', 'images'],
      order: {
        lastName: 'ASC'
      }
    });
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
      let speakerImage;
      if (file != null || file != undefined) {
        try {
          speakerImage = await this._saveImage(file, guid);
        } catch (err) {
          Logger.error(err.message, 'SpeakerProvider');
          throw new InternalServerErrorException('Could not save speaker image');
        }
      }

      const toSave = {
        ...existing,
        ...incoming,
        isOrganizer: (incoming.isOrganizer as unknown as string) === 'true', // form data coerces boolean to string
        isActive: (incoming.isActive as unknown as string) === 'true', // form data coerces boolean to string
        images: [speakerImage]
      };

      if (speakerImage === undefined) {
        delete toSave.images;
      }

      return this.speakerRepo.save(toSave);
    } else {
      throw new NotFoundException();
    }
  }

  public async insertWithInfo(speaker: DeepPartial<Speaker>, file?) {
    const speakerEnt = this.speakerRepo.create({
      ...speaker,
      isOrganizer: (speaker.isOrganizer as unknown as string) === 'true', // form data coerces boolean to string
      isActive: (speaker.isActive as unknown as string) === 'true' // form data coerces boolean to string
    });

    if (speakerEnt) {
      const savedEntity = await speakerEnt.save();

      if (file != null || file != undefined) {
        try {
          const speakerImage = await this._saveImage(file, savedEntity.guid);

          savedEntity.images = [speakerImage];

          return savedEntity.save();
        } catch (err) {
          Logger.error(err.message, 'SpeakerProvider');
          throw new InternalServerErrorException('Could not save speaker image');
        }
      } else {
        return savedEntity;
      }
    } else {
      throw new UnprocessableEntityException(null, 'Could not create speaker');
    }
  }

  public async copySpeakersIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    const season = await this.seasonService.findOne({
      where: {
        guid: seasonGuid
      }
    });

    if (!season) {
      throw new UnprocessableEntityException('Could not find season.');
    }

    const existingSpeakers = await this.speakerRepo.find({
      where: {
        guid: In(existingEntityGuids)
      },
      relations: ['images', 'university']
    });

    if (!existingSpeakers || existingSpeakers.length === 0) {
      throw new UnprocessableEntityException('Could not find speakers.');
    }

    const newEntities = existingSpeakers.map((entity) => {
      delete entity.guid;
      delete entity.created;
      delete entity.updated;

      if (entity.images?.length > 0) {
        entity.images = entity.images.map((image) => {
          delete image.guid;
          delete image.created;
          delete image.updated;

          return image;
        });
      }

      return this.speakerRepo.create({
        ...entity,
        season
      });
    });

    try {
      return Promise.all(newEntities.map((entity) => entity.save()));
    } catch (err) {
      throw new InternalServerErrorException('Could not copy speakers into season.');
    }
  }

  public async insertBulk(speakers: OldFormatSpeaker[]) {
    // Convert old format to new format
    const activeSeason = await this.seasonService.findOneActive();

    try {
      const organizations = speakers
        .map((s) => s.SpeakerOrganization)
        .filter((org) => org !== '' && org !== null && org !== undefined);
      const uniqueOrganizations = [...new Set(organizations)];

      const existingOrganizations = await this.orgRepo.find({
        where: {
          name: {
            $in: uniqueOrganizations
          }
        }
      });

      const newOrganizations = uniqueOrganizations.filter((org) => {
        return !existingOrganizations.find((existingOrg) => existingOrg.name === org);
      });

      const newOrgEntities = newOrganizations.map((org) => {
        return this.orgRepo.create({
          name: org,
          season: activeSeason
        });
      });

      const savedNewOrgEntities = await this.orgRepo.save(newOrgEntities);

      // Do the same thing with universities

      const universities = speakers
        .map((s) => {
          return {
            name: s.university,
            hexTriplet: s.hexColor
          };
        })
        .filter((uni) => uni.name !== '' && uni.name !== null && uni.name !== undefined);

      const uniqueUniversities = universities.reduce((acc, current) => {
        const x = acc.find((item) => item.name === current.name);

        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      const existingUniversities = await this.universityRepo.find({
        where: {
          name: {
            $in: uniqueUniversities
          }
        }
      });

      const newUniversities = uniqueUniversities.filter((uni) => {
        return !existingUniversities.find((existingUni) => existingUni.name === uni.name);
      });

      const newUniEntities = newUniversities.map((uni) => {
        return this.universityRepo.create({
          name: uni.name,
          hexTriplet: uni.hexTriplet
        });
      });

      const savedNewUniEntities = await this.universityRepo.save(newUniEntities);

      const allOrgs = await this.orgRepo.find();
      const allUnis = await this.universityRepo.find();

      const existingSpeakers = await this.speakerRepo.find({
        where: {
          email: {
            $in: speakers.map((s) => s.SpeakerEmail)
          }
        }
      });

      const speakerEntities = speakers.map((s) => {
        const org = allOrgs.find((org) => org.name === s.SpeakerOrganization);
        const uni = allUnis.find((uni) => uni.name === s.university);

        return this.speakerRepo.create({
          firstName: s.SpeakerFirstName,
          lastName: s.SpeakerLastName,
          description: s.description,
          email: s.SpeakerEmail,
          organization: org,
          university: uni,
          isActive: s.isActive === 1,
          graduationYear: s.tamuYear,
          degree: s.tamuDegree,
          program: s.tamuProgram,
          affiliation: s.affiliation,
          season: activeSeason
        });
      });

      const filteredSpeakerEntities = speakerEntities.filter((speaker) => {
        return !existingSpeakers.find((existingSpeaker) => existingSpeaker.email === speaker.email);
      });

      const savedSpeakerEntities = await this.speakerRepo.save(filteredSpeakerEntities, {
        chunk: 50
      });

      return {
        newOrganizations: savedNewOrgEntities,
        newUniversities: savedNewUniEntities,
        newSpeakers: savedSpeakerEntities
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  private async _saveImage(file, guid: string) {
    return this.assetService.saveAsset(this._resourcePath, file, 'speaker-image', {
      prefix: `${guid}-`
    });
  }
}

export interface OldFormatSpeaker {
  SpeakerFirstName: string;
  SpeakerLastName: string;
  SpeakerEmail: string;
  SpeakerOrganization: string;
  isActive: number;
  tamuYear: string;
  tamuDegree: string;
  tamuProgram: string;
  affiliation: string;
  description: string;
  university: '';
  hexColor: '';
}
