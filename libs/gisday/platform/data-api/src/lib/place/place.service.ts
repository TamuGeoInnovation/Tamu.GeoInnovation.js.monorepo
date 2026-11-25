import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository, DeepPartial } from 'typeorm';

import { Asset, EventBroadcast, EventLocation, Place, PlaceLink, Season } from '../entities/all.entity';
import { AssetsService } from '../assets/assets.service';
import { refuseUnsafeImage } from '../assets/image-upload';
import { SeasonService } from '../season/season.service';
import { rethrowHttp } from '../_base/rethrow-http';
import { SeasonScopedProvider, withoutIdentity } from '../_base/season-scoped-provider';

@Injectable()
export class PlaceService extends SeasonScopedProvider<Place> {
  protected get seasons() {
    return this.seasonService;
  }

  protected readonly recordsName = 'places';

  protected forSeason(seasonGuid: string) {
    return this.getPlacesForSeason(seasonGuid);
  }

  protected override readonly copyRelations = { links: true, logos: true };

  protected override copyOf(record: Place, season: Season) {
    // Logos and links are held by one place, so the copy has its own.
    const copy = super.copyOf(record, season) as DeepPartial<Place>;

    if (record.logos) {
      copy.logos = record.logos.map(withoutIdentity);
    }

    if (record.links) {
      copy.links = record.links.map(withoutIdentity);
    }

    return copy;
  }

  private _resourcePath = `images/places`;

  constructor(
    @InjectRepository(Place) private pRepo: Repository<Place>,
    @InjectRepository(PlaceLink) private plRepo: Repository<PlaceLink>,
    private readonly assetService: AssetsService,
    private readonly seasonService: SeasonService
  ) {
    super(pRepo);
  }

  public async getPlacesForSeason(seasonGuid: string) {
    try {
      return this.pRepo
        .createQueryBuilder('place')
        .leftJoinAndSelect('place.links', 'links')
        .leftJoinAndSelect('place.logos', 'logos')
        .leftJoin('place.season', 'season')
        .where('season.guid = :seasonGuid', { seasonGuid })
        .orderBy('place.name', 'ASC')
        .addOrderBy('links.label', 'ASC')
        .getMany();
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err), () =>
        Logger.error(`Error retrieving places for season, ${err.message}`, 'PlaceService')
      );
    }
  }

  public async getPlacesForActiveSeason() {
    return this.forActiveSeason();
  }

  public getEntity(guid: string) {
    try {
      return this.pRepo
        .createQueryBuilder('place')
        .leftJoinAndSelect('place.links', 'links')
        .leftJoinAndSelect('place.logos', 'logos')
        .orderBy('links.label', 'ASC')
        .where('place.guid = :guid', { guid })
        .getOne();
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err), () =>
        Logger.error(`Error retrieving place, ${err.message}`, 'PlaceService')
      );
    }
  }

  public getEntities() {
    try {
      return this.pRepo
        .createQueryBuilder('place')
        .leftJoinAndSelect('place.links', 'links')
        .leftJoinAndSelect('place.logos', 'logos')
        .orderBy('place.name', 'ASC')
        .addOrderBy('links.label', 'ASC')
        .getMany();
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err), () =>
        Logger.error(`Error retrieving places, ${err.message}`, 'PlaceService')
      );
    }
  }

  public async copyPlacesIntoSeason(seasonGuid: string, existingEntityGuids?: Array<string>) {
    return this.copyIntoSeason(seasonGuid, existingEntityGuids);
  }

  public async createPlace(place: Partial<Place>, file?: Express.Multer.File) {
    // Checked before anything is saved, so a refused logo leaves nothing behind (#2937).
    file = file ? refuseUnsafeImage(file, 'The logo') : file;

    try {
      let links: Array<PlaceLink> = [];
      const visibilitySettings = this._deserializeStringifiedJSON(place.visibilitySettings as unknown as string);

      if (place.links && place.links.length > 0) {
        // Because the payload is formData, we need to parse the stringified JSON
        const parsed: Array<Partial<PlaceLink>> = JSON.parse(place.links as unknown as string);

        links = parsed.map((link) => {
          delete link.guid;

          return this.plRepo.create({ ...link });
        });
      }

      const created = this.pRepo.create({ ...place, links, visibilitySettings });

      const saved = await this.pRepo.save(created);

      if (file != null || file != undefined) {
        try {
          const savedLogo = await this._saveImage(file);

          saved.logos = [savedLogo];

          return saved.save();
        } catch (err) {
          rethrowHttp(err, new InternalServerErrorException('Could not save place logo.'), () =>
            Logger.error(err.message, 'PlaceService')
          );
        }
      } else {
        return saved;
      }
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err), () =>
        Logger.error(`Error creating place, ${err.message}`, 'PlaceService')
      );
    }
  }

  public async updatePlace(guid: string, place: Partial<Place>, file?: Express.Multer.File) {
    // Checked before anything is saved, so a refused logo leaves nothing behind (#2937).
    file = file ? refuseUnsafeImage(file, 'The logo') : file;

    delete place.guid;

    try {
      const existing = await this.pRepo.findOne({
        where: {
          guid
        },
        relations: { logos: true }
      });

      if (!existing) {
        throw new NotFoundException();
      }

      let links: Array<Partial<PlaceLink>> = [];
      const visibilitySettings = this._deserializeStringifiedJSON(place.visibilitySettings as unknown as string);

      if (place.links && place.links.length > 0) {
        // Because the payload is formData, we need to parse the stringified JSON
        const parsed: Array<Partial<PlaceLink>> = JSON.parse(place.links as unknown as string);

        links = parsed.map((newOrOld) => {
          if (newOrOld.guid) {
            return newOrOld;
          } else {
            delete newOrOld.guid;

            return this.plRepo.create({ ...newOrOld });
          }
        });
      }

      let logoImage;

      if (file != null || file != undefined) {
        try {
          logoImage = await this._saveImage(file);
        } catch (err) {
          rethrowHttp(err, new InternalServerErrorException('Could not save place logo.'), () =>
            Logger.error(err.message, 'PlaceService')
          );
        }
      }

      // A place as saved, whose logos may be left out: without a new logo they are, and stay as they are.
      const toSave: DeepPartial<Place> = {
        ...existing,
        ...place,
        links: links,
        logos: [logoImage],
        visibilitySettings
      };

      if (logoImage === undefined) {
        delete toSave.logos;
      }

      const updated = await this.pRepo.save(toSave);

      return updated;
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err), () =>
        Logger.error(`Error updating place, ${err.message}`, 'PlaceService')
      );
    }
  }

  public override async deleteEntities(oneOrMoreEntityGuids: Array<string> | string): Promise<DeleteResult> {
    const guids = typeof oneOrMoreEntityGuids === 'string' ? oneOrMoreEntityGuids.split(',') : oneOrMoreEntityGuids;
    let logos: Array<Asset> = [];

    try {
      // Awaited, so a failed delete lands in the catch below; the logos go by guid and their files after commit (#2205).
      const result = await this.pRepo.manager.transaction(async (manager) => {
        const places = await manager.find(Place, {
          where: {
            guid: In(guids)
          },
          relations: { logos: true }
        });

        // A broadcast's place has no cascade, so the database refused the delete and the API answered a bare 500 the admin
        // form could not explain (#3397). Refused first, with the broadcasts named, as the class and rubric services refuse.
        const broadcasts = await manager.find(EventBroadcast, { where: { place: { guid: In(guids) } } });

        if (broadcasts.length > 0) {
          throw new ConflictException(inUseByBroadcasts(places, broadcasts));
        }

        // `logos` is loaded by this find's `relations`.
        logos = places.flatMap((place) => place.logos!);

        await this.assetService.deleteAssets(manager, logos);

        const eventLocationsForPlace = await manager.find(EventLocation, {
          where: {
            place: In(guids)
          }
        });

        eventLocationsForPlace.forEach((el) => {
          el.place = null;
        });

        await manager.save(eventLocationsForPlace);

        return manager.delete(Place, guids);
      });

      await this.assetService.deleteAssetFiles(logos);

      return result;
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not delete entities.'), () =>
        Logger.error(err.message, 'PlaceService.deleteEntities')
      );
    }
  }

  private async _saveImage(file) {
    return this.assetService.saveAsset(this._resourcePath, file, 'place-logo');
  }

  private _deserializeStringifiedJSON(value: string) {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value !== 'string') {
      return value;
    }

    return JSON.parse(value);
  }
}

/**
 * Why places cannot be deleted while broadcasts still name them (#3397): the places, how many broadcasts, and which, so
 * the admin form can say what to change first.
 */
export function inUseByBroadcasts(
  places: Array<Pick<Place, 'name'>>,
  broadcasts: Array<Pick<EventBroadcast, 'name'>>
): string {
  const placeNames = places.map((place) => place.name || 'This place').join(', ');
  const names = broadcasts
    .map((broadcast) => broadcast.name || 'an unnamed broadcast')
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  const count = broadcasts.length === 1 ? '1 broadcast' : `${broadcasts.length} broadcasts`;

  return `${placeNames} ${places.length > 1 ? 'are' : 'is'} used by ${count} (${names.join(', ')}). Give ${
    broadcasts.length === 1 ? 'it' : 'them'
  } another place first.`;
}
