import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Website, County } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class WebsitesService extends BaseService<Website> {
  constructor(
    @InjectRepository(Website) public repo: Repository<Website>,
    @InjectRepository(County) public countyRepo: Repository<County>
  ) {
    super(repo);
  }

  public async getWebsitesForCounty(countyFips: number) {
    if (countyFips === undefined || typeof countyFips !== 'string') {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
    }

    const websites = await this.repo.find({
      where: {
        county: countyFips
      },
      relations: ['type']
    });

    return websites;
  }

  public async setWebsitesForCounty(websites: Website[], countyFips: number) {
    const county = await this.countyRepo.findOne({
      where: {
        countyFips: countyFips
      }
    });

    if (!county) {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
    }

    const sites = await this.repo.find({
      where: {
        county
      }
    });

    // Diff provided numbers and existing numbers.
    // Filter out removed numbers and add new ones.
    const filteredWebsites = websites.reduce(
      (acc, curr) => {
        if (curr.guid === undefined || curr.guid === null) {
          acc.new.push(curr);
        } else {
          const exists = sites.find((cph) => cph.guid === curr.guid);

          if (exists) {
            acc.update.push(exists);
          }
        }

        return acc;
      },
      { new: [], update: [] } as { new: Array<Partial<Website>>; update: Array<Website> }
    );

    const newWebsites = filteredWebsites.new.map((website) => {
      return this.repo.create({ url: website.url, type: website.type });
    });

    const updatedWebsites = filteredWebsites.update.map((filteredExisting) => {
      const provided = websites.find((n) => n.guid === filteredExisting.guid);

      filteredExisting.url = provided.url;
      filteredExisting.type = provided.type;

      return filteredExisting;
    });

    county.websites = [...newWebsites, ...updatedWebsites];

    return county.save();
  }
}
