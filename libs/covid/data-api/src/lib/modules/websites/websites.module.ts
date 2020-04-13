import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { County, CountyClaim, CategoryValue, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';
import { WebsitesController } from './websites.controller';
import { WebsitesService } from './websites.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryValue, County, CountyClaim, CountyClaimInfo])],
  controllers: [WebsitesController],
  providers: [WebsitesService]
})
export class WebsitesModule {}
