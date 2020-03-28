import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestingSite, ValidatedTestingSite, User, Source } from '@tamu-gisc/covid/common/entities';

import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestingSite, ValidatedTestingSite, User, Source])],
  providers: [SitesService],
  controllers: [SitesController]
})
export class SitesModule {}
