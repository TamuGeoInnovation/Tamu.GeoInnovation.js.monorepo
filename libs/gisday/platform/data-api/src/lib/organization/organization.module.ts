import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset, Organization, OrganizationLink } from '../entities/all.entity';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { AssetsService } from '../assets/assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Asset, OrganizationLink])],
  controllers: [OrganizationController],
  providers: [OrganizationService, AssetsService]
})
export class OrganizationModule {}
