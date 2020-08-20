import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkshopsModule, ScenariosModule, ResponsesModule } from '@tamu-gisc/cpa/data-api';

import { config } from '../environments/environment';

@Module({
  imports: [TypeOrmModule.forRoot(config), WorkshopsModule, ScenariosModule, ResponsesModule]
})
export class AppModule {}
