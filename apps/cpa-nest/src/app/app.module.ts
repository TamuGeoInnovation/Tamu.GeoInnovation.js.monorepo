import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkshopsModule, SnapshotsModule, ResponsesModule, LayersModule, ScenariosModule } from '@tamu-gisc/cpa/data-api';

import { config } from '../environments/environment';

@Module({
  imports: [TypeOrmModule.forRoot(config), WorkshopsModule, SnapshotsModule, ResponsesModule, LayersModule, ScenariosModule]
})
export class AppModule {}
