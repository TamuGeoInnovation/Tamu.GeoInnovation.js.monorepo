import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SiteStatus } from '@tamu-gisc/covid/common/entities';

import { SiteStatusesService } from './site-statuses.service';
import { SiteStatusesController } from './site-statuses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteStatus])],
  providers: [SiteStatusesService],
  controllers: [SiteStatusesController]
})
export class SiteStatusesModule {}
