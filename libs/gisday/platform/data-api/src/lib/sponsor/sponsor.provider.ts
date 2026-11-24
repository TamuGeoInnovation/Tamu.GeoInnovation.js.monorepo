import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository, DeepPartial } from 'typeorm';

import { Asset, Sponsor, SponsorLogoSize, Season } from '../entities/all.entity';
import { AssetsService } from '../assets/assets.service';
import { refuseUnsafeImage } from '../assets/image-upload';
import { SeasonService } from '../season/season.service';
import { rethrowHttp } from '../_base/rethrow-http';
import { SeasonScopedProvider, withoutIdentity } from '../_base/season-scoped-provider';
@Injectable()
export class SponsorProvider extends SeasonScopedProvider<Sponsor> {
  protected get seasons() {
    return this.seasonService;
  }

  protected readonly recordsName = 'sponsors';

  protected forSeason(seasonGuid: string) {
    return this.getSponsorsForSeason(seasonGuid);
  }

  protected override readonly copyRelations = { logos: true };

  protected override copyOf(record: Sponsor, season: Season) {
    // A logo is an asset held by one sponsor, so the copy has its own.
    const copy = super.copyOf(record, season) as DeepPartial<Sponsor>;

    if (record.logos) {
      copy.logos = record.logos.map(withoutIdentity);
    }

    return copy;
  }

  private _resourcePath = `images/sponsors`;

  constructor(
    @InjectRepository(Sponsor) private sponsorRepo: Repository<Sponsor>,
    private readonly assetService: AssetsService,
    private readonly seasonService: SeasonService
  ) {
    super(sponsorRepo);
  }

  public async getSponsorsForSeason(seasonGuid: string) {
    try {
      const season = await this.seasonService.findOne({
        where: {
          guid: seasonGuid
        }
      });

      if (!season) {
        throw new UnprocessableEntityException('Season does not exist.');
      }

      return this.find({
        where: {
          season: { guid: season.guid }
        },
        relations: { season: true, logos: true },
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not find sponsors for season.'), () =>
        Logger.error(err.message, 'SponsorProvider')
      );
    }
  }

  public async getSponsorsForActiveSeason() {
    return this.forActiveSeason();
  }

  public async copyEntitiesIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    return this.copyIntoSeason(seasonGuid, existingEntityGuids);
  }

  public async createSponsor(sponsor: Partial<Sponsor>, file?: Express.Multer.File) {
    // Checked before anything is saved, so a refused logo leaves nothing behind (#2937).
    file = file ? refuseUnsafeImage(file, 'The logo') : file;

    const sponsorEnt = this.sponsorRepo.create({
      ...withLogoSize(withActiveFlag(sponsor))
    });

    if (sponsorEnt) {
      const savedEntity = await sponsorEnt.save();

      if (file != null || file != undefined) {
        try {
          const savedLogo = await this._saveImage(file);

          savedEntity.logos = [savedLogo];

          return savedEntity.save();
        } catch (err) {
          rethrowHttp(err, new InternalServerErrorException('Could not save sponsor logo.'), () =>
            Logger.error(err.message, 'SponsorProvider')
          );
        }
      } else {
        return savedEntity;
      }
    } else {
      throw new UnprocessableEntityException(null, 'Could not create sponsor.');
    }
  }

  public async updateSponsor(guid: string, incoming: Partial<Sponsor>, file?: Express.Multer.File) {
    // Checked before anything is saved, so a refused logo leaves nothing behind (#2937).
    file = file ? refuseUnsafeImage(file, 'The logo') : file;

    delete incoming.guid;
    incoming = withLogoSize(withActiveFlag(incoming));

    const existing = await this.sponsorRepo.findOne({
      where: {
        guid: guid
      },
      relations: { logos: true }
    });

    if (existing) {
      let logoImage;

      if (file != null || file != undefined) {
        try {
          logoImage = await this._saveImage(file);
        } catch (err) {
          rethrowHttp(err, new InternalServerErrorException('Could not save sponsor logo.'), () =>
            Logger.error(err.message, 'SponsorProvider')
          );
        }
      }

      const toSave = {
        ...existing,
        ...incoming,
        logos: [logoImage]
      };

      if (!logoImage) {
        delete toSave.logos;
      }

      return this.sponsorRepo.save(toSave);
    } else {
      throw new NotFoundException();
    }
  }

  public override async deleteEntities(oneOrMoreEntityGuids: Array<string> | string): Promise<DeleteResult> {
    const guids = typeof oneOrMoreEntityGuids === 'string' ? oneOrMoreEntityGuids.split(',') : oneOrMoreEntityGuids;
    let logos: Array<Asset> = [];

    try {
      // Awaited, so a failed delete lands in the catch below rather than reaching the caller as the raw database error.
      const result = await this.sponsorRepo.manager.transaction(async (manager) => {
        const sponsors = await manager.find(Sponsor, {
          where: {
            guid: In(guids)
          },
          relations: { logos: true }
        });

        logos = sponsors.map((sponsor) => sponsor.logos).flat();

        await this.assetService.deleteAssets(manager, logos);

        return manager.delete(Sponsor, guids);
      });

      // Only once the rows are gone: a rolled-back delete must not leave a sponsor pointing at a removed file.
      await this.assetService.deleteAssetFiles(logos);

      return result;
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not delete entities.'), () =>
        Logger.error(err.message, 'SponsorProvider.deleteEntities')
      );
    }
  }

  private async _saveImage(file) {
    return this.assetService.saveAsset(this._resourcePath, file, 'sponsor-logo');
  }
}

/**
 * The sponsor with `active` as a boolean. Form data sends it as the text "true" or "false", JSON as a
 * boolean; anything else is left out, so an update that does not mention it leaves it as it was (#1962).
 */
export function withActiveFlag<T extends Partial<Sponsor>>(sponsor: T): T {
  const value = (sponsor as { active?: unknown })?.active;
  const copy = { ...sponsor };

  if (value === true || value === 'true') {
    copy.active = true;
  } else if (value === false || value === 'false') {
    copy.active = false;
  } else {
    delete copy.active;
  }

  return copy;
}

const LOGO_SIZES: ReadonlyArray<SponsorLogoSize> = ['small', 'regular', 'large', 'extra-large'];

/**
 * The sponsor with `logoSize` kept only when it is one of the sizes the Sponsors page draws. Anything
 * else is left out, so a new sponsor gets the column's default and an update leaves the size as it
 * was (#2638).
 */
export function withLogoSize<T extends Partial<Sponsor>>(sponsor: T): T {
  const copy = { ...sponsor };

  if (!LOGO_SIZES.includes(copy.logoSize)) {
    delete copy.logoSize;
  }

  return copy;
}
