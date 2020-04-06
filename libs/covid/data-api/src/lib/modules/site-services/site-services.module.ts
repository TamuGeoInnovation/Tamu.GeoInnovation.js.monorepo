import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SiteServiceType } from '@tamu-gisc/covid/common/entities';

import { SiteServicesService } from './site-services.service';
import { SiteServicesController } from './site-services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteServiceType])],
  providers: [SiteServicesService],
  controllers: [SiteServicesController]
})
export class SiteServicesModule {}
