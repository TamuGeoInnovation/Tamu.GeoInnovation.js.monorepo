import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Sites } from '@tamu-gisc/two/common';

import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sites])],
  controllers: [SitesController],
  providers: [SitesService]
})
export class SitesModule {}
