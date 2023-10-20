import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization, Event } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class OrganizationService extends BaseProvider<Organization> {
  private _resourcePath = `images/organizations`;

  constructor(
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    @InjectRepository(Event) private readonly es: Repository<Event>,
    private readonly assetService: AssetsService
  ) {
    super(orgRepo);
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

      return this.orgRepo.save({
        ...existing,
        ...incoming,
        logos: [logoImage]
      });
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
