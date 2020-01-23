import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkshopsModule, ScenariosModule } from '@tamu-gisc/cpa/data-api';

import { config } from '../environments/ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(config), WorkshopsModule, ScenariosModule]
})
export class AppModule {}
