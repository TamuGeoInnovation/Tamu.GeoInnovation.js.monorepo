import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRsvpController } from './user-rsvp.controller';
import { UserRsvpProvider } from './user-rsvp.provider';
import { Event, RsvpType, UserRsvp } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRsvp, Event, RsvpType])],
  controllers: [UserRsvpController],
  providers: [UserRsvpProvider]
})
export class UserRsvpModule {}
