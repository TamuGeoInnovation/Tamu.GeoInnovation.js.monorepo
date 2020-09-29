import { Controller } from '@nestjs/common';
import { RsvpType } from '../../entities/all.entity';
import { BaseController } from '../_base/base.controller';
import { RsvpTypeProvider } from '../../providers/rsvp-type/rsvp-type.provider';

@Controller('rsvp-type')
export class RsvpTypeController extends BaseController<RsvpType> {
  constructor(private readonly rsvpTypeProvider: RsvpTypeProvider) {
    super(rsvpTypeProvider);
  }
}
