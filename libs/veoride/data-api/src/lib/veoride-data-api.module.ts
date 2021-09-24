import { Module } from '@nestjs/common';

import { TripsModule } from './modules/trips/trips.module';
import { StatusChangesModule } from './modules/status-changes/status-changes.module';

@Module({
  imports: [TripsModule, StatusChangesModule],
  controllers: [],
  providers: [],
  exports: []
})
export class VeorideDataApiModule {}
