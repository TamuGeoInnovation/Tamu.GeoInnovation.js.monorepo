import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Organization, Event } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';

@Injectable()
export class OrganizationService extends BaseProvider<Organization> {
  private _resourcePath = `images/organizations`;

  constructor(
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    @InjectRepository(Event) private readonly es: Repository<Event>,
    private readonly ss: SeasonService,
    private readonly assetService: AssetsService
  ) {
    super(orgRepo);
  }

  public async getOrganizationsForSeason(guid: string) {
    try {
      return this.find({
        where: {
          season: {
            guid
          }
        },
        relations: ['season', 'logos'],
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      Logger.error(err.message, 'OrganizationService');
      throw new InternalServerErrorException('Could not find organizations for season.');
    }
  }

  public async getOrganizationsForActiveSeason() {
    const activeSeason = await this.ss.findOneActive();

    try {
      return this.find({
        where: {
          season: activeSeason
        },
        relations: ['season', 'logos'],
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      Logger.error(err.message, 'OrganizationService');
      throw new InternalServerErrorException('Could not find organizations for active season.');
    }
  }

  public getOrganizations() {
    try {
      return this.find({
        relations: ['season', 'logos'],
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      Logger.error(err.message, 'OrganizationService');
      throw new InternalServerErrorException('Could not find organizations.');
    }
  }

  public getOrganization(guid: string) {
    try {
      return this.findOne({
        where: {
          guid
        },
        relations: ['season', 'logos']
      });
    } catch (err) {
      Logger.error(err.message, 'OrganizationService');
      throw new InternalServerErrorException('Could not find organization.');
    }
  }

  public async createOrganization(organization: Partial<Organization>, file?: Express.Multer.File) {
    const orgEnt = this.orgRepo.create({
      ...organization
    });

    if (orgEnt) {
      const savedEntity = await orgEnt.save();

      if (file != null || file != undefined) {
        try {
          const savedLogo = await this._saveImage(file);

          savedEntity.logos = [savedLogo];

          return savedEntity.save();
        } catch (err) {
          Logger.error(err.message, 'OrganizationService');
          throw new InternalServerErrorException('Could not save organization logo.');
        }
      } else {
        return savedEntity;
      }
    } else {
      throw new UnprocessableEntityException(null, 'Could not create organization.');
    }
  }

  public async copyOrganizationsIntoSeason(seasonGuid: string, entityGuids: Array<string>) {
    const season = await this.ss.findOne(seasonGuid);

    if (!season) {
      throw new UnprocessableEntityException('Could not find season.');
    }

    const entities = await this.find({
      where: {
        guid: In(entityGuids)
      },
      relations: ['logos']
    });

    if (!entities || entities.length === 0) {
      throw new UnprocessableEntityException('Could not find organizations.');
    }

    const newEntities = entities.map((entity) => {
      delete entity.guid;

      // Delete references to logos to prevent the logo from being transferred from one org to another
      // since the asset entity is a one-to-one relationship
      if (entity.logos) {
        entity.logos = entity.logos.map((logo) => {
          delete logo.guid;
          return logo;
        });
      }

      const newEntity = this.orgRepo.create({
        ...entity,
        season
      });

      return newEntity.save();
    });

    try {
      return Promise.all(newEntities);
    } catch (err) {
      throw new InternalServerErrorException('Could not copy organizations into season.');
    }
  }

  public async updateOrganization(guid: string, incoming: Partial<Organization>, file?: Express.Multer.File) {
    delete incoming.guid;

    const existing = await this.orgRepo.findOne({
      where: {
        guid: guid
      },
      relations: ['logos']
    });

    if (existing) {
      let logoImage;

      if (file != null || file != undefined) {
        try {
          logoImage = await this._saveImage(file);
        } catch (err) {
          Logger.error(err.message, 'OrganizationService');
          throw new InternalServerErrorException('Could not save organization logo.');
        }
      }

      const toSave = {
        ...existing,
        ...incoming,
        logos: [logoImage]
      };

      if (logoImage === undefined) {
        delete toSave.logos;
      }

      return this.orgRepo.save(toSave);
    } else {
      throw new NotFoundException();
    }
  }

  public async getOrgsWithEvents() {
    const events = await this.es.find({
      relations: ['speakers', 'speakers.organization']
    });

    // Pluck out all orgs from event speakers

    const orgs = events.reduce((acc, curr) => {
      const orgs = curr.speakers.map((s) => s.organization);

      return [...acc, ...orgs];
    }, []);

    // filter out duplicates

    const uniqueOrgs = orgs.filter((org, index, self) => {
      return self.findIndex((o) => o.guid === org.guid) === index;
    });

    return uniqueOrgs;
  }

  private async _saveImage(file) {
    return this.assetService.saveAsset(this._resourcePath, file, 'organization-logo');
  }
}
