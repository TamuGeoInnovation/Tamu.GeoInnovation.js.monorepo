import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository, DeepPartial } from 'typeorm';

import { Organization, Event, Asset, Speaker, Season } from '../entities/all.entity';
import { AssetsService } from '../assets/assets.service';
import { refuseUnsafeImage } from '../assets/image-upload';
import { SeasonService } from '../season/season.service';
import { rethrowHttp } from '../_base/rethrow-http';
import { SeasonScopedProvider, withoutIdentity } from '../_base/season-scoped-provider';

@Injectable()
export class OrganizationService extends SeasonScopedProvider<Organization> {
  protected get seasons() {
    return this.ss;
  }

  protected readonly recordsName = 'organizations';

  protected forSeason(seasonGuid: string) {
    return this.getOrganizationsForSeason(seasonGuid);
  }

  protected override readonly copyRelations = { logos: true };

  protected override copyOf(record: Organization, season: Season) {
    // A logo is an asset held by one organization, so the copy has its own.
    const copy = super.copyOf(record, season) as DeepPartial<Organization>;

    if (record.logos) {
      copy.logos = record.logos.map(withoutIdentity);
    }

    return copy;
  }

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
        relations: { season: true, logos: true },
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not find organizations for season.'), () =>
        Logger.error(err.message, 'OrganizationService')
      );
    }
  }

  public async getOrganizationsForActiveSeason() {
    return this.forActiveSeason();
  }

  public getOrganizations() {
    try {
      return this.find({
        relations: { season: true, logos: true },
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not find organizations.'), () =>
        Logger.error(err.message, 'OrganizationService')
      );
    }
  }

  public getOrganization(guid: string) {
    try {
      return this.findOne({
        where: {
          guid
        },
        relations: { season: true, logos: true }
      });
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not find organization.'), () =>
        Logger.error(err.message, 'OrganizationService')
      );
    }
  }

  public async createOrganization(organization: Partial<Organization>, file?: Express.Multer.File) {
    // Checked before anything is saved, so a refused logo leaves nothing behind (#2937).
    file = file ? refuseUnsafeImage(file, 'The logo') : file;

    const orgEnt = this.orgRepo.create({
      ...organization
    });

    const savedEntity = await orgEnt.save();

    if (file) {
      try {
        const savedLogo = await this._saveImage(file);

        savedEntity.logos = [savedLogo];

        return savedEntity.save();
      } catch (err) {
        rethrowHttp(err, new InternalServerErrorException('Could not save organization logo.'), () =>
          Logger.error(err.message, 'OrganizationService')
        );
      }
    } else {
      return savedEntity;
    }
  }

  public async copyOrganizationsIntoSeason(seasonGuid: string, entityGuids: Array<string>) {
    return this.copyIntoSeason(seasonGuid, entityGuids);
  }

  public async updateOrganization(guid: string, incoming: Partial<Organization>, file?: Express.Multer.File) {
    // Checked before anything is saved, so a refused logo leaves nothing behind (#2937).
    file = file ? refuseUnsafeImage(file, 'The logo') : file;

    delete incoming.guid;

    const existing = await this.orgRepo.findOne({
      where: {
        guid: guid
      },
      relations: { logos: true }
    });

    if (existing) {
      let logoImage;

      if (file) {
        try {
          logoImage = await this._saveImage(file);
        } catch (err) {
          rethrowHttp(err, new InternalServerErrorException('Could not save organization logo.'), () =>
            Logger.error(err.message, 'OrganizationService')
          );
        }
      }

      // An organization as saved, whose logos may be left out: without a new logo they are, and stay as they are.
      const toSave: DeepPartial<Organization> = {
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
      relations: { speakers: { organization: true } }
    });

    // Pluck out all orgs from event speakers.
    //
    // Speakers without an organization are dropped here rather than carried into the
    // de-duplication below, which reads `org.guid` and threw a TypeError on them. That state is
    // not bad data -- `deleteEntities` further down sets `speaker.organization = null` on every
    // speaker of an organization it removes, so deleting an organization used to break this
    // endpoint for every caller until those speakers were reassigned.
    const orgs = events.reduce((acc, curr) => {
      const orgs = (curr.speakers ?? []).map((s) => s.organization).filter((o) => o != null);

      return [...acc, ...orgs];
    }, []);

    // filter out duplicates

    const uniqueOrgs = orgs.filter((org, index, self) => {
      return self.findIndex((o) => o.guid === org.guid) === index;
    });

    return uniqueOrgs;
  }

  public override async deleteEntities(oneOrMoreEntityGuids: Array<string> | string): Promise<DeleteResult> {
    const guids = typeof oneOrMoreEntityGuids === 'string' ? oneOrMoreEntityGuids.split(',') : oneOrMoreEntityGuids;
    let logos: Array<Asset> = [];

    try {
      // Awaited, so a failed delete lands in the catch below; the logos go by guid and their files after commit (#2205).
      const result = await this.orgRepo.manager.transaction(async (manager) => {
        const orgs = await manager.find(Organization, {
          where: {
            guid: In(guids)
          },
          relations: { logos: true }
        });

        // `logos` is loaded by this find's `relations`.
        logos = orgs.flatMap((org) => org.logos!);

        await this.assetService.deleteAssets(manager, logos);

        const speakers = await manager.find(Speaker, {
          where: {
            organization: In(guids)
          }
        });

        if (speakers.length > 0) {
          speakers.forEach((speaker) => {
            speaker.organization = null;
          });

          await manager.save(Speaker, speakers, { chunk: 25 });
        }

        return manager.delete(Organization, guids);
      });

      await this.assetService.deleteAssetFiles(logos);

      return result;
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not delete entities'), () =>
        Logger.error(err.message, 'OrganizationService.deleteEntities')
      );
    }
  }

  private async _saveImage(file) {
    return this.assetService.saveAsset(this._resourcePath, file, 'organization-logo');
  }
}
