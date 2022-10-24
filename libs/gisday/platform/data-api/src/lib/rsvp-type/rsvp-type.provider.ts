import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { RsvpType } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class RsvpTypeProvider extends BaseProvider<RsvpType> {
  constructor(@InjectRepository(RsvpType) private rsvpTypeRepo: Repository<RsvpType>) {
    super(rsvpTypeRepo);
  }
}
