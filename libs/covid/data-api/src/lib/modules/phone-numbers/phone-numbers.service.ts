import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PhoneNumber, PhoneNumberType, County } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class PhoneNumbersService extends BaseService<PhoneNumber> {
  constructor(
    @InjectRepository(PhoneNumber) public repo: Repository<PhoneNumber>,
    @InjectRepository(PhoneNumberType) public phoneTypeRepo: Repository<PhoneNumberType>,
    @InjectRepository(County) public countyRepo: Repository<County>
  ) {
    super(repo);
  }

  public async insertPhoneNumber(number: string, typeGuid?: string) {
    // Identify phone number type if one is provided
    const phoneType = await this.phoneTypeRepo.findOne({ guid: typeGuid });

    return this.repo.create({ number: number, type: phoneType }).save();
  }

  public async setPhoneNumbersForCounty(numbers: Array<Partial<PhoneNumber>>, countyFips: number) {
    const county = await this.countyRepo.findOne({
      where: {
        countyFips: countyFips
      },
      relations: ['phoneNumbers', 'phoneNumbers.type']
    });

    if (!county) {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
    }

    // Diff provided numbers and existing numbers.
    // Filter out removed numbers and add new ones.
    const filteredNumbers = numbers.reduce(
      (acc, curr) => {
        if (curr.guid === undefined || curr.guid === null) {
          acc.new.push(curr);
        } else {
          const exists = county.phoneNumbers.find((cph) => cph.guid === curr.guid);

          if (exists) {
            acc.update.push(exists);
          }
        }

        return acc;
      },
      { new: [], update: [] } as { new: Array<Partial<PhoneNumber>>; update: Array<PhoneNumber> }
    );

    const newNumbers = filteredNumbers.new.map((number) => {
      return this.repo.create({ number: number.number, type: number.type });
    });

    const updatedNumbers = filteredNumbers.update.map((filteredExisting) => {
      const provided = numbers.find((n) => n.guid === filteredExisting.guid);

      filteredExisting.number = provided.number;
      filteredExisting.type = provided.type;

      return filteredExisting;
    });

    county.phoneNumbers = [...newNumbers, ...updatedNumbers];

    return county.save();
  }

  public async getPhoneNumbersForCounties(countyFips) {
    return this.repo.find({
      where: {
        county: countyFips
      },
      relations: ['type']
    });
  }
}
