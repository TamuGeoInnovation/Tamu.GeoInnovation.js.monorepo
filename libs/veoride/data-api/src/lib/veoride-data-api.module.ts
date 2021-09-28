import { Module } from '@nestjs/common';

import { TripsModule } from './modules/trips/trips.module';
import { StatusChangesModule } from './modules/status-changes/status-changes.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [TripsModule, StatusChangesModule, AuthModule],
  controllers: [],
  providers: [],
  exports: []
})
export class VeorideDataApiModule {}
