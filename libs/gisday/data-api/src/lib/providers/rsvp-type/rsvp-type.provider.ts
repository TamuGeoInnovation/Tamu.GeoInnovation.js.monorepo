import { Injectable } from '@nestjs/common';
import { RsvpType, RsvpTypeRepo } from '../../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class RsvpTypeProvider extends BaseProvider<RsvpType> {
  constructor(private readonly rsvpTypeRepo: RsvpTypeRepo) {
    super(rsvpTypeRepo);
  }
}
