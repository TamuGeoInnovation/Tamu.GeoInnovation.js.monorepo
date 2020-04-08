import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Website, County } from '@tamu-gisc/covid/common/entities';
import { WebsitesController } from './websites.controller';
import { WebsitesService } from './websites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Website, County])],
  controllers: [WebsitesController],
  providers: [WebsitesService]
})
export class WebsitesModule {}
