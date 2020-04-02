import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PhoneNumberType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class PhoneNumberTypesService extends BaseService<PhoneNumberType> {
  constructor(@InjectRepository(PhoneNumberType) public repo: Repository<PhoneNumberType>) {
    super(repo);
  }
}
