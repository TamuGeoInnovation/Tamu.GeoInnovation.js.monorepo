import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RsvpTypeRepo } from '../../entities/all.entity';
import { RsvpTypeController } from '../../controllers/rsvp-type/rsvp-type.controller';
import { RsvpTypeProvider } from '../../providers/rsvp-type/rsvp-type.provider';

@Module({
  imports: [TypeOrmModule.forFeature([RsvpTypeRepo])],
  controllers: [RsvpTypeController],
  providers: [RsvpTypeProvider],
  exports: []
})
export class RsvpTypeModule {}
