import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sponsor } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { AssetsService } from '../assets/assets.service';
@Injectable()
export class SponsorProvider extends BaseProvider<Sponsor> {
  private _resourcePath = `images/sponsors`;

  constructor(
    @InjectRepository(Sponsor) private sponsorRepo: Repository<Sponsor>,
    private readonly assetService: AssetsService
  ) {
    super(sponsorRepo);
  }

  public async createSponsor(sponsor: Partial<Sponsor>, file?: Express.Multer.File) {
    const sponsorEnt = this.sponsorRepo.create({
      ...sponsor
    });

    if (sponsorEnt) {
      const savedEntity = await sponsorEnt.save();

      if (file != null || file != undefined) {
        try {
          const savedLogo = await this._saveImage(file);

          savedEntity.logos = [savedLogo];

          return savedEntity.save();
        } catch (err) {
          Logger.error(err.message, 'SponsorProvider');
          throw new InternalServerErrorException('Could not save sponsor logo.');
        }
      } else {
        return savedEntity;
      }
    } else {
      throw new UnprocessableEntityException(null, 'Could not create sponsor.');
    }
  }

  public async updateSponsor(guid: string, incoming: Partial<Sponsor>, file?: Express.Multer.File) {
    delete incoming.guid;

    const existing = await this.sponsorRepo.findOne({
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
          Logger.error(err.message, 'SponsorProvider');
          throw new InternalServerErrorException('Could not save sponsor logo.');
        }
      }

      return this.sponsorRepo.save({
        ...existing,
        ...incoming,
        logos: [logoImage]
      });
    } else {
      throw new NotFoundException();
    }
  }

  private async _saveImage(file) {
    return this.assetService.saveAsset(this._resourcePath, file, 'sponsor-logo');
  }
}
