import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkshopsModule, SnapshotsModule, ResponsesModule, LayersModule } from '@tamu-gisc/cpa/data-api';

import { config } from '../environments/environment';

@Module({
  imports: [TypeOrmModule.forRoot(config), WorkshopsModule, SnapshotsModule, ResponsesModule, LayersModule]
})
export class AppModule {}
