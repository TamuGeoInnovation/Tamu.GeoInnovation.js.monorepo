import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckInController } from './check-in.controller';
import { CheckInProvider } from './check-in.provider';
import { CheckInDashboardProvider } from './check-in-dashboard.provider';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { CheckIn, Event, Organization, University, UserRsvp } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn, Event, UserRsvp, University, Organization])],
  controllers: [CheckInController],
  providers: [CheckInProvider, CheckInDashboardProvider, DashboardProfilesService]
})
export class CheckInModule {}
