import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SiteService } from '@tamu-gisc/covid/common/entities';

import { SiteServicesService } from './site-services.service';
import { SiteServicesController } from './site-services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteService])],
  providers: [SiteServicesService],
  controllers: [SiteServicesController]
})
export class SiteServicesModule {}
