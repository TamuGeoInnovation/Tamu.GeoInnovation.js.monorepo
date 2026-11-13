import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRsvpController } from './user-rsvp.controller';
import { UserRsvpProvider } from './user-rsvp.provider';
import { RsvpDashboardProvider } from './rsvp-dashboard.provider';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { Event, Organization, RsvpType, University, UserRsvp } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRsvp, Event, RsvpType, University, Organization])],
  controllers: [UserRsvpController],
  providers: [UserRsvpProvider, RsvpDashboardProvider, DashboardProfilesService]
})
export class UserRsvpModule {}
