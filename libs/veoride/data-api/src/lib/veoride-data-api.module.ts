import { Module } from '@nestjs/common';
import { TripsModule } from './modules/trips/trips.module';
import { StatusChangesModule } from './modules/status-changes/status-changes.module';

@Module({
  controllers: [],
  providers: [],
  exports: [],
  imports: [TripsModule, StatusChangesModule]
})
export class VeorideDataApiModule {}
