import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRsvpController } from './user-rsvp.controller';
import { UserRsvpProvider } from './user-rsvp.provider';
import { RsvpDashboardProvider } from './rsvp-dashboard.provider';
import { Event, Organization, RsvpType, University, UserRsvp } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRsvp, Event, RsvpType, University, Organization])],
  controllers: [UserRsvpController],
  providers: [UserRsvpProvider, RsvpDashboardProvider]
})
export class UserRsvpModule {}
