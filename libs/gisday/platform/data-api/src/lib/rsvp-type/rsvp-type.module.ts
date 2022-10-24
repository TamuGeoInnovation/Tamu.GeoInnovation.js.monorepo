import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RsvpType } from '../entities/all.entity';
import { RsvpTypeController } from './rsvp-type.controller';
import { RsvpTypeProvider } from './rsvp-type.provider';

@Module({
  imports: [TypeOrmModule.forFeature([RsvpType])],
  controllers: [RsvpTypeController],
  providers: [RsvpTypeProvider],
  exports: []
})
export class RsvpTypeModule {}
