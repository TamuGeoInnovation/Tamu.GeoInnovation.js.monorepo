import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserInfoController } from './user-info.controller';
import { Organization, Season, University, UserInfo } from '../entities/all.entity';
import { UserInfoProvider } from './user-info.provider';
import { AccountDashboardProvider } from './account-dashboard.provider';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserInfo, University, Organization, Season])],
  providers: [UserInfoProvider, AccountDashboardProvider, DashboardProfilesService],
  controllers: [UserInfoController],
  exports: []
})
export class UserInfoModule {}
