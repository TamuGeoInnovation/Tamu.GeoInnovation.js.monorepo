import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class OrganizationService extends BaseProvider<Organization> {
  constructor(@InjectRepository(Organization) private orgRepo: Repository<Organization>) {
    super(orgRepo);
  }

  public async insertOrganization(organization: Partial<Organization>, file?: Express.Multer.File) {
    return this.orgRepo.save(organization);
  }
}
