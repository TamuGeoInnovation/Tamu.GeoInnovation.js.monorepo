import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WebsiteType } from '@tamu-gisc/covid/common/entities';

import { WebsiteTypesService } from './website-types.service';
import { WebsiteTypesController } from './website-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WebsiteType])],
  providers: [WebsiteTypesService],
  controllers: [WebsiteTypesController]
})
export class WebsiteTypesModule {}
