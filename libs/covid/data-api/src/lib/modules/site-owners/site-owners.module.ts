import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SiteOwner } from '@tamu-gisc/covid/common/entities';

import { SiteOwnersService } from './site-owners.service';
import { SiteOwnersController } from './site-owners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteOwner])],
  providers: [SiteOwnersService],
  controllers: [SiteOwnersController]
})
export class SiteOwnersModule {}
